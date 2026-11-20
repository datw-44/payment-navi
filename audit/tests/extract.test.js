"use strict";
/**
 * 2026-11-19の初回監査で発生した2件の誤判定の回帰テスト。
 * フィクスチャは実際に取得した公式ページからの抜粋。
 *
 * 各テストは「正しい実装なら通る」ことと、
 * 「当時のバグのある実装なら落ちる」ことの両方を確認する。
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { extract, search } = require("../lib/extract.js");

const FX = path.join(__dirname, "fixtures");
const read = (f) => fs.readFileSync(path.join(FX, f));
let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`  ok  ${name}`); }

/** 当時のバグ再現1: タグを一括除去する（alt属性が失われる） */
function buggyStripAllTags(buf) {
  return buf.toString("utf8").replace(/<[^>]+>/g, "\n")
    .split("\n").map((l) => l.trim()).filter(Boolean);
}
/** 当時のバグ再現2: 先頭80行で打ち切る */
function buggyTruncate(lines) { return lines.slice(0, 80); }

console.log("audit/tests/extract.test.js");

// ───────── ローソン：時間帯別の条件が img の alt にしかない ─────────
test("ローソン: altの時間帯別ポイントと アプリエントリー条件を抽出できる", () => {
  const r = extract(read("lawson-ponta-alt.html"));
  assert.ok(r.text.includes("毎月10日・20日は商品お買い上げ200円（税抜）ごとに"), "10日・20日の記載");
  assert.ok(r.text.includes("0時～15時59分は6ポイント"), "日中6ポイント");
  assert.ok(r.text.includes("16時～23時59分は12ポイント"), "夜間12ポイント");
  assert.ok(r.text.includes("アプリエントリー要"), "アプリエントリー必須条件");
  assert.ok(r.alts.some((a) => a.includes("16時～23時59分は12ポイント")), "alts配列にも含まれる");
});

test("ローソン: タグ一括除去の実装では同じ条件を取り落とす（バグ再現）", () => {
  const buggy = buggyStripAllTags(read("lawson-ponta-alt.html")).join("\n");
  assert.ok(!buggy.includes("16時～23時59分は12ポイント"),
    "バグ実装でも取れてしまうならテストが無意味になる");
});

// ───────── まいばすけっと：該当セクションが先頭80行より後ろ ─────────
test("まいばすけっと: 毎月20日30日の5倍デーを抽出できる", () => {
  const r = extract(read("mybasket-baide.html"));
  assert.ok(r.text.includes("毎月20日30日は5倍デー"), "5倍デーの見出し");
  assert.ok(r.text.includes("基本の5倍の5WAON POINT"), "5WAON POINT");
  assert.ok(r.text.includes("首都圏のまいばすけっと限定"), "首都圏限定の条件");
  assert.ok(r.text.includes("併用はできません"), "併用不可の条件");
});

test("まいばすけっと: 該当行は80行目より後ろにある（打ち切り実装では見落とす）", () => {
  const r = extract(read("mybasket-baide.html"));
  const hit = r.lines.findIndex((l) => l.includes("毎月20日30日は5倍デー"));
  assert.ok(hit >= 0, "見出しが存在する");
  assert.ok(hit + 1 > 80, `見出しは${hit + 1}行目。80行以内なら打ち切りバグを再現できない`);
  const truncated = buggyTruncate(r.lines).join("\n");
  assert.ok(!truncated.includes("毎月20日30日は5倍デー"), "打ち切り実装では取り落とす（バグ再現）");
});

// ───────── TOHOシネマズ：Shift_JIS ─────────
test("TOHOシネマズ: Shift_JISを正しく復号して料金を抽出できる", () => {
  const r = extract(read("toho-otoku-sjis.html"));
  assert.equal(r.encoding, "shift_jis", `検出した文字コード=${r.encoding}`);
  assert.ok(r.text.includes("セゾンの木曜日"), "セゾンの木曜日");
  assert.ok(r.text.includes("1,200円"), "一般料金");
});

test("TOHOシネマズ: utf-8決めつけでは文字化けする（バグ再現）", () => {
  const forced = read("toho-otoku-sjis.html").toString("utf8");
  assert.ok(!forced.includes("セゾンの木曜日"), "utf-8固定では読めない");
});

// ───────── search(): 件数制限なし ─────────
test("search(): 一致行をすべて返す（上限や打ち切りがない）", () => {
  const r = extract(read("mybasket-baide.html"));
  const res = search(r.lines, ["WAON POINT"]);
  const direct = r.lines.filter((l) => l.includes("WAON POINT")).length;
  assert.equal(res.matchedLineNumbers.length, direct, "一致行数が全数と一致する");
  assert.ok(direct > 5, `一致行が少なすぎる（${direct}件）とテストにならない`);
});

test("extract(): 行数制限をかけていない（全文が返る）", () => {
  const r = extract(read("mybasket-baide.html"));
  assert.ok(r.lines.length > 80, `抽出行数=${r.lines.length}`);
  assert.equal(r.text.split("\n").length, r.lines.length, "textとlinesが同一の全文");
});

console.log(`\n${passed} tests passed`);
