import { paymentData, type StorePayments } from "./data";

// 店舗名 → URL用ID（検索エンジン向けの英数字スラッグ）。
// 「共通（上記以外）」のようにUIに出さないフォールバック店舗はここに含めない
// （含めないことでページが生成されず、一覧にも出ない）。
// 新しい店舗を追加したら、ここにも1行追加する。
export const STORE_ID_MAP: Record<string, string> = {
  セブンイレブン: "seven-eleven",
  ローソン: "lawson",
  ファミリーマート: "family-mart",
  マツモトキヨシ: "matsumotokiyoshi",
  ウエルシア: "welcia",
  ツルハドラッグ: "tsuruha-drug",
  サンドラッグ: "sundrug",
  イオン: "aeon",
  イトーヨーカドー: "ito-yokado",
  西友: "seiyu",
  マクドナルド: "mcdonalds",
  すき家: "sukiya",
  吉野家: "yoshinoya",
  ヨドバシカメラ: "yodobashi-camera",
  ビックカメラ: "biccamera",
  ヤマダ電機: "yamada-denki",
  スターバックス: "starbucks",
  ドトール: "doutor",
  タリーズ: "tullys",
  ガスト: "gusto",
  サイゼリヤ: "saizeriya",
  丸亀製麺: "marugame-seimen",
  ユニクロ: "uniqlo",
  ダイソー: "daiso",
  ENEOS: "eneos",
  ミニストップ: "ministop",
  デイリーヤマザキ: "daily-yamazaki",
  セイコーマート: "seicomart",
  スギ薬局: "sugi-drug",
  ココカラファイン: "cocokara-fine",
  コスモス薬品: "cosmos-pharmacy",
  ライフ: "life",
  マルエツ: "maruetsu",
  業務スーパー: "gyomu-super",
  コストコ: "costco",
  モスバーガー: "mos-burger",
  ケンタッキーフライドチキン: "kfc",
  バーガーキング: "burger-king",
  松屋: "matsuya",
  はま寿司: "hama-sushi",
  スシロー: "sushiro",
  セリア: "seria",
  キャンドゥ: "can-do",
  ニトリ: "nitori",
  無印良品: "muji",
  "ドン・キホーテ": "don-quijote",
  出光: "idemitsu",
  コスモ石油: "cosmo-oil",
  ローソンストア100: "lawson-store100",
  まいばすけっと: "my-basket",
  成城石井: "seijo-ishii",
  ロピア: "lopia",
  オーケー: "ok-store",
  サミット: "summit",
  ヤオコー: "yaoko",
  クリエイトSD: "create-sd",
  カワチ薬品: "kawachi-yakuhin",
  ダイコクドラッグ: "daikoku-drug",
  カインズ: "cainz",
  コメリ: "komeri",
  DCM: "dcm",
  コーナン: "kohnan",
  ケーズデンキ: "ks-denki",
  エディオン: "edion",
  ジョーシン: "joshin",
  GU: "gu",
  しまむら: "shimamura",
  ワークマン: "workman",
  コメダ珈琲店: "komeda-coffee",
  ミスタードーナツ: "mister-donut",
  CoCo壱番屋: "coco-ichibanya",
  くら寿司: "kura-sushi",
  日高屋: "hidakaya",
  ジョナサン: "jonathan",
  バーミヤン: "bamiyan",
};

// 店舗名からURL用IDを取得する。未登録の店舗名は undefined を返す
// （＝一覧やページ生成の対象外になる）。
export function getStoreId(storeName: string): string | undefined {
  return STORE_ID_MAP[storeName];
}

export type StoreIdEntry = { storeId: string; store: StorePayments };

// ページを生成する対象の店舗（IDが割り当てられている店舗）を
// { storeId, store } の形で一覧取得する。
export function getAllStoreIdEntries(): StoreIdEntry[] {
  return paymentData
    .map((store) => {
      const storeId = STORE_ID_MAP[store.店舗];
      return storeId ? { storeId, store } : null;
    })
    .filter((entry): entry is StoreIdEntry => entry !== null);
}

// URL用IDから店舗データを取得する。
export function getStoreByStoreId(storeId: string): StorePayments | undefined {
  return getAllStoreIdEntries().find((entry) => entry.storeId === storeId)
    ?.store;
}
