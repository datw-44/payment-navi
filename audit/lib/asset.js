"use strict";
/**
 * 公式ページ内の画像・PDFを取得して audit/cache/assets/ に保存する。
 *
 * 画像に条件が書かれている公式ページ（西友のお得カレンダーなど）や、
 * 条件が公式PDFにしかない場合に使う。
 * 保存したファイルは Read ツールで直接見る（画像は目で読む／PDFはページ指定で読む）。
 * OCRで機械的に読む場合も、必ず画像そのものと突き合わせて誤読を確認すること。
 */
const { execFileSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ASSET_DIR = path.join(__dirname, "..", "cache", "assets");
const UA = "Mozilla/5.0 (compatible; PaymentNaviAudit/1.0)";

/** Content-Type と先頭バイトから種別を判定する。拡張子は信用しない。 */
function sniff(file, contentType) {
  const b = fs.readFileSync(file, { encoding: null }).subarray(0, 8);
  if (b.subarray(0, 4).toString("latin1") === "%PDF") return "pdf";
  if (b[0] === 0x89 && b.subarray(1, 4).toString("latin1") === "PNG") return "png";
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  if (b.subarray(0, 4).toString("latin1") === "RIFF") return "webp";
  if (b.subarray(0, 5).toString("latin1").includes("<?xml") || b.subarray(0, 4).toString("latin1") === "<svg") return "svg";
  if (b.subarray(0, 3).toString("latin1") === "GIF") return "gif";
  return (contentType || "").includes("pdf") ? "pdf" : "unknown";
}

/**
 * @param {string} url
 * @param {{label?:string, force?:boolean}} opts
 * @returns {{url:string,status:number|null,error:string|null,bytes:number,kind:string,file:string|null,contentType:string|null}}
 */
function fetchAsset(url, opts = {}) {
  fs.mkdirSync(ASSET_DIR, { recursive: true });
  const key = (opts.label ? opts.label.replace(/[^A-Za-z0-9_-]/g, "_") + "-" : "") +
              crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
  const tmp = path.join(ASSET_DIR, key + ".bin");
  const metaPath = path.join(ASSET_DIR, key + ".json");

  if (!opts.force && fs.existsSync(metaPath)) {
    const m = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    if (m.file && fs.existsSync(m.file)) return { ...m, fromCache: true };
  }

  let status = null, error = null, contentType = null;
  try {
    const out = execFileSync("curl", ["-sS", "--http1.1", "--compressed", "--location", "--max-time", "60",
      "-A", UA, "-o", tmp, "-w", "%{http_code}|%{content_type}", url],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const [code, ct] = out.trim().split("|");
    status = Number(code) || null;
    contentType = ct || null;
  } catch (e) {
    error = String(e.stderr || e.message || "").trim().split("\n").slice(-1)[0];
  }
  const bytes = fs.existsSync(tmp) ? fs.statSync(tmp).size : 0;
  let kind = "unknown", file = null;
  if (bytes > 0) {
    kind = sniff(tmp, contentType);
    file = path.join(ASSET_DIR, `${key}.${kind}`);
    fs.renameSync(tmp, file);
  }
  const meta = { url, status, error, bytes, kind, file, contentType, fetchedAt: new Date().toISOString() };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 1));
  return { ...meta, fromCache: false };
}

/**
 * PDFを調べる。返り値の kind で扱いを分ける。
 *
 *   "text"        文字が埋め込まれており、テキストを取り出せた → text をそのまま監査に使える
 *   "image"       文字が埋め込まれていない（スキャンPDF）     → Readツールでページを目視する
 *   "cid-blocked" 文字はあるが日本語CIDマップが無く読めない   → poppler-data を入れるかReadで目視する
 *   "error"       PDFとして開けない
 *
 * 重要: テキストが0文字でも「画像ベース」と決めつけない。
 * pdftotext に Adobe-Japan1 の言語パックが無いと、文字入りPDFでも0文字になる。
 * この取り違えは「取得できなかった」を「存在しない」と誤判定するのと同じ種類の誤り。
 */
function pdfText(file) {
  let info = "", fonts = "", err = "";
  try { info = execFileSync("pdfinfo", [file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { err += String(e.stderr || ""); }
  try { fonts = execFileSync("pdffonts", [file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { err += String(e.stderr || ""); }
  const pages = Number((/^Pages:\s+(\d+)/m.exec(info) || [])[1]) || null;
  const cidBlocked = /Missing language pack/i.test(err + fonts);
  const fontRows = fonts.split("\n").filter((l) => /\S/.test(l)).slice(2);

  let text = "", tool = "pdftotext";
  try {
    text = execFileSync("pdftotext", ["-layout", file, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] })
      .replace(/\f/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  } catch (e) { err += String(e.stderr || ""); }

  const chars = text.replace(/\s/g, "").length;
  let kind;
  if (!pages) kind = "error";
  else if (chars > 50) kind = "text";
  else if (cidBlocked) kind = "cid-blocked";
  else if (fontRows.length === 0) kind = "image";
  else kind = "cid-blocked";

  return {
    tool, kind, pages, text, charCount: chars,
    embeddedFonts: fontRows.length,
    note: kind === "cid-blocked"
      ? "日本語CIDマップが無いためテキストを取り出せない。poppler-data の導入か、Readツールでページを目視すること。画像ベースと決めつけないこと。"
      : kind === "image"
      ? "文字が埋め込まれていないスキャンPDF。Readツールでページを目視すること。"
      : null,
  };
}

module.exports = { fetchAsset, pdfText, ASSET_DIR };
