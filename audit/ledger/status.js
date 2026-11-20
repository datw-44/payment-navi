"use strict";
/**
 * 監査の進捗を表示する。 node audit/ledger/status.js [--kind benefit|candidate] [--status 未確認] [--store <storeId>]
 */
const fs = require("node:fs");
const { LEDGER, STATUSES } = require("./build.js");

if (!fs.existsSync(LEDGER)) { console.error("台帳がありません。先に node audit/ledger/build.js を実行してください。"); process.exit(1); }
const L = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const fKind = opt("--kind"), fStatus = opt("--status"), fStore = opt("--store");

let rows = Object.entries(L.items).map(([id, v]) => ({ id, ...v }));
if (fKind) rows = rows.filter((r) => r.kind === fKind);
if (fStatus) rows = rows.filter((r) => r.audit.status === fStatus);
if (fStore) rows = rows.filter((r) => r.storeId === fStore);

const tally = (list) => STATUSES.reduce((a, s) => (a[s] = list.filter((r) => r.audit.status === s).length, a), {});
const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) : "0.0");

const all = Object.values(L.items);
const benefits = all.filter((r) => r.kind === "benefit");
const cands = all.filter((r) => r.kind === "candidate");

console.log("お支払いナビ 監査進捗");
console.log(`  台帳生成: ${L.meta.generatedAt}`);
console.log(`  対象: 店舗 ${L.meta.counts.stores} / 支払い候補 ${L.meta.counts.candidates} / 定例特典 ${L.meta.counts.benefits}（合計 ${L.meta.counts.items} 行）`);
console.log("");
const show = (label, list) => {
  const t = tally(list);
  const done = list.length - t["未確認"];
  console.log(`  ${label}（${list.length}件）  確認着手 ${done}件 = ${pct(done, list.length)}%`);
  console.log(`      一致 ${t["一致"]} / 不一致 ${t["不一致"]} / 一部確認 ${t["一部確認"]} / 未確認 ${t["未確認"]}`);
};
show("定例特典", benefits);
show("支払い候補", cands);
show("全体", all);
console.log("");
console.log(`  店舗別の対応決済（acceptance）: ${L.meta.counts.acceptanceStores}店舗 / 掲載時点 ${L.meta.acceptanceCheckedAt}`);
const accT = tally(Object.values(L.acceptance));
console.log(`      一致 ${accT["一致"]} / 不一致 ${accT["不一致"]} / 一部確認 ${accT["一部確認"]} / 未確認 ${accT["未確認"]}`);
console.log("");
console.log(`  本番表示の承認記録（別管理・変更しない）: verification-records ${L.meta.verificationRecords.total}件`);
console.log(`      status=${JSON.stringify(L.meta.verificationRecords.byStatus)} displayApproval付き=${L.meta.verificationRecords.withDisplayApproval}件`);
console.log(`  運営メモ dataMemos: ${L.meta.dataMemoCount}件`);

// 条件項目ごとの確認状況
const { CHECKS } = require("../lib/checks.js");
console.log("\n  条件項目ごとの確認状況（全784行）");
for (const c of CHECKS) {
  const t = { 確認済み: 0, 相違: 0, 記載不足: 0, 未確認: 0 };
  for (const r of all) {
    if (c.onlyFor && r.kind !== c.onlyFor) continue;
    t[(r.audit.checks || {})[c.key] || "未確認"]++;
  }
  const scope = c.onlyFor === "benefit" ? "（定例特典のみ）" : "";
  console.log(`    ${c.label}${scope}`.padEnd(34) + `確認済み ${String(t.確認済み).padStart(3)} / 相違 ${t.相違} / 記載不足 ${t.記載不足} / 未確認 ${t.未確認}`);
}
const shortfall = all.filter((r) => (r.audit.shortfalls || []).length > 0);
if (shortfall.length) {
  console.log(`\n  公式が必須としているのに掲載に無い条件がある項目: ${shortfall.length}件`);
  for (const r of shortfall) console.log(`    ${r.storeName} / ${r.cardName} → ${r.audit.shortfalls.join("、")}`);
}

const needFix = all.filter((r) => (r.audit.fixes || []).length > 0);
if (needFix.length) {
  console.log(`\n  修正候補のある項目: ${needFix.length}件`);
  for (const r of needFix) console.log(`    [${r.audit.status}] ${r.storeName} / ${r.cardName} → ${r.audit.fixes.length}件`);
}
const blocked = all.filter((r) => r.audit.fetchFailure);
if (blocked.length) {
  console.log(`\n  公式情報を取得できていない項目: ${blocked.length}件`);
  for (const r of blocked) console.log(`    ${r.storeName} / ${r.cardName}`);
}
if (fKind || fStatus || fStore) {
  console.log(`\n  --- 絞り込み結果 ${rows.length}件 ---`);
  for (const r of rows.slice(0, 60)) console.log(`    [${r.audit.status}] ${r.storeId} / ${r.cardName}`);
  if (rows.length > 60) console.log(`    … 他 ${rows.length - 60}件`);
}
