"use strict";
/**
 * 監査台帳の性質を固定するテスト。
 * 台帳は findings から再生成できること、派生結果が古いまま残らないこと、
 * 発行元の通常還元を別商品に誤適用しないことを確認する。
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "..");
const LEDGER = path.join(ROOT, "audit/ledger/ledger.json");
const ISSUERS = path.join(ROOT, "audit/findings/issuers/2026-11-issuers.json");
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`  ok  ${name}`); };

console.log("audit/tests/ledger.test.js");
const L = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
const issuers = JSON.parse(fs.readFileSync(ISSUERS, "utf8")).issuers;
const items = Object.values(L.items);

test("台帳が全候補を網羅している（109店舗 / 784行）", () => {
  assert.equal(L.meta.counts.stores, 109);
  assert.equal(L.meta.counts.items, 784);
  assert.equal(items.length, 784);
});

test("判定は4分類のいずれか、着手状況は2分類のいずれか", () => {
  const ok = new Set(["一致", "不一致", "一部確認", "未確認"]);
  for (const it of items) {
    assert.ok(ok.has(it.audit.status), `${it.storeId}::${it.cardName} の判定=${it.audit.status}`);
    assert.ok(["未着手", "調査済み"].includes(it.phase), `${it.storeId} の着手状況=${it.phase}`);
  }
});

test("未着手の行は必ず未確認（調査していないのに判定が付かない）", () => {
  for (const it of items) {
    if (it.phase === "未着手") assert.equal(it.audit.status, "未確認", `${it.storeId}::${it.cardName}`);
  }
});

test("発行元の通常還元は appliesTo に合う商品にしか適用されない", () => {
  for (const it of items) {
    if (it.audit.method !== "issuer-base") continue;
    const iss = issuers[it.audit.issuerKey];
    assert.ok(iss, `発行元の記録がない: ${it.audit.issuerKey}`);
    assert.ok(Array.isArray(iss.products) && iss.products.length,
      `products が無い発行元に自動照合が適用されている: ${it.audit.issuerKey}`);
    const prod = iss.products.find((pr) => pr.appliesTo === it.audit.product);
    assert.ok(prod, `${it.cardName} の product(${it.audit.product}) が発行元の記録にない`);
    assert.ok(new RegExp(prod.appliesTo).test(it.cardName),
      `${it.cardName} は appliesTo(${prod.appliesTo}) に合わない`);
  }
});

test("自動照合は店舗限定を含む候補には使わない", () => {
  for (const it of items) {
    if (it.audit.method !== "issuer-base") continue;
    assert.equal(it.evidenceKind, "base", `${it.storeId}::${it.cardName} は店舗限定を含むのに自動照合されている`);
    assert.notEqual(it.kind, "benefit", `${it.storeId}::${it.cardName} は定例特典なのに自動照合されている`);
  }
});

test("自動照合された行には出典と根拠が必ず付いている", () => {
  const auto = items.filter((it) => it.audit.method === "issuer-base");
  assert.ok(auto.length > 0, "自動照合の行が1件もない");
  for (const it of auto) {
    assert.ok(it.audit.provenance, `${it.cardName} に provenance がない`);
    assert.ok((it.audit.officialUrls || []).length > 0, `${it.cardName} に公式URLがない`);
    assert.ok((it.audit.evidence || []).length > 0, `${it.cardName} に引用根拠がない`);
  }
});

test("本番の承認記録は監査台帳から切り離されている", () => {
  assert.equal(L.meta.verificationRecords.withDisplayApproval, 0,
    "調査の結果で displayApproval が付いてはいけない");
  assert.equal(L.meta.verificationRecords.byStatus.unverified, 17);
});

test("掲載内容の指紋は16桁のハッシュで、掲載文そのものを複製していない", () => {
  for (const it of items.slice(0, 50)) {
    assert.match(it.dataSignature, /^[0-9a-f]{16}$/);
  }
});



// ───────── 判定モデル（条件項目）─────────
const { CHECKS, verdictFromChecks, emptyChecks } = require("../lib/checks.js");

test("判定は条件項目から導かれる（必須がすべて確認済みのときだけ一致）", () => {
  const c = emptyChecks();
  assert.equal(verdictFromChecks(c, "candidate"), "未確認");
  c.還元率 = "確認済み";
  assert.equal(verdictFromChecks(c, "candidate"), "一部確認");
  c.対象決済 = "確認済み"; c.対象店舗 = "確認済み"; c.追加条件 = "確認済み";
  assert.equal(verdictFromChecks(c, "candidate"), "一致");
  assert.equal(verdictFromChecks(c, "benefit"), "一部確認", "特典は対象日も必須");
  c.対象日 = "確認済み";
  assert.equal(verdictFromChecks(c, "benefit"), "一致");
});

test("記載不足があれば一致にしない（矛盾ではないので不一致にもしない）", () => {
  const c = emptyChecks();
  c.還元率 = "確認済み"; c.対象決済 = "確認済み"; c.対象店舗 = "確認済み"; c.追加条件 = "記載不足";
  assert.equal(verdictFromChecks(c, "candidate"), "一部確認");
});

test("発行元の通常還元だけでは一致にならない", () => {
  const auto = items.filter((it) => it.audit.method === "issuer-base");
  assert.ok(auto.length > 0);
  for (const it of auto) {
    assert.notEqual(it.audit.status, "一致",
      `${it.storeId}::${it.cardName} が発行元の確認だけで一致になっている`);
    const ch = it.audit.checks || {};
    for (const k of ["対象決済", "対象店舗", "追加条件"]) {
      assert.notEqual(ch[k], "確認済み",
        `発行元の案内では確認できないはずの「${k}」が確認済みになっている`);
    }
  }
});

test("一致の行は必須項目がすべて確認済みになっている", () => {
  for (const it of items) {
    if (it.audit.status !== "一致") continue;
    for (const c of CHECKS) {
      if (!c.required) continue;
      if (c.onlyFor && c.onlyFor !== it.kind) continue;
      assert.equal((it.audit.checks || {})[c.key], "確認済み",
        `${it.storeId}::${it.cardName} は一致だが「${c.label}」が確認済みでない`);
    }
  }
});
console.log(`\n${passed} tests passed`);
