// 2026-11-20 の掲載データ修正を守るためのテスト。
// 公式根拠に基づいて直した内容が、あとから崩れないことを確認する。
// 実行: node scripts/test-data-fixes.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (m, f) => m._compile(
  ts.transpileModule(fs.readFileSync(f, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, f);

const { getAllStoreIdEntries } = require("../app/storeIds.ts");
const { isTodayWithinCondition } = require("../app/utils.ts");
const records = require("../app/design/store-detail/verification-records.json");

const entries = getAllStoreIdEntries();
const find = (storeId, part) => {
  const e = entries.find((x) => x.storeId === storeId);
  assert.ok(e, `店舗が見つからない: ${storeId}`);
  const c = e.store.候補.find((x) => x.カード.includes(part));
  assert.ok(c, `候補が見つからない: ${storeId} / ${part}`);
  return c;
};
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`  ok  ${name}`); };
console.log("scripts/test-data-fixes.cjs");

// ── 確認記録と候補の対応が切れていないこと ──
// 候補名を変えると verification-records.json の対応が外れ、
// 読者向けの「特典の確認状況」の注意書きがページから消えてしまう。
test("定例特典の確認記録が、すべて現在の候補名と結びついている", () => {
  const live = new Set();
  for (const { storeId, store } of entries) for (const c of store.候補) live.add(`${storeId}::${c.カード}`);
  const orphans = Object.entries(records)
    .filter(([, v]) => !live.has(`${v.storeId}::${v.candidateName}`))
    .map(([k, v]) => `[${k}] ${v.storeId} / ${v.candidateName}`);
  assert.deepEqual(orphans, [], `候補名と結びつかない確認記録があります:\n  ${orphans.join("\n  ")}`);
});

test("確認記録は17件すべて未確認のままで、表示承認は付いていない", () => {
  const vals = Object.values(records);
  assert.equal(vals.length, 17);
  for (const v of vals) {
    assert.equal(v.status, "unverified", `${v.storeId} の status=${v.status}`);
    assert.equal(v.displayApproval, undefined, `${v.storeId} に displayApproval が付いている`);
  }
});

// ── JCBのポイント名 ──
test("JCBオリジナルカードのポイント名が J-POINT になっている", () => {
  const src = fs.readFileSync(require.resolve("../app/data.ts"), "utf8");
  assert.equal(/Oki ?Doki|オキドキ/.test(src), false, "app/data.ts に旧ポイント名が残っている");
  let jcb = 0;
  for (const { store } of entries) for (const c of store.候補) {
    // JCBが自社発行するカードだけが対象。提携カードは別のポイント制度なので含めない
    // （例: ライフのLC JCBカードはLaCuCaポイント）。
    if (!/^JCB ?カード/.test(c.カード)) continue;
    jcb++;
    assert.equal(c.ポイント種類, "J-POINT", `${c.カード} のポイント種類=${c.ポイント種類}`);
  }
  assert.ok(jcb >= 14, `JCBオリジナルの候補が少ない (${jcb})`);
});

test("提携カードは別のポイント制度のまま（J-POINTに巻き込んでいない）", () => {
  const lc = find("life", "LC JCBカード");
  assert.equal(lc.ポイント種類, "LaCuCaポイント",
    "ライフのLC JCBカードは提携カードで、JCBのJ-POINTとは別のポイント制度");
});

// ── モスバーガー：入金特典であって決済還元ではない ──
test("モスバーガーの特典が入金（チャージ）への付与だと分かる記述になっている", () => {
  const c = find("mos-burger", "モスカードの日");
  assert.match(c.条件, /入金|チャージ/, "条件に入金の記述がない");
  assert.match(c.注意, /支払い時の還元ではありません/, "注意に決済還元でない旨がない");
  assert.match(c.注意, /足し合わせ/, "注意に他の還元率と合算できない旨がない");
  assert.equal(c.特定日限定, true);
});

test("モスバーガーの対象日が25〜29日として解釈される", () => {
  const c = find("mos-burger", "モスカードの日");
  const day = (d) => isTodayWithinCondition(c.対象日条件, { year: 2026, month: 11, day: d, weekday: 0 });
  for (const d of [25, 26, 27, 28, 29]) assert.equal(day(d), true, `${d}日が対象外`);
  for (const d of [24, 30]) assert.equal(day(d), false, `${d}日が対象になっている`);
});

// ── 西友・サニー：曜日 ──
test("西友の増量日が金・土・日・月として解釈される", () => {
  const c = find("seiyu", "西友アプリ＋楽天ポイント");
  const wd = (w) => isTodayWithinCondition(c.対象日条件, { year: 2026, month: 11, day: 1, weekday: w });
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(wd), [true, true, false, false, false, true, true]);
});

test("サニーの特典が土曜のみで、月曜が対象外になっている", () => {
  const c = find("sunny", "楽天ポイントカード提示");
  const wd = (w) => isTodayWithinCondition(c.対象日条件, { year: 2026, month: 11, day: 1, weekday: w });
  assert.equal(wd(6), true, "土曜が対象外");
  assert.equal(wd(1), false, "月曜が対象になっている");
  assert.match(c.注意, /ゆめアプリ会員限定/);
});

// ── 対象決済・条件の追記が消えていないこと ──
test("ローソンのアプリエントリー条件が記載されている", () => {
  const c = find("lawson", "ローソンPontaプラス");
  assert.match(c.条件 + c.注意, /エントリー/, "エントリー条件の記述がない");
});

test("イトーヨーカドーに対象決済と店舗別の変更が記載されている", () => {
  const c = find("ito-yokado", "8のつく日");
  assert.match(c.条件, /nanaco|セブンカード/, "対象決済の記述がない");
  assert.match(c.注意, /対象外/, "対象外決済の記述がない");
  assert.match(c.注意, /2026年9月以降/, "店舗別の開催日変更の記述がない");
});

test("まいばすけっとに首都圏限定と併用制限が記載されている", () => {
  const c = find("my-basket", "20日・30日ポイント5倍");
  assert.match(c.条件 + c.注意, /首都圏/, "首都圏限定の記述がない");
  assert.match(c.注意, /併用/, "併用制限の記述がない");
});

test("ダイエーの特典が会計時の割引として記載されている", () => {
  const c = find("daiei", "イオンマークのカード/AEON Pay（20日・30日）");
  assert.equal(c.ポイント種類, "ポイントなし（会計時割引）");
  assert.match(c.注意, /WAON POINTカードは割引対象外/);
});

test("ツルハに併用制限と対象外店舗が記載されている", () => {
  const c = find("tsuruha-drug", "お客様感謝デー");
  assert.match(c.注意, /併用できません/);
  assert.match(c.注意, /対象外の店舗/);
});

// ── 触っていない店舗が変わっていないこと ──
test("マックスバリュは未修正のまま（公式根拠が未取得のため）", () => {
  const c = find("maxvalu", "イオンマークのカード/AEON Pay（20日・30日）");
  assert.equal(c.ポイント種類, "WAON POINT", "根拠がないまま変更されている");
  assert.equal(c.対象日条件, "毎月20日・30日");
});

test("西友の毎月15日の特典は保留のまま残っている（未確認を理由に消さない）", () => {
  const c = find("seiyu", "楽天ポイントカード（毎月15日）");
  assert.equal(c.対象日条件, "毎月15日");
});

console.log(`\n${passed} tests passed`);
