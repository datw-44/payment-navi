import type { PaymentCandidate } from "../../data";

// ローソンの既存条件から作った表示用要約。数値・資格・順位の計算には使用しない。
// 条件全文と注意が一致した候補だけ短縮する。データが変わった場合は推測せず原文へ戻す。
const rules = [
  {
    "name": "Oliveフレキシブルペイ",
    "condition": "OliveフレキシブルペイのクレジットモードでスマホのVisaタッチ決済・Mastercardタッチ決済を利用する。Google Pay・Samsung WalletではMastercardタッチ決済は利用できない。商業施設内など一部対象外店舗あり。",
    "note": "デビットモードは別条件。カード現物・iD・差し込みは対象外",
    "lines": [
      "カード現物・iD・差し込みは対象外",
      "Google Pay・Samsung Wallet：Mastercardタッチ不可"
    ]
  },
  {
    "name": "三井住友カード（NL）等",
    "condition": "スマホのタッチ決済（Apple Pay/Google PayでのVisaタッチ・Mastercardタッチ）",
    "note": "カード現物・iD・差し込みは対象外。端末上限は店舗で異なる",
    "lines": [
      "Apple Pay・Google Pay（Visa・Mastercard）",
      "カード現物・iD・差し込みは対象外"
    ]
  },
  {
    "name": "ローソンPontaプラス（通常時）",
    "condition": "毎月10日・20日の16時〜23時59分に決済（お客様感謝デー）",
    "note": "日中は半額",
    "lines": [
      "毎月10日・20日 16:00〜23:59限定",
      "日中は半額"
    ]
  },
  {
    "name": "dカード＋dポイントカード提示",
    "condition": "レジでdポイントカードを提示し、支払いをdカード（またはdカード払い設定のd払い）にする",
    "note": "非公式の試算値",
    "lines": [
      "dポイントカードの提示が必要",
      "非公式の試算値"
    ]
  },
  {
    "name": "楽天カード",
    "condition": "楽天カードで通常のクレジット決済をする（ローソンは楽天ポイントカード加盟店ではないため、提示による二重取りは不可）",
    "note": "基本還元率のみ",
    "lines": [
      "楽天ポイントカード提示による二重取りは不可"
    ]
  },
  {
    "name": "楽天ペイ（楽天キャッシュ利用時）",
    "condition": "楽天ペイアプリ内の楽天ポイントカードをカウント期間中（対象月の前々月16日〜前月15日）に2回以上提示した上で、楽天キャッシュ残高で支払う",
    "note": "アプリ版のみ対象",
    "lines": [
      "楽天ペイアプリのポイントカードを対象期間に2回以上提示",
      "期間：前々月16日〜前月15日。楽天キャッシュ払い"
    ]
  },
  {
    "name": "dカード",
    "condition": "dカードで通常のクレジット決済をする（dポイントカード提示との併用は別候補）",
    "note": "基本還元率のみ",
    "lines": [
      "ポイントカード提示との併用は別候補"
    ]
  },
  {
    "name": "d払い",
    "condition": "d払いアプリで、支払い方法を銀行口座や残高（dカード以外）に設定して決済する",
    "note": "dカード払い設定で1%に",
    "lines": [
      "支払い元は銀行口座・残高（dカード以外）"
    ]
  },
  {
    "name": "PayPayカード",
    "condition": "PayPayカードで通常のクレジット決済をする（PayPayアプリのQRコード決済ではなくカードをそのまま利用）",
    "note": "ステップ達成で1.5%（要本人確認）",
    "lines": [
      "PayPayアプリのQR決済ではなく、カードで支払う"
    ]
  },
  {
    "name": "PayPay",
    "condition": "PayPayアプリの残高またはあと払いでQRコード決済をする（ステップ未達成の場合）。Pontaカード/dポイントカードの提示で別途ポイント二重取り可",
    "note": "ステップ達成で1%に（要本人確認）",
    "lines": [
      "QRコード決済（PayPayステップ未達成の場合）"
    ]
  },
  {
    "name": "JCBカードW",
    "condition": "JCBカードWで通常のクレジット決済をする（ローソンはJ-POINTパートナー特典の対象として確認できず）",
    "note": "店舗での特典の有無は、公式サイトでご確認ください",
    "lines": [
      "店舗での特典の有無は、公式サイトでご確認ください"
    ]
  },
  {
    "name": "リクルートカード",
    "condition": "リクルートカードで通常のクレジット決済をする",
    "note": "コンビニ特典なし",
    "lines": [
      "コンビニ特典なし"
    ]
  },
  {
    "name": "イオンカード",
    "condition": "イオンカードで通常のクレジット決済をする（イオングループ店舗ではないため特典対象外）",
    "note": "コンビニ特典なし",
    "lines": [
      "イオングループ店舗の特典は対象外"
    ]
  },
  {
    "name": "三菱UFJカード",
    "condition": "対象店舗で三菱UFJカードをクレジット決済・タッチ決済、またはApple Pay（QUICPay支払い）で支払う（スマホのVisaタッチ決済・Google Payは対象外）",
    "note": "上限・条件は公式サイトでご確認ください",
    "lines": [
      "Apple PayはQUICPay支払い",
      "スマホのVisaタッチ・Google Payは対象外"
    ]
  }
];

export function lawsonConditions(candidate: PaymentCandidate): string[] | undefined {
  const rule = rules.find((item) => item.name === candidate.カード && item.condition === candidate.条件 && item.note === candidate.注意);
  return rule?.lines;
}
