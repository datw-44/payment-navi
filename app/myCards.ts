// 「マイカード」機能：ユーザーが持っている支払い方法を登録し、
// 店舗の候補一覧を「登録したカードだけ」で絞り込むための仕組み。

export type MyCardCategory =
  | "クレジットカード"
  | "QR決済"
  | "電子マネー"
  | "店舗独自カード";

export type MyCardDef = {
  id: string;
  name: string;
  category: MyCardCategory;
  // 候補の「カード」欄の文字列にこの語が含まれていれば、
  // その候補はこのカードを必要とすると判定する。
  keyword: string;
};

export const myCardCategoryOrder: MyCardCategory[] = [
  "クレジットカード",
  "QR決済",
  "電子マネー",
  "店舗独自カード",
];

export const myCardRegistry: MyCardDef[] = [
  // クレジットカード
  { id: "mitsui", name: "三井住友カード（NL）等", category: "クレジットカード", keyword: "三井住友カード" },
  { id: "olive", name: "Oliveフレキシブルペイ", category: "クレジットカード", keyword: "Olive" },
  { id: "rakuten_card", name: "楽天カード", category: "クレジットカード", keyword: "楽天カード" },
  { id: "dcard", name: "dカード", category: "クレジットカード", keyword: "dカード" },
  { id: "paypay_card", name: "PayPayカード", category: "クレジットカード", keyword: "PayPayカード" },
  { id: "jcb_w", name: "JCBカードW", category: "クレジットカード", keyword: "JCBカードW" },
  { id: "recruit_card", name: "リクルートカード", category: "クレジットカード", keyword: "リクルートカード" },
  { id: "aeon_card", name: "イオンカード", category: "クレジットカード", keyword: "イオンカード" },
  { id: "amex", name: "アメリカン・エキスプレス・カード", category: "クレジットカード", keyword: "アメリカン・エキスプレス" },
  { id: "mufg_card", name: "三菱UFJカード", category: "クレジットカード", keyword: "三菱UFJカード" },
  { id: "epos_card", name: "エポスカード", category: "クレジットカード", keyword: "エポスカード" },
  { id: "saison_card", name: "セゾンカード", category: "クレジットカード", keyword: "セゾンカード" },
  { id: "life_card", name: "ライフカード", category: "クレジットカード", keyword: "ライフカード" },
  { id: "amazon_mastercard", name: "Amazon Mastercard", category: "クレジットカード", keyword: "Amazon Mastercard" },
  { id: "view_card", name: "ビューカード", category: "クレジットカード", keyword: "ビューカード" },
  { id: "ana_card", name: "ANAカード", category: "クレジットカード", keyword: "ANAカード" },
  { id: "jal_card", name: "JALカード", category: "クレジットカード", keyword: "JALカード" },
  { id: "mitsui_gold", name: "三井住友カード ゴールド（NL）", category: "クレジットカード", keyword: "三井住友カード ゴールド" },
  { id: "dcard_gold", name: "dカード GOLD", category: "クレジットカード", keyword: "dカード GOLD" },
  { id: "au_pay_card", name: "au PAYカード", category: "クレジットカード", keyword: "au PAYカード" },
  { id: "aeon_select", name: "イオンカードセレクト", category: "クレジットカード", keyword: "イオンカードセレクト" },
  { id: "rakuten_debit", name: "楽天銀行デビットカード", category: "クレジットカード", keyword: "楽天銀行デビット" },

  // QR決済
  { id: "paypay_app", name: "PayPay（残高・あと払い）", category: "QR決済", keyword: "PayPay" },
  { id: "dharai", name: "d払い", category: "QR決済", keyword: "d払い" },
  { id: "rakuten_pay", name: "楽天ペイ（楽天キャッシュ）", category: "QR決済", keyword: "楽天ペイ" },
  { id: "au_pay", name: "au PAY", category: "QR決済", keyword: "au PAY" },
  { id: "mercpay", name: "メルペイ", category: "QR決済", keyword: "メルペイ" },

  // 電子マネー・共通ポイントカード
  { id: "nanaco", name: "nanaco", category: "電子マネー", keyword: "nanaco" },
  { id: "waon", name: "WAON（電子マネー・WAON POINT）", category: "電子マネー", keyword: "WAON" },
  { id: "suica", name: "Suica・PASMO等の交通系ICカード", category: "電子マネー", keyword: "Suica" },
  { id: "rakuten_point_card", name: "楽天ポイントカード", category: "電子マネー", keyword: "楽天ポイント" },
  { id: "d_point_card", name: "dポイントカード", category: "電子マネー", keyword: "dポイントカード" },
  { id: "v_point_card", name: "Vポイントカード", category: "電子マネー", keyword: "Vポイントカード" },
  { id: "id_quicpay", name: "iD・QUICPay", category: "電子マネー", keyword: "QUICPay" },
  { id: "rakuten_edy", name: "楽天Edy", category: "電子マネー", keyword: "楽天Edy" },

  // 店舗独自カード・アプリ
  { id: "seven_card_plus", name: "セブンカード・プラス", category: "店舗独自カード", keyword: "セブンカード・プラス" },
  { id: "seven_app", name: "セブン-イレブンアプリ", category: "店舗独自カード", keyword: "セブン-イレブンアプリ" },
  { id: "famima_card", name: "ファミマカード", category: "店舗独自カード", keyword: "ファミマカード" },
  { id: "famipay_linked", name: "ファミペイ（カード連携）", category: "店舗独自カード", keyword: "ファミペイ連携" },
  { id: "tsuruha_card", name: "ツルハグループポイントカード", category: "店舗独自カード", keyword: "ツルハグループポイントカード" },
  { id: "lawson_ponta_plus", name: "ローソンPontaプラス", category: "店舗独自カード", keyword: "ローソンPontaプラス" },
  { id: "iy_app", name: "イトーヨーカドーアプリ", category: "店舗独自カード", keyword: "イトーヨーカドーアプリ" },
  { id: "seiyu_app", name: "西友アプリ", category: "店舗独自カード", keyword: "西友アプリ" },
  { id: "gold_point_card_plus", name: "ゴールドポイントカード・プラス", category: "店舗独自カード", keyword: "ゴールドポイントカード・プラス" },
  { id: "bic_suica_card", name: "ビックカメラSuicaカード", category: "店舗独自カード", keyword: "ビックカメラSuicaカード" },
  { id: "yamada_labi_card", name: "ヤマダLABIカード", category: "店舗独自カード", keyword: "ヤマダLABIカード" },
  { id: "sukaira_app", name: "すかいらーくアプリ", category: "店舗独自カード", keyword: "すかいらーくアプリ" },
  { id: "dotor_value_card", name: "ドトールバリューカード", category: "店舗独自カード", keyword: "ドトールバリューカード" },
  { id: "tullys_card", name: "タリーズカード", category: "店舗独自カード", keyword: "タリーズカード" },
  { id: "eneos_card_p", name: "ENEOSカードP", category: "店舗独自カード", keyword: "ENEOSカードP" },
  { id: "lacuca", name: "LaCuCa（ライフ）", category: "店舗独自カード", keyword: "LaCuCa" },
  { id: "lc_jcb_card", name: "LC JCBカード（ライフ）", category: "店舗独自カード", keyword: "LC JCBカード" },
  { id: "gyomuca", name: "Gyomuca（業務スーパー）", category: "店舗独自カード", keyword: "Gyomuca" },
  { id: "majica", name: "majica（ドン・キホーテ）", category: "店舗独自カード", keyword: "majica" },
  { id: "apollostation_card", name: "apollostation card（出光）", category: "店舗独自カード", keyword: "apollostation" },
  { id: "cosmo_the_card", name: "コスモ・ザ・カード・オーパス", category: "店舗独自カード", keyword: "コスモ・ザ・カード" },
  { id: "muji_card", name: "MUJI Card（無印良品）", category: "店舗独自カード", keyword: "MUJI" },
  { id: "nitori_app", name: "ニトリアプリ", category: "店舗独自カード", keyword: "ニトリ" },
  { id: "matsuya_app", name: "松屋フーズ公式アプリ", category: "店舗独自カード", keyword: "松屋アプリ" },
  { id: "sushiro_maido_point", name: "まいどポイント（スシロー）", category: "店舗独自カード", keyword: "まいどポイント" },
  { id: "hamazushi_cooca", name: "ZENSHO CooCa（はま寿司）", category: "店舗独自カード", keyword: "CooCa" },
  { id: "pecoma", name: "ペコマカード（セイコーマート）", category: "店舗独自カード", keyword: "ペコマ" },
  { id: "maruetsu_card", name: "マルエツカード", category: "店舗独自カード", keyword: "マルエツカード" },
  { id: "sugi_pay", name: "スギPay", category: "店舗独自カード", keyword: "スギPay" },
  { id: "comeka", name: "コメカ（コメダ珈琲店）", category: "店舗独自カード", keyword: "コメカ" },
  { id: "cainz_pay", name: "CAINZセゾンカード（CAINZ Pay）", category: "店舗独自カード", keyword: "CAINZセゾンカード" },
  { id: "cainz_card", name: "カインズカード", category: "店舗独自カード", keyword: "カインズカード" },
  { id: "komeri_card", name: "コメリカード", category: "店舗独自カード", keyword: "コメリカード" },
  { id: "dcm_myboo", name: "DCMマイボカード", category: "店舗独自カード", keyword: "DCMマイボカード" },
  { id: "kohnan_card", name: "コーナンカード", category: "店舗独自カード", keyword: "コーナンカード" },
  { id: "edion_card", name: "エディオンカード", category: "店舗独自カード", keyword: "エディオンカード" },
  { id: "joshin_card", name: "ジョーシンカード", category: "店舗独自カード", keyword: "ジョーシンカード" },
  { id: "shimamura_park", name: "しまむらパーク", category: "店舗独自カード", keyword: "しまむらパーク" },
  { id: "gu_app", name: "GUアプリ", category: "店舗独自カード", keyword: "GUアプリ" },
  { id: "lopita", name: "ロピタ（ロピア）", category: "店舗独自カード", keyword: "ロピタ" },
  { id: "okclub", name: "オーケークラブ会員カード", category: "店舗独自カード", keyword: "オーケークラブ" },
  { id: "summit_card", name: "サミットカード", category: "店舗独自カード", keyword: "サミットカード" },
  { id: "yaoko_card", name: "ヤオコーカード", category: "店舗独自カード", keyword: "ヤオコーカード" },
  { id: "yaoko_pay", name: "ヤオコーPay", category: "店舗独自カード", keyword: "ヤオコーPay" },
  { id: "create_sd_card", name: "クリエイトSDポイントカード", category: "店舗独自カード", keyword: "クリエイトSDポイントカード" },
  { id: "kawachi_card", name: "カワチポイントカード", category: "店舗独自カード", keyword: "カワチポイントカード" },
];

// 候補名（カード欄）に含まれるキーワードから、必要なマイカードIDの一覧を求める。
// 長いキーワードから順に判定し、一致した分は文字列から取り除いてから次を判定することで、
// 「Suica」と「ビックカメラSuicaカード」のような包含関係を誤判定しないようにする。
function getRequiredCardIds(cardName: string): string[] {
  const sortedByKeywordLength = [...myCardRegistry].sort(
    (a, b) => b.keyword.length - a.keyword.length
  );
  let remaining = cardName;
  const ids: string[] = [];
  for (const def of sortedByKeywordLength) {
    if (remaining.includes(def.keyword)) {
      ids.push(def.id);
      remaining = remaining.split(def.keyword).join("");
    }
  }
  return ids;
}

// 登録したカードだけで、この候補を使えるかどうかを判定する。
// カード名に候補が複数一致した場合、「／」区切り（選択式）はいずれか1つ、
// それ以外（＋区切りなど）はすべて登録済みである必要がある。
export function candidateMatchesMyCards(
  cardName: string,
  ownedIds: Set<string>
): boolean {
  const required = getRequiredCardIds(cardName);
  if (required.length === 0) return false;
  // 上位カードは、対応する基本カードの特典も使えるものとして扱う
  // （ゴールドNL＝NLと同じ7%対象、dカード GOLD＝dカードと同じ基本還元率、
  //   イオンカードセレクト＝イオンカードと同じ特典）。
  const owned = new Set(ownedIds);
  for (const [upper, base] of IMPLIED_CARD_IDS) {
    if (owned.has(upper)) owned.add(base);
  }
  ownedIds = owned;
  if (cardName.includes("／")) {
    return required.some((id) => ownedIds.has(id));
  }
  return required.every((id) => ownedIds.has(id));
}

const IMPLIED_CARD_IDS: [string, string][] = [
  ["mitsui_gold", "mitsui"],
  ["dcard_gold", "dcard"],
  ["aeon_select", "aeon_card"],
];

const STORAGE_KEY = "otoku-my-cards-v1";

export function loadMyCardIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const validIds = new Set(myCardRegistry.map((def) => def.id));
    return new Set(
      parsed.filter(
        (id): id is string => typeof id === "string" && validIds.has(id)
      )
    );
  } catch {
    return new Set();
  }
}

export function saveMyCardIds(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // プライベートブラウジング等でlocalStorageが使えない場合は保存をスキップする
  }
}
