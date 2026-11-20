"use strict";
/**
 * 候補1件を「一致」と言うために確認すべき条件項目。
 *
 * 発行元の通常還元が分かっただけでは「一致」にしてはいけない。
 * その店舗で本当にその率が付くのか、対象決済は何か、上限や除外はあるのか、
 * これらは店舗側（またはその店舗を名指しした発行元の案内）の根拠が要る。
 *
 * 判定は項目の埋まり方から機械的に決める:
 *   不一致   … いずれかの項目で公式と掲載が矛盾している
 *   一致     … 必須項目がすべて確認済み
 *   一部確認 … 一部だけ確認済み
 *   未確認   … 何も確認できていない
 */

/** 必須=true の項目がすべて確認済みでなければ「一致」にしない。 */
const CHECKS = [
  { key: "還元率",   label: "還元率・割引率",           required: true },
  { key: "対象日",   label: "対象日・曜日",             required: true, onlyFor: "benefit" },
  { key: "対象決済", label: "対象となるカード・決済方法", required: true },
  { key: "ポイント種類", label: "付与されるポイントの種類", required: true },
  { key: "対象店舗", label: "その店舗が対象であること",   required: true },
  { key: "追加条件", label: "エントリー・提示・会員登録等", required: true },
  { key: "上限",     label: "付与上限・金額上限",         required: false },
  { key: "除外事項", label: "対象外の商品・サービス",     required: false },
];

const KEYS = CHECKS.map((c) => c.key);

const STATES = ["未確認", "確認済み", "相違", "記載不足"];

function emptyChecks() {
  const o = {};
  for (const k of KEYS) o[k] = "未確認";
  return o;
}

/** 項目の状態から4分類を決める。 */
/** 定例特典だけに必要な項目（対象日）があるので、候補の種別で必須条件が変わる。 */
function requiredChecks(kind) {
  return CHECKS.filter((c) => c.required && (!c.onlyFor || c.onlyFor === kind));
}

function verdictFromChecks(checks, kind = "candidate") {
  const vals = KEYS.map((k) => checks[k] || "未確認");
  if (vals.includes("相違")) return "不一致";
  const required = requiredChecks(kind).map((c) => checks[c.key] || "未確認");
  if (required.every((v) => v === "確認済み")) return "一致";
  if (vals.some((v) => v === "確認済み" || v === "記載不足")) return "一部確認";
  return "未確認";
}

/** 公式が必須としているのに掲載されていない条件を返す。読者が特典を受け損ねる原因になる。 */
function shortfallLabels(checks) {
  return CHECKS.filter((c) => (checks[c.key] || "未確認") === "記載不足").map((c) => c.label);
}

/** 未確認のまま残っている項目を、人が読める形で返す。 */
function missingLabels(checks, kind = "candidate") {
  const req = new Set(requiredChecks(kind).map((c) => c.key));
  return CHECKS.filter((c) => (checks[c.key] || "未確認") === "未確認")
    .filter((c) => !c.onlyFor || c.onlyFor === kind)
    .map((c) => `${c.label}${req.has(c.key) ? "" : "（任意）"}`);
}

module.exports = { CHECKS, KEYS, STATES, emptyChecks, verdictFromChecks, missingLabels, shortfallLabels, requiredChecks };
