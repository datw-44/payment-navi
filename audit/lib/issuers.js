"use strict";
/**
 * 支払い候補を「決済手段の提供元（発行元）」に対応づける。
 *
 * 目的: 784件を店舗ごとに個別調査すると非効率なので、
 *       「カード自体の通常還元」を発行元の公式条件として一度確認し、
 *       それを参照する候補すべての監査に再利用する。
 *
 * 重要な区別（混同すると誤った監査になる）:
 *   base      … カード・決済サービス自体の通常還元（発行元の公式条件で確認する）
 *   storeDeal … 特定店舗・チェーン限定の上乗せやキャンペーン（店舗側の公式条件が必要）
 * 一つの候補が両方を含むことがある（例: 通常1% + その店で+4%）。
 * その場合 base だけ確認できても「一致」にはせず「一部確認」とする。
 */

/** 判定は上から順に当て、最初に当たったものを採用する（具体的なものを先に置く）。 */
const ISSUERS = [
  { key: "smbc",     name: "三井住友カード / Olive / Vポイント", match: /三井住友カード|Olive|オリーブ/,         official: ["https://www.smbc-card.com/"] },
  { key: "aeon",     name: "イオンカード / AEON Pay / WAON",     match: /イオンカード|イオンマーク|AEON Pay|電子マネーWAON|WAON POINTカード|イオンJMB/, official: ["https://www.aeon.co.jp/", "https://www.waon.net/"] },
  { key: "docomo",   name: "dカード / d払い / dポイント",        match: /dカード|d払い|dポイント/,                official: ["https://d-card.jp/", "https://dpoint.docomo.ne.jp/"] },
  { key: "rakuten",  name: "楽天カード / 楽天ペイ / 楽天ポイント", match: /楽天/,                                   official: ["https://www.rakuten-card.co.jp/", "https://pointcard.rakuten.co.jp/"] },
  { key: "paypay",   name: "PayPay / PayPayカード",              match: /PayPay/,                                 official: ["https://paypay.ne.jp/point/"] },
  { key: "seven",    name: "セブンカード / nanaco",              match: /セブンカード|nanaco|ナナコ/,              official: ["https://www.7cs.co.jp/"] },
  { key: "jreast",   name: "ビューカード / Suica / JRE POINT",   match: /ビューカード|Suica|JRE/,                 official: ["https://www.jreast.co.jp/", "https://www.jrepoint.jp/"] },
  { key: "au",       name: "au PAY / Pontaポイント(au)",         match: /au ?PAY|auペイ/i,                        official: ["https://aupay.auone.jp/"] },
  { key: "jcb",      name: "JCBカード",                          match: /JCB/,                                    official: ["https://www.jcb.co.jp/"] },
  { key: "mufg",     name: "三菱UFJカード",                      match: /三菱UFJ/,                                official: ["https://www.cr.mufg.jp/"] },
  { key: "recruit",  name: "リクルートカード",                   match: /リクルートカード/,                       official: ["https://recruit-card.jp/"] },
  { key: "epos",     name: "エポスカード",                       match: /エポス/,                                 official: ["https://www.eposcard.co.jp/"] },
  { key: "saison",   name: "セゾンカード / UCカード",            match: /セゾン|UCカード/,                        official: ["https://www.saisoncard.co.jp/"] },
  { key: "orico",    name: "オリコカード",                       match: /オリコ/,                                 official: [] },
  { key: "amex",     name: "アメリカン・エキスプレス",           match: /アメックス|American Express|アメリカン・エキスプレス/, official: [] },
  { key: "lifecard", name: "ライフカード発行",                   match: /ライフカード/,                           official: [] },
  { key: "famima",   name: "ファミペイ / ファミマカード",        match: /ファミペイ|ファミマ/,                    official: [] },
  { key: "ponta",    name: "Pontaポイント（提示）",              match: /Ponta/,                                  official: ["https://point.recruit.co.jp/"] },
  { key: "merpay",   name: "メルペイ",                           match: /メルペイ|メルカリ/,                      official: [] },
];

/** 店舗限定の上乗せを示唆する語。カード自体の通常還元と区別するために使う。 */
const STORE_DEAL_HINTS = /提示|アプリ|感謝デー|倍デー|ポイント\d倍|\d倍デー|対象店舗|店舗限定|エントリー|キャンペーン|増量|限定|タッチ決済のみ|会員コード/;

function classify(candidate, storeName) {
  const hay = `${candidate.カード} ${candidate.ポイント種類} ${candidate.条件 || ""}`;
  const issuer = ISSUERS.find((i) => i.match.test(hay)) || null;
  const storeSpecific = STORE_DEAL_HINTS.test(`${candidate.カード} ${candidate.条件 || ""}`)
    || candidate.特定日限定 === true;
  return {
    issuerKey: issuer ? issuer.key : null,
    issuerName: issuer ? issuer.name : null,
    officialUrls: issuer ? issuer.official : [],
    // base だけで済むか、店舗側の確認も要るか
    needsStoreEvidence: storeSpecific,
    kind: storeSpecific ? "storeDeal" : "base",
  };
}

module.exports = { ISSUERS, classify, STORE_DEAL_HINTS };
