"use strict";
/**
 * 公式ページのHTMLから「全文テキスト」を作る。
 *
 * 2026-11-19の初回監査で2件の誤判定（ローソン・まいばすけっと）を出した原因を
 * 恒久的に防ぐことがこのモジュールの目的。禁止事項を明文化しておく。
 *
 *   禁止1: img の alt 属性をタグごと捨てること
 *          → ローソンは時間帯別の還元率を alt だけに書いている。
 *   禁止2: 先頭N行で打ち切ること／呼び出し側で head 等により切ること
 *          → まいばすけっとの「毎月20日30日は5倍デー」は118行目にある。
 *   禁止3: 文字コードを utf-8 と決めつけること
 *          → TOHOシネマズは Shift_JIS。
 *
 * extract() は常にページ全体を返す。要約・省略・行数制限は一切行わない。
 */

const ALT_PREFIX = "[IMG_ALT]";
const ARIA_PREFIX = "[ARIA]";
const META_PREFIX = "[META]";
const TITLE_PREFIX = "[TITLE]";

/** charset を宣言から推定して複数候補で復号する。 */
function decode(buf) {
  const head = buf.slice(0, 4096).toString("latin1");
  const m = /charset\s*=\s*["']?\s*([A-Za-z0-9_\-]+)/i.exec(head);
  // TextDecoder が受け付けるのは WHATWG のラベル。"cp932" 等は不可。
  const alias = {
    "shift_jis": "shift_jis", "shift-jis": "shift_jis", "sjis": "shift_jis",
    "x-sjis": "shift_jis", "windows-31j": "shift_jis", "ms932": "shift_jis",
    "cp932": "shift_jis", "csshiftjis": "shift_jis",
    "euc-jp": "euc-jp", "x-euc-jp": "euc-jp", "eucjp": "euc-jp",
    "utf8": "utf-8",
  };
  const tried = [];
  if (m) tried.push(alias[m[1].toLowerCase()] || m[1].toLowerCase());
  for (const c of ["utf-8", "shift_jis", "euc-jp"]) if (!tried.includes(c)) tried.push(c);

  for (const enc of tried) {
    try {
      const dec = new TextDecoder(enc, { fatal: true });
      return { text: dec.decode(buf), encoding: enc };
    } catch (_) { /* 次の候補へ */ }
  }
  return { text: new TextDecoder("utf-8").decode(buf), encoding: "utf-8(replacement)" };
}

function unescapeEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&yen;/g, "¥")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

function attr(tag, name) {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(tag);
  if (!m) return null;
  return unescapeEntities(m[2] !== undefined ? m[2] : m[3]);
}

/**
 * @param {Buffer} buf 生のHTMLバイト列
 * @returns {{text:string, lines:string[], encoding:string, alts:string[],
 *            links:{href:string,text:string}[], images:string[], pdfs:string[], title:string|null}}
 */
function extract(buf) {
  const { text: raw, encoding } = decode(buf);
  let s = raw;

  // 1) 収集フェーズ（除去前に拾う）
  const alts = [];
  const images = [];
  for (const m of s.matchAll(/<img\b[^>]*>/gi)) {
    const a = attr(m[0], "alt");
    if (a && a.trim()) alts.push(a.trim());
    const src = attr(m[0], "src") || attr(m[0], "data-src");
    if (src) images.push(src);
  }
  const links = [];
  const pdfs = [];
  for (const m of s.matchAll(/<a\b[^>]*href\s*=\s*("[^"]*"|'[^']*')[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = unescapeEntities(m[1].slice(1, -1));
    const t = unescapeEntities(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    links.push({ href, text: t });
    if (/\.pdf(\?|#|$)/i.test(href)) pdfs.push(href);
  }
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(s);
  const title = titleMatch ? unescapeEntities(titleMatch[1]).replace(/\s+/g, " ").trim() : null;

  // 2) 本文化フェーズ：alt / aria-label / meta description を本文として残す
  s = s.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, "\n");
  s = s.replace(/<!--[\s\S]*?-->/g, "\n");
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const a = attr(tag, "alt");
    return a && a.trim() ? `\n${ALT_PREFIX} ${a.trim()}\n` : "\n";
  });
  s = s.replace(/<[a-zA-Z][^>]*>/g, (tag) => {
    const a = attr(tag, "aria-label");
    return a && a.trim() ? `\n${ARIA_PREFIX} ${a.trim()}\n` : tag;
  });
  s = s.replace(/<meta\b[^>]*>/gi, (tag) => {
    const n = (attr(tag, "name") || attr(tag, "property") || "").toLowerCase();
    const c = attr(tag, "content");
    return (n === "description" || n === "og:description") && c ? `\n${META_PREFIX} ${c}\n` : "\n";
  });
  if (title) s = `${TITLE_PREFIX} ${title}\n` + s;

  s = s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|tr|h[1-6]|section)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "\n");
  s = unescapeEntities(s);
  s = s.replace(/[ \t 　]+/g, " ");

  const lines = s.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  return { text: lines.join("\n"), lines, encoding, alts, links, images, pdfs, title };
}

/** 全文から keyword を含む行を、前後文脈つきで返す（上限なし）。 */
function search(lines, keywords, context = 2) {
  const want = Array.isArray(keywords) ? keywords : [keywords];
  const keep = new Set();
  const matched = [];
  lines.forEach((l, i) => {
    if (want.some((k) => l.includes(k))) {
      matched.push(i);
      for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) keep.add(j);
    }
  });
  return { matchedLineNumbers: matched, excerpt: [...keep].sort((a, b) => a - b).map((i) => ({ line: i + 1, text: lines[i] })) };
}

module.exports = { extract, search, decode, ALT_PREFIX, ARIA_PREFIX, META_PREFIX, TITLE_PREFIX };
