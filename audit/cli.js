#!/usr/bin/env node
"use strict";
/**
 * 監査用コマンド。
 *   node audit/cli.js fetch <url> [キーワード...]      1ページ取得して該当箇所を表示
 *   node audit/cli.js batch <jsonファイル>             複数URLをまとめて取得
 *   node audit/cli.js search <url> <キーワード...>     キャッシュ済み本文を検索（再取得しない）
 *   node audit/cli.js links <url> [絞り込み語...]      ページ内のリンク一覧
 * 取得した本文は audit/cache/ に保存され、次回以降は再取得しない（--force で強制取得）。
 */
const fs = require("node:fs");
const { fetchPage, verdict } = require("./lib/fetch.js");
const { search } = require("./lib/extract.js");

const argv = process.argv.slice(2);
const cmd = argv[0];
const force = argv.includes("--force");
const args = argv.slice(1).filter((a) => a !== "--force");

function report(url, kws, { quiet = false } = {}) {
  const r = fetchPage(url, { force });
  const v = verdict(r);
  console.log(`\n■ ${url}`);
  console.log(`  結果: ${v}${r.fromCache ? "（キャッシュ）" : ""}  ${r.bytes}B${r.finalUrl && r.finalUrl !== url ? `  → ${r.finalUrl}` : ""}`);
  if (!r.extracted) return { r, v, hits: 0 };
  console.log(`  文字コード: ${r.extracted.encoding}  本文${r.extracted.lines.length}行  画像${r.extracted.images.length}件  リンク${r.extracted.links.length}件  PDF${r.extracted.pdfs.length}件`);
  let hits = 0;
  if (kws.length) {
    const res = search(r.extracted.lines, kws, 1);
    hits = res.matchedLineNumbers.length;
    console.log(`  キーワード一致: ${hits}行`);
    if (!quiet) for (const e of res.excerpt) console.log(`    ${String(e.line).padStart(4)}: ${e.text.slice(0, 160)}`);
  }
  return { r, v, hits };
}

if (cmd === "fetch") {
  report(args[0], args.slice(1));
} else if (cmd === "batch") {
  const list = JSON.parse(fs.readFileSync(args[0], "utf8"));
  const summary = [];
  for (const t of list) {
    const { v, hits } = report(t.url, t.keywords || [], { quiet: t.quiet !== false });
    summary.push({ label: t.label || t.url, url: t.url, verdict: v, hits });
  }
  console.log("\n===== まとめ =====");
  for (const s of summary) console.log(`  ${s.hits > 0 ? "◎" : " "} ${String(s.label).padEnd(22)} ${s.verdict.padEnd(22)} 一致${s.hits}行`);
} else if (cmd === "search") {
  const r = fetchPage(args[0], {});
  if (!r.extracted) { console.log("本文がキャッシュにありません"); process.exit(1); }
  const res = search(r.extracted.lines, args.slice(1), 2);
  console.log(`一致 ${res.matchedLineNumbers.length}行 / 全${r.extracted.lines.length}行`);
  for (const e of res.excerpt) console.log(`${String(e.line).padStart(5)}: ${e.text}`);
} else if (cmd === "links") {
  const r = fetchPage(args[0], { force });
  if (!r.extracted) { console.log("本文を取得できません"); process.exit(1); }
  const f = args.slice(1);
  const seen = new Set();
  for (const l of r.extracted.links) {
    if (f.length && !f.some((k) => l.href.includes(k) || l.text.includes(k))) continue;
    const key = l.href + "|" + l.text;
    if (seen.has(key)) continue; seen.add(key);
    console.log(`${l.href}\n    → ${l.text.slice(0, 80)}`);
  }
} else {
  console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(3, 11).join("\n"));
}
