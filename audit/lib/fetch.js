"use strict";
/**
 * 公式ページの取得。取得した生HTMLは audit/cache/ に保存して再利用する
 * （同じページを毎回取り直さない）。HTTPSはこの環境のプロキシ経由になるため
 * curl を使う。node の fetch はプロキシ設定を自動では読まない。
 */
const { execFileSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { extract } = require("./extract.js");

const CACHE_DIR = path.join(__dirname, "..", "cache");
const UA = "Mozilla/5.0 (compatible; PaymentNaviAudit/1.0)";

function keyOf(url) { return crypto.createHash("sha1").update(url).digest("hex").slice(0, 16); }

/**
 * @param {string} url
 * @param {{force?:boolean, timeoutSec?:number}} opts
 * @returns {{url:string, status:number|null, error:string|null, bytes:number,
 *            fromCache:boolean, cachePath:string, finalUrl:string|null, extracted:object|null}}
 */
function fetchPage(url, opts = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const k = keyOf(url);
  const bodyPath = path.join(CACHE_DIR, `${k}.body`);
  const metaPath = path.join(CACHE_DIR, `${k}.json`);

  if (!opts.force && fs.existsSync(bodyPath) && fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const buf = fs.readFileSync(bodyPath);
    return { ...meta, fromCache: true, cachePath: bodyPath, bytes: buf.length,
             extracted: buf.length ? extract(buf) : null };
  }

  let status = null, error = null, finalUrl = null;
  try {
    const out = execFileSync("curl", [
      "-sS", "--http1.1", "--compressed", "--location",
      "--max-time", String(opts.timeoutSec || 40),
      "-A", UA, "-o", bodyPath, "-w", "%{http_code}|%{url_effective}", url,
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const [code, eff] = out.trim().split("|");
    status = Number(code) || null;
    finalUrl = eff || null;
  } catch (e) {
    error = String((e.stderr || e.message || "")).trim().split("\n").slice(-1)[0];
    if (!fs.existsSync(bodyPath)) fs.writeFileSync(bodyPath, "");
  }
  const buf = fs.readFileSync(bodyPath);
  const meta = { url, status, error, finalUrl, fetchedAt: new Date().toISOString() };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 1));
  return { ...meta, fromCache: false, cachePath: bodyPath, bytes: buf.length,
           extracted: buf.length ? extract(buf) : null };
}

/** 取得結果の一行要約。403/404/503 を「サイト側の拒否」と「見つからない」に区別する。 */
function verdict(r) {
  if (r.error) return `接続失敗(${r.error})`;
  if (r.status === 200 && r.bytes > 3000) return "取得成功";
  if (r.status === 200) return `200だが本文が小さい(${r.bytes}B)`;
  if (r.status === 403) return "サイトが拒否(403)";
  if (r.status === 404) return "ページなし(404)";
  if (r.status === 503) return "一時的に利用不可(503)";
  return `HTTP ${r.status}`;
}

module.exports = { fetchPage, verdict, CACHE_DIR };
