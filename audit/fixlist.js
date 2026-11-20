#!/usr/bin/env node
"use strict";
/**
 * 公開前の確認に使う修正一覧を作る。
 *   node audit/fixlist.js
 *
 * 不一致・記載不足を、対応の性質ごとに3つに分けて出力する:
 *   A 公式と明確に矛盾する        … 掲載内容が公式と食い違う。直すべき箇所が確定している
 *   B 重要な条件が掲載されていない … 書いてある内容は正しいが、必須条件が欠けている
 *   C 公式根拠が足りず判定を保留   … 疑わしいが、公式で確定できていない
 *
 * 本番データは変更しない。出力は audit/reports/fixlist.md。
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const L = JSON.parse(fs.readFileSync(path.join(__dirname, "ledger/ledger.json"), "utf8"));

const A = [], B = [], C = [];
for (const [id, it] of Object.entries(L.items)) {
  const a = it.audit, ch = a.checks || {};
  const hasConflict = Object.values(ch).includes("相違");
  const hasShortfall = Object.values(ch).includes("記載不足");
  const row = { id, store: it.storeName, card: it.cardName, kind: it.kind, status: a.status,
                urls: a.officialUrls || [], checkedAt: a.checkedAt,
                mismatches: a.mismatches || [], fixes: a.fixes || [],
                shortfalls: a.shortfalls || [], checkNote: a.checkNote || "",
                evidence: (a.evidence || []).slice(0, 4) };
  if (hasConflict) A.push(row);
  else if (hasShortfall) B.push(row);
  else if ((a.fixes || []).length) C.push(row);
}
const order = (x) => (x.kind === "benefit" ? 0 : 1);
[A, B, C].forEach((g) => g.sort((x, y) => order(x) - order(y) || x.store.localeCompare(y.store, "ja")));

const sec = (title, lead, rows) => [
  `## ${title}（${rows.length}件）`, "", lead, "",
  ...(rows.length ? rows.flatMap((r) => [
    `### ${r.store} / ${r.card}${r.kind === "benefit" ? "　【定例特典】" : ""}`, "",
    ...(r.mismatches.length ? ["**公式との食い違い**", "", ...r.mismatches.map((m) => `- ${m}`), ""] : []),
    ...(r.shortfalls.length ? [`**掲載に無い必須条件**: ${r.shortfalls.join("、")}`, ""] : []),
    ...(r.fixes.length ? ["**修正案**", "", ...r.fixes.map((f) => `- ${f}`), ""] : []),
    ...(r.evidence.length ? ["<details><summary>公式本文からの引用</summary>", "", ...r.evidence.map((e) => `> ${e}`), "", "</details>", ""] : []),
    `出典: ${r.urls.join(" / ") || "（なし）"}`, `確認日時: ${r.checkedAt || "（なし）"}`, "",
  ]) : ["- 該当なし", ""]),
].join("\n");

const today = new Date().toISOString().slice(0, 10);
const md = [
  `# お支払いナビ 修正一覧（${today}）`, "",
  "公開前の確認用です。**本番データはまだ変更していません。**", "",
  `対象 ${L.meta.counts.items}件のうち、一致 ${Object.values(L.items).filter((v) => v.audit.status === "一致").length} / ` +
  `不一致 ${Object.values(L.items).filter((v) => v.audit.status === "不一致").length} / ` +
  `一部確認 ${Object.values(L.items).filter((v) => v.audit.status === "一部確認").length} / ` +
  `未確認 ${Object.values(L.items).filter((v) => v.audit.status === "未確認").length}`, "",
  "---", "",
  sec("A. 公式と明確に矛盾する", "公式本文と掲載内容が食い違っています。直すべき箇所が確定しており、**優先して修正すべき項目**です。", A),
  "---", "",
  sec("B. 重要な条件が掲載されていない", "書いてある内容は正しいのですが、公式が必須としている条件が抜けています。このままだと読者が特典を受け損ねます。", B),
  "---", "",
  sec("C. 公式根拠が足りず判定を保留", "疑わしい点はありますが、公式で確定できていません。**推測で修正してはいけない項目**です。", C),
].join("\n");

fs.mkdirSync(path.join(__dirname, "reports"), { recursive: true });
const out = path.join(__dirname, "reports", "fixlist.md");
fs.writeFileSync(out, md + "\n");
console.log(`修正一覧を書き出しました: ${path.relative(ROOT, out)}`);
console.log(`  A 公式と明確に矛盾する: ${A.length}件`);
console.log(`  B 重要な条件が掲載されていない: ${B.length}件`);
console.log(`  C 公式根拠が足りず保留: ${C.length}件`);
