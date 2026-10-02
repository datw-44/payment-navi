// 店舗ごとの「使える支払い方法」。店舗ページの「◯◯で使える支払い方法」に表示される（表示用データ）。
//
// - 「使える」「使えない」は、確認できたものだけを書く。確認できないものは書かない（ページには出ない）。
//   → 「要確認」「未確認」などの文言はここには書かず、app/dataMemos.ts に書くこと。
// - クレジットカード / QRコード決済 / 電子マネー の項目名は ACCEPTANCE_ITEMS にあるものだけを使う。
//   「その他」は自由な文章（現金のみ、レジ別の注意、使えないポイントカードなど）。
// - 店舗名は app/data.ts の「店舗」と一致させる（scripts/check-data.js が検査する）。
// - 情報の確認時期は ACCEPTANCE_CHECKED_AT。

export type AcceptanceGroup = { 使える?: string[]; 使えない?: string[] };

export type StoreAcceptance = {
  クレジットカード?: AcceptanceGroup;
  QRコード決済?: AcceptanceGroup;
  電子マネー?: AcceptanceGroup;
  その他?: AcceptanceGroup;
};

// 表示する項目（この順に並ぶ）
export const ACCEPTANCE_ITEMS = {
  クレジットカード: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"],
  QRコード決済: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"],
  電子マネー: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"],
} as const;

export const ACCEPTANCE_CHECKED_AT = "2026年10月";

export const acceptance: Record<string, StoreAcceptance> = {
    "セブンイレブン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
    },
    "ローソン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"] },
      その他: { 使えない: ["マルチコピー機は現金のみ（クレジットカード・電子マネー・QRコード決済は不可）", "公共料金・収納代行票は現金のみ"] },
    },
    "ファミリーマート": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"], 使えない: ["nanaco"] },
    },
    "マツモトキヨシ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"], 使えない: ["WAON", "nanaco"] },
    },
    "ウエルシア": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
    },
    "ツルハドラッグ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["クレジットカード同士・電子マネー同士の組み合わせ払いはできません（現金との組み合わせのみ）"] },
    },
    "サンドラッグ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
    },
    "イオン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"] },
      その他: { 使える: ["AEON Pay（イオンペイ）"], 使えない: ["PayPayは一部の店舗（関東・山梨の一部）のみで利用できます"] },
    },
    "イトーヨーカドー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
    },
    "西友": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "楽天ペイ"], 使えない: ["メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）"], 使えない: ["iD"] },
    },
    "マクドナルド": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["モバイルオーダー・デリバリーでは電子マネーは使えません"] },
    },
    "すき家": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なります（公式サイトの「サービスでさがす」で確認できます）"] },
    },
    "吉野家": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["AEON Pay（イオンペイ）"], 使えない: ["一部の店舗ではクレジットカードが使えません"] },
    },
    "ヨドバシカメラ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["デビットカード", "Apple Pay・Google Pay"] },
    },
    "ビックカメラ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
    },
    "ヤマダ電機": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
    },
    "スターバックス": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）"] },
      その他: { 使える: ["スターバックス カード"], 使えない: ["店舗によって使えるブランド・決済手段が異なります（一部のQRコード決済が使えない店舗もあります）"] },
    },
    "ドトール": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON"] },
      その他: { 使える: ["ドトールバリューカード（プリペイド式カード・スマホアプリ）"], 使えない: ["一部の店舗では使えない決済手段があります"] },
    },
    "タリーズ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["タリーズカード"], 使えない: ["dポイント・楽天ポイントでの直接払いは使えません", "QRコード決済は多くの店舗で使えます（店舗によって異なります）"] },
    },
    "ガスト": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります", "公式アプリからの事前決済はクレジットカードのみです"] },
    },
    "サイゼリヤ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）"], 使えない: ["iD", "QUICPay"] },
      その他: { 使える: ["デビットカード・プリペイドカード"] },
    },
    "丸亀製麺": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["一部の店舗では使えない決済手段があります（WAONが使えない店舗もあります）"] },
    },
    "ユニクロ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["デビットカード（Visaデビット・JCBデビットなど）", "UNIQLOギフトカード・eGift Card・JCBギフトカード・QUOカードPay"], 使えない: ["American Expressは日本で発行されたカードのみ使えます", "店舗によって使える決済手段が異なる場合があります"] },
    },
    "ダイソー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["一部の店舗（商業施設内・郊外店など）では現金のみの場合があります", "QRコード決済は使える店舗のみです"] },
    },
    "ENEOS": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
      その他: { 使える: ["ENEOSプリカ"], 使えない: ["PayPayは本部では導入しておらず、原則使えません（独自に導入しているフランチャイズ店を除く）"] },
    },
    "ミニストップ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"] },
      その他: { 使えない: ["ミニストップサテライトなど一部の店舗ではキャッシュレス決済が使えません", "公共料金の支払い・切手・ハガキの購入はクレジットカードで払えません"] },
    },
    "デイリーヤマザキ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"], 使えない: ["WAON", "nanaco"] },
      その他: { 使えない: ["収納代行・宅配便・切手・プリペイドカードの購入は現金のみ"] },
    },
    "セイコーマート": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"] },
      その他: { 使える: ["独自の電子マネー「Pecoma（ペコマ）マネー」"] },
    },
    "スギ薬局": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
    },
    "ココカラファイン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
    },
    "コスモス薬品": {
      クレジットカード: { 使えない: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["一部の店舗では、クレジットカードやQRコード決済が使える場合があります", "楽天ポイント・dポイント・Vポイント・Pontaポイントなどの共通ポイントカード"] },
    },
    "ライフ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["独自の電子マネー「LaCuCa」"] },
    },
    "マルエツ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay"], 使えない: ["d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "WAON", "楽天Edy"] },
      その他: { 使えない: ["セルフレジでは楽天Edyは使えません"] },
    },
    "業務スーパー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使えない: ["d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["独自の電子マネー「ギョムカ（Gyomuca）」"], 使えない: ["PayPayは一部の店舗のみで利用できます", "直営店・フランチャイズ店によって対応状況が異なります"] },
    },
    "コストコ": {
      クレジットカード: { 使える: ["Mastercard", "タッチ決済"], 使えない: ["Visa", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["現金", "プリペイドカード（Mastercardブランド）"], 使えない: ["ガスステーションでは現金は使えません"] },
    },
    "モスバーガー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "au PAY", "メルペイ"], 使えない: ["楽天ペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["モスカード（プリペイド式）", "dポイント払い"] },
    },
    "ケンタッキーフライドチキン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["KFCカード（独自の電子マネー）"], 使えない: ["一部のショッピングモール内の店舗では使えない決済手段があります"] },
    },
    "バーガーキング": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["公式アプリのモバイルオーダーはクレジットカードのみで、電子マネー・QRコード決済は使えません", "PayPayは一部の店舗のみで利用できます"] },
    },
    "松屋": {
      クレジットカード: { 使えない: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["店内の券売機ではクレジットカードは使えません（松屋モバイルオーダーでは使えます）"] },
    },
    "はま寿司": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["イオンモール内やフランチャイズの店舗など、一部の店舗では使えない決済手段があります"] },
    },
    "スシロー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["一部の店舗では使えない決済手段があります"] },
    },
    "セリア": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB"] },
      QRコード決済: { 使える: ["PayPay", "d払い"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["有人レジは現金のみの店舗があります。キャッシュレス決済はセルフレジでの利用が中心です", "店舗によって対応が異なります"] },
    },
    "キャンドゥ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["クレジットカードが使えるのは約8割の店舗です", "電子マネーは主にショッピングモール内の店舗で使えます（店舗によって異なります）"] },
    },
    "ニトリ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "楽天ペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）"] },
      その他: { 使える: ["商品券", "デビットカード・プリペイドカード", "株主お買い物優待券"] },
    },
    "無印良品": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["MUJI passport Pay"], 使えない: ["QRコード決済は一部の店舗のみ対応です", "WAONはイオン系の商業施設内の店舗に限られます"] },
    },
    "ドン・キホーテ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["majica", "J-Debit・銀聯カード"], 使えない: ["店舗によって使える電子マネーが異なります"] },
    },
    "出光": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["モバイルDrive Pay（独自のアプリ決済）"], 使えない: ["PayPay・楽天ペイ・au PAYは2025年4月から順次導入中で、使えるのは一部の店舗のみです", "店舗によって使えない決済手段があります"] },
    },
    "コスモ石油": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ"] },
      電子マネー: { 使える: ["iD", "QUICPay", "WAON"], 使えない: ["交通系IC（Suica・PASMOなど）"] },
      その他: { 使える: ["コスモSS Pay（独自のアプリ決済）"], 使えない: ["全店共通で使える電子マネーはなく、店舗ごとに対応が異なります"] },
    },
    "ローソンストア100": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"], 使えない: ["nanaco"] },
    },
    "まいばすけっと": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON"] },
      その他: { 使える: ["AEON Pay（イオンペイ）"] },
    },
    "成城石井": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
    },
    "ロピア": {
      クレジットカード: { 使えない: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco"] },
      その他: { 使える: ["現金", "ロピア公式アプリ「ロピタ」でのキャッシュレス払い（現金チャージ）"], 使えない: ["クレジットカードが使えるのは、ららぽーとTOKYO-BAY店など一部の店舗のみです", "楽天ポイント・dポイント・Vポイントなどの共通ポイントカード"] },
    },
    "オーケー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay"], 使えない: ["WAON", "nanaco"] },
    },
    "サミット": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "楽天Edy"], 使えない: ["QUICPay", "WAON", "nanaco"] },
      その他: { 使えない: ["レジによっては電子マネーを利用できない場合があります", "QRコード決済は対応店舗のみで利用できます"] },
    },
    "ヤオコー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["ヤオコーPay（ヤオコーアプリ・ヤオコーカード）"] },
    },
    "クリエイトSD": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["dポイントカードの提示・dポイントでの支払い（d払いは利用できます）"] },
    },
    "カワチ薬品": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["dポイントなど共通ポイントカードの提示・利用"] },
    },
    "ダイコクドラッグ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "楽天Edy"], 使えない: ["QUICPay", "WAON", "nanaco"] },
      その他: { 使えない: ["商品券・ギフトカード"] },
    },
    "カインズ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco"] },
      その他: { 使えない: ["楽天Edyは一部の店舗（沖縄の一部など）でのみ使えます"] },
    },
    "コメリ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["デビットカード（Visa・Mastercard・JCB）", "タッチ決済（Visa・Mastercard・JCB・Amex）"], 使えない: ["楽天ポイント・Pontaポイント・dポイント・Vポイントなどの共通ポイントカード"] },
    },
    "DCM": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["DCM独自の電子マネー", "デビットカード・プリペイドカード"], 使えない: ["店舗（DCMカーマ・DCMダイキ・DCMホーマックなど）によって対応が異なる場合があります"] },
    },
    "コーナン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["コーナンPay", "コーナン商品券・各種ギフトカード"] },
    },
    "ケーズデンキ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["ケーズデンキオンラインショップでは、クレジットカード・代金引換・コンビニ決済・ペイジー決済のみで、QRコード決済や電子マネーは使えません"] },
    },
    "エディオン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay"] },
      その他: { 使えない: ["エディオンネット（通販）では、QRコード決済や電子マネーは使えません"] },
    },
    "ジョーシン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["デビットカード（J-Debit・Visaデビット・JCBデビット）"] },
    },
    "GU": {
      QRコード決済: { 使える: ["PayPay", "d払い", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
      その他: { 使える: ["主要なクレジットカード・国際ブランドのデビットカード（Visaデビット・JCBデビットなど）", "JCBギフトカード・QUOカードPay（有人レジのみ）"], 使えない: ["QUOカード（通常のカード）・ユニクロギフトカードは使えません", "セルフレジで使えるのは現金・クレジットカード（一括払い）・電子マネーです", "店舗によって使える決済手段が異なります", "楽天ポイント・dポイント・Pontaポイント・Tポイントなどのポイントカード（提示・支払い）"] },
    },
    "しまむら": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["クレジットカードは一括払いのみです", "dポイント・楽天ポイントなどの共通ポイントでの支払いはできません"] },
    },
    "ワークマン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["共通ポイントカード（楽天ポイント・dポイントなど）の提示・利用はできません", "ワークマンオンラインストアでも、電子マネー・QRコード決済は使えません"] },
    },
    "コメダ珈琲店": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって、一部のQRコード決済（au PAYなど）やiD・QUICPayが使えない場合があります"] },
    },
    "ミスタードーナツ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["ミスタードーナツカード"], 使えない: ["クレジットカードは、商業施設内の店舗など一部の店舗では使えません", "店舗によって対応が異なる場合があります"] },
    },
    "CoCo壱番屋": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります"] },
    },
    "くら寿司": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "楽天ペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
    },
    "日高屋": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["店舗によって対応状況に違いがあります"] },
    },
    "ジョナサン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります", "公式アプリからの事前決済はクレジットカードのみです"] },
    },
    "バーミヤン": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります", "公式アプリからの事前決済はクレジットカードのみです"] },
    },
    "ポプラ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"], 使えない: ["nanaco"] },
      その他: { 使える: ["デビットカード"], 使えない: ["コード決済・クレジットカード・電子マネー・クオカードを組み合わせた併用払いはできません"] },
    },
    "ニューデイズ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
    },
    "マックスバリュ": {
      クレジットカード: { 使える: ["Visa", "JCB", "タッチ決済"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON"], 使えない: ["nanaco", "楽天Edy"] },
      その他: { 使える: ["AEON Pay（イオンペイ）"], 使えない: ["店舗によって対応状況が異なる場合があります"] },
    },
    "ダイエー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使えない: ["PayPay", "d払い", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON"] },
      その他: { 使える: ["AEON Pay（イオンペイ）"], 使えない: ["PayPay・au PAY・d払い・メルペイは2025年5月31日で取り扱いを終了しました"] },
    },
    "ビッグエー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB"] },
      QRコード決済: { 使える: ["PayPay", "au PAY"], 使えない: ["d払い", "楽天ペイ", "メルペイ"] },
      電子マネー: { 使える: ["WAON"], 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "nanaco", "楽天Edy"] },
    },
    "サニー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "楽天ペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）"] },
      その他: { 使えない: ["店舗によって対応が異なる場合があります"] },
    },
    "東急ストア": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"], 使えない: ["WAON", "nanaco"] },
    },
    "いなげや": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["楽天ポイント・dポイント・Vポイント・Pontaポイント・WAON POINTなどの共通ポイントカード"] },
    },
    "コープ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      その他: { 使えない: ["生協によって使える支払い方法が異なります", "PayPayなどの二次元コード決済は、使えない生協が多くあります"] },
    },
    "ぱぱす": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
    },
    "トモズ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay"] },
    },
    "セガミ薬局": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります"] },
    },
    "フレッシュネスバーガー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["商品券・ギフトカード（食事券を含む）は使えません"] },
    },
    "ゼッテリア": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["モバイルオーダー以外の店頭ではPayPayなどのQRコード決済は使えません"] },
    },
    "エクセルシオールカフェ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay"] },
      その他: { 使えない: ["店舗によって対応状況が異なる場合があります"] },
    },
    "星乃珈琲店": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["デビットカード・プリペイドカード（au PAYプリペイドカード・dカード プリペイドなど）"], 使えない: ["QRコード決済は基本的に使えません（PayPayなどが使える店舗もあります）", "店舗によって使える決済手段が大きく異なります", "ポイントカードは使えません"] },
    },
    "夢庵": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります", "公式アプリからの事前決済はクレジットカードのみです"] },
    },
    "しゃぶ葉": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります", "公式アプリからの事前決済はクレジットカードのみです"] },
    },
    "ステーキガスト": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使える決済手段が異なる場合があります", "公式アプリからの事前決済はクレジットカードのみです"] },
    },
    "なか卯": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"], 使えない: ["WAON", "nanaco"] },
    },
    "ほっともっと": {
      クレジットカード: { 使える: ["Visa", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["ほっともっとの電子マネー"], 使えない: ["PiTaPaは使えません", "店頭でのQRコード決済・楽天Edy・交通系電子マネーへのチャージはできません", "店舗によって使えるキャッシュレス決済が異なる場合があります"] },
    },
    "餃子の王将": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["共通ポイント（dポイント・楽天ポイントなど）は使えません"] },
    },
    "リンガーハット": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "楽天Edy"] },
      その他: { 使えない: ["店舗によってはクレジットカードなどが使えない場合があります"] },
    },
    "てんや": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "楽天Edy"] },
      その他: { 使えない: ["モバイルオーダーはクレジットカードのみで、QRコード決済・電子マネーは使えません", "クレジットカードと電子マネーの併用払いはできません"] },
    },
    "TSUTAYA": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "au PAY", "メルペイ"], 使えない: ["d払い", "楽天ペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["図書カード・各種ギフトカード（店舗によってQUOカードも可）"], 使えない: ["店舗によって対応する決済手段が異なります"] },
    },
    "ゲオ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["独自の電子マネー「Lueca」", "デビットカード"], 使えない: ["商品券・ギフトカードは使えません"] },
    },
    "ブックオフ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使えない: ["nanaco・WAONは、ほとんどの店舗で使えません", "商品券・図書カードは使えません", "QRコード決済が使えるのは約8割の店舗です"] },
    },
    "ワッツ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["共通ポイントカード（楽天ポイント・dポイント・Vポイント・Pontaポイント）は使えません", "店舗によって対応が異なります"] },
    },
    "シェル": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使える: ["モバイルDrive Pay（独自のアプリ決済）"], 使えない: ["PayPay・楽天ペイ・au PAYは2025年4月から順次導入中で、使えるのは一部の店舗のみです", "店舗によって使えない決済手段があります"] },
    },
    "キグナス": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      その他: { 使えない: ["iD・QUICPay・交通系電子マネーは、基本的に使えません（店舗によって対応が異なる場合があります）", "QRコード決済は店舗によって使える場合があります"] },
    },
    "ビッグエコー": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "タッチ決済"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "楽天Edy"] },
      その他: { 使える: ["ジェフグルメカード", "ビッグエコーアプリポイント・DKポイント・dポイントでの支払い"], 使えない: ["一部の店舗では取り扱いのない決済手段があります"] },
    },
    "カラオケ館": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      QRコード決済: { 使える: ["PayPay", "d払い", "楽天ペイ", "au PAY", "メルペイ"] },
      電子マネー: { 使える: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay", "WAON", "nanaco", "楽天Edy"] },
      その他: { 使えない: ["店舗によって使えないカードブランドや電子マネーがあります"] },
    },
    "TOHOシネマズ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      その他: { 使える: ["現金", "TOHOシネマズギフトカード", "飲食売店では、PayPay・au PAY・d払い・楽天ペイ・メルペイが使える劇場が多くあります"], 使えない: ["劇場窓口・自動券売機では、QRコード決済と電子マネー（交通系ICを含む）は使えません"] },
    },
    "イオンシネマ": {
      クレジットカード: { 使える: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club"] },
      電子マネー: { 使える: ["WAON"], 使えない: ["交通系IC（Suica・PASMOなど）", "iD", "QUICPay"] },
      その他: { 使える: ["現金", "劇場の券売機・窓口で使える電子マネーはWAONのみです"], 使えない: ["劇場の券売機・窓口では、QRコード決済は使えません", "オンライン購入（e席リザーブ）では、PayPayなどのオンライン決済が使えます（窓口とは対応が異なります）"] },
    },
};
