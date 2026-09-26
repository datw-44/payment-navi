import type { PaymentCandidate, StorePayments } from "./data";

// 還元率の文字列（例: "7%"、"最大6%"、"5%割引"、
// "毎日8%（10日・20日16時〜23時59分は最大12%）"）から並び替え用の数値を取り出す。
// "%" の直前の数値だけを対象にすることで、時刻表記（16時〜23時59分など）の
// 数字を誤って還元率として拾わないようにしている。範囲表記は上限の数値を採用する。
export function parseRateValue(rate: string): number {
  const numbers = rate.match(/\d+(\.\d+)?(?=%)/g);
  if (!numbers) return 0;
  return Math.max(...numbers.map(Number));
}

// カード名の先頭1文字を画像プレースホルダーに表示する。
// サロゲートペア（絵文字など）を考慮してArray.fromで1文字目を取り出す。
export function getInitial(name: string): string {
  return Array.from(name.trim())[0] ?? "？";
}

// 文字列から安定したハッシュ値を作る（同じ文字列なら常に同じ値）。
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export type ChipStyle = { bg: string; label: string };

// ブランド名の一部を含むカード名を判定し、固定の色・ロゴ風ラベルを割り当てる。
// 上から順に判定するので、より具体的なキーワードを先に置く。
const BRAND_STYLES: { keyword: string; bg: string; label: string }[] = [
  { keyword: "CAINZ", bg: "#F58220", label: "CAINZ" },
  { keyword: "カインズ", bg: "#F58220", label: "CAINZ" },
  { keyword: "コメリ", bg: "#0B7F3E", label: "KOMERI" },
  { keyword: "DCM", bg: "#E60012", label: "DCM" },
  { keyword: "コーナン", bg: "#F39800", label: "KOHNAN" },
  { keyword: "エディオン", bg: "#E60012", label: "EDION" },
  { keyword: "ジョーシン", bg: "#E60012", label: "JOSHIN" },
  { keyword: "GUアプリ", bg: "#0056A8", label: "GU" },
  { keyword: "しまむら", bg: "#D6006C", label: "SHIMAMURA" },
  { keyword: "ロピタ", bg: "#E60012", label: "LOPIA" },
  { keyword: "オーケークラブ", bg: "#0056A8", label: "OK" },
  { keyword: "サミット", bg: "#E60012", label: "SUMMIT" },
  { keyword: "ヤオコー", bg: "#E60012", label: "YAOKO" },
  { keyword: "クリエイトSD", bg: "#0EA5E9", label: "CREATE SD" },
  { keyword: "カワチ", bg: "#F39800", label: "KAWACHI" },
  { keyword: "コメカ", bg: "#7B3F00", label: "KOMEDA" },
  { keyword: "Olive", bg: "#6B7A2B", label: "OLIVE" },
  { keyword: "三井住友", bg: "#1B5E3A", label: "MITSUI SUMITOMO" },
  { keyword: "セブンカード", bg: "#F2811D", label: "SEVEN CARD" },
  { keyword: "PayPay", bg: "#EE1D4A", label: "PayPay" },
  { keyword: "ローソン", bg: "#0057A8", label: "LAWSON PONTA" },
  { keyword: "dカード", bg: "#D6006C", label: "d CARD" },
  { keyword: "d払い", bg: "#B8005C", label: "d PAY" },
  { keyword: "dポイント", bg: "#D6006C", label: "d POINT" },
  { keyword: "ファミマカード", bg: "#049B67", label: "FAMIMA CARD" },
  { keyword: "JCB", bg: "#003A70", label: "JCB CARD W" },
  { keyword: "リクルートカード", bg: "#EE7800", label: "RECRUIT CARD" },
  { keyword: "イオン", bg: "#E4007F", label: "AEON CARD" },
  { keyword: "ゴールドポイント", bg: "#0056A8", label: "YODOBASHI" },
  { keyword: "ビック", bg: "#EB6100", label: "BIC CAMERA" },
  { keyword: "ヤマダ", bg: "#E60012", label: "YAMADA" },
  { keyword: "スターバックス", bg: "#00704A", label: "STARBUCKS" },
  { keyword: "ドトール", bg: "#A6332E", label: "DOUTOR" },
  { keyword: "タリーズ", bg: "#2E5C3E", label: "TULLY'S" },
  { keyword: "すかいらーく", bg: "#EE7B00", label: "GUSTO" },
  { keyword: "丸亀製麺", bg: "#B8860B", label: "MARUGAME" },
  { keyword: "ENEOS", bg: "#004EA2", label: "ENEOS" },
  { keyword: "LaCuCa", bg: "#00A650", label: "LIFE" },
  { keyword: "LC JCBカード", bg: "#00A650", label: "LIFE" },
  { keyword: "Gyomuca", bg: "#E85298", label: "GYOMU SUPER" },
  { keyword: "majica", bg: "#E4002B", label: "majica" },
  { keyword: "apollostation", bg: "#00A0E9", label: "IDEMITSU" },
  { keyword: "コスモ・ザ・カード", bg: "#0068B7", label: "COSMO" },
  { keyword: "MUJI", bg: "#C1272D", label: "MUJI" },
  { keyword: "ニトリ", bg: "#EE7B10", label: "NITORI" },
  { keyword: "松屋", bg: "#E60012", label: "MATSUYA" },
  { keyword: "まいどポイント", bg: "#F39800", label: "SUSHIRO" },
  { keyword: "CooCa", bg: "#E2001A", label: "HAMAZUSHI" },
  { keyword: "ペコマ", bg: "#0086D1", label: "SEICOMART" },
  { keyword: "マルエツ", bg: "#EE1C25", label: "MARUETSU" },
  { keyword: "スギPay", bg: "#F39800", label: "SUGI" },
  { keyword: "アメリカン・エキスプレス", bg: "#006FCF", label: "AMEX" },
  { keyword: "三菱UFJカード", bg: "#D91F2C", label: "MUFG CARD" },
  { keyword: "エポスカード", bg: "#C9252C", label: "EPOS" },
  { keyword: "セゾンカード", bg: "#009944", label: "SAISON" },
  { keyword: "ライフカード", bg: "#FF6600", label: "LIFE CARD" },
  { keyword: "Amazon", bg: "#FF9900", label: "AMAZON" },
  { keyword: "ビューカード", bg: "#00A7DB", label: "VIEW CARD" },
  { keyword: "ANAカード", bg: "#13448F", label: "ANA CARD" },
  { keyword: "JALカード", bg: "#DA1E28", label: "JAL CARD" },
  { keyword: "au PAY", bg: "#F16E00", label: "au PAY" },
  { keyword: "メルペイ", bg: "#E4383D", label: "MERPAY" },
  { keyword: "QUICPay", bg: "#EE7B00", label: "iD/QUICPay" },
  { keyword: "nanaco", bg: "#2C7A48", label: "nanaco" },
  { keyword: "WAON", bg: "#E4007F", label: "WAON" },
  { keyword: "楽天", bg: "#C71B1B", label: "RAKUTEN" },
];

// ブランドが判定できないカード（一般的なクレジットカードなど）用の予備パレット。
const FALLBACK_CHIP_PALETTE = [
  "#3B5BA5",
  "#2E7D32",
  "#8E24AA",
  "#00838F",
  "#AD1457",
  "#4527A0",
  "#546E7A",
];

// カード名からクレジットカード風プレースホルダーの配色とロゴ風ラベルを返す。
// 同じブランドのカードは常に同じ色になる（「三井住友カード等＋連携」も
// 「三井住友カード等（連携なし）」も同じ緑になる、など）。
export function getBrandChip(name: string): ChipStyle {
  // 「dポイント／楽天ポイント／Vポイントカード」のように複数ブランドの
  // ポイントカードをまとめて指す候補は、単一ブランドの色で塗らない。
  if (name.includes("／")) {
    return { bg: "#6b6b6b", label: "POINT CARD" };
  }

  const matched = BRAND_STYLES.find((brand) => name.includes(brand.keyword));
  if (matched) {
    return { bg: matched.bg, label: matched.label };
  }

  const index = hashString(name) % FALLBACK_CHIP_PALETTE.length;
  return { bg: FALLBACK_CHIP_PALETTE[index], label: getInitial(name) };
}

export type PointChipStyle = { bg: string; text: string; label: string };

// 貯まるポイントの種類ごとの配色（丸アイコン用）。
// パステル寄りの淡い背景色(bg)と、その上で読める同系色の濃い文字色(text)のペア。
const POINT_STYLES: Record<string, PointChipStyle> = {
  Vポイント: { bg: "#DCE6F5", text: "#25457A", label: "V" },
  楽天ポイント: { bg: "#FBDADA", text: "#9A3030", label: "R" },
  dポイント: { bg: "#FADCE9", text: "#9C2B62", label: "d" },
  PayPayポイント: { bg: "#FBDCE3", text: "#9A2A48", label: "P" },
  Pontaポイント: { bg: "#F5E1D4", text: "#824226", label: "P" },
  nanacoポイント: { bg: "#DBF0E1", text: "#2C7A48", label: "n" },
  セブンマイル: { bg: "#FCE9D6", text: "#8C551E", label: "7" },
  "Oki Dokiポイント": { bg: "#DCE3F0", text: "#1B3A6B", label: "J" },
  リクルートポイント: { bg: "#FCE3D6", text: "#8C3D14", label: "R" },
  "WAON POINT": { bg: "#FBDCEC", text: "#9C1E63", label: "W" },
};

const FALLBACK_POINT_PALETTE: { bg: string; text: string }[] = [
  { bg: "#E4E8EC", text: "#525B64" },
  { bg: "#EBE3F1", text: "#5B4A72" },
  { bg: "#DFEFF1", text: "#3B6F76" },
  { bg: "#F1E4E8", text: "#7A4C58" },
];

// 「ポイント種類」欄の1トークン（分割後の文字列）から丸アイコンの配色を返す。
// 既知のポイント名ならPOINT_STYLESの色、「不明」ならグレー、
// それ以外の未知の名称はハッシュ由来の色にフォールバックする。
export function getPointStyle(token: string): PointChipStyle {
  if (POINT_STYLES[token]) return POINT_STYLES[token];
  if (token === "不明") return { bg: "#eaeaea", text: "#808080", label: "?" };
  const index = hashString(token) % FALLBACK_POINT_PALETTE.length;
  const palette = FALLBACK_POINT_PALETTE[index];
  return { bg: palette.bg, text: palette.text, label: getInitial(token) };
}

// 還元率の見出し表示用に「7.0 %」の形へ整形する（内部の数値抽出はparseRateValueと同じ）。
export function formatRateHeadline(rate: string): string {
  return `${parseRateValue(rate).toFixed(1)} %`;
}

// 「1,000円払った場合にいくら戻るか」を表示用の文言にする。
// 数値はparseRateValue（見出しの還元率と同じ値）から計算し、
// 「割引」表記ならポイント還元ではなく「◯円引き」と書く。
export function formatRewardPer1000(rate: string): string {
  const amount = Number(((parseRateValue(rate) * 1000) / 100).toFixed(1));
  if (amount === 0) return "1,000円のお支払いでの還元はありません";
  const prefix = rate.includes("最大") ? "最大" : "";
  const unit = rate.includes("割引") ? "円引き" : "円分の還元";
  return `1,000円のお支払いで ${prefix}${amount}${unit}`;
}

// 還元率欄が「7%」のような単一の数値だけかどうかを判定する。
// falseの場合（「最大10%」「毎日8%（…）」など条件つきの表記）は、
// 見出しの数字だけでは条件が伝わらないため、元の文字列を別途小さく表示する。
export function isSimpleRate(rate: string): boolean {
  return /^\d+(\.\d+)?%$/.test(rate.trim());
}

// ブランドロゴのラベルをランキングカードの小さいロゴ用に短縮する
// （例: "MITSUI SUMITOMO" → "MITSUI"、"LAWSON PONTA" → "LAWSON"）。
export function shortChipLabel(label: string): string {
  return label.split(" ")[0];
}

export type RankTier = { label: string; className: string };

// 順位（0始まりのindex）から、バッジのラベルと色クラスを返す。
// 1位=金、2位=銀、3位=銅、4位以降=グレー。
export function getRankTier(index: number): RankTier {
  if (index === 0) return { label: "1位", className: "rank-badge-gold" };
  if (index === 1) return { label: "2位", className: "rank-badge-silver" };
  if (index === 2) return { label: "3位", className: "rank-badge-bronze" };
  return { label: `${index + 1}位`, className: "rank-badge-gray" };
}

// 店舗名アイコン用の配色パレット（ブランド判定とは別に、店舗名から一意に決める）。
const STORE_ICON_PALETTE = ["#2E7D32", "#C71B1B", "#1565C0", "#8E24AA", "#00838F"];

export function getStoreIconColor(name: string): string {
  const index = hashString(name) % STORE_ICON_PALETTE.length;
  return STORE_ICON_PALETTE[index];
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAY_INDEX: Record<string, number> = {
  日: 0,
  月: 1,
  火: 2,
  水: 3,
  木: 4,
  金: 5,
  土: 6,
};

export type JstDate = {
  year: number;
  month: number;
  day: number;
  // 0=日曜 ... 6=土曜
  weekday: number;
};

// 現在時刻を「日本時間（Asia/Tokyo）」の年月日・曜日に変換する。
// ブラウザやサーバーの実行環境のタイムゾーンに関わらず、常にJSTのカレンダー値を
// Intl.DateTimeFormatで直接取り出すことで判定する（「今日お得な店」機能の基準時刻）。
export function getJstDate(now: Date = new Date()): JstDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

// 「9月21日（月）」のような表示用の日付ラベルを作る。
export function formatJstDateLabel(date: JstDate): string {
  return `${date.month}月${date.day}日（${WEEKDAY_LABELS[date.weekday]}）`;
}

// 「毎月20日・30日」「毎週月曜・土曜」のような対象日条件の文字列と、
// 今日（JST）の日付を照らし合わせて一致するか判定する。
export function isTodayWithinCondition(
  condition: string,
  today: JstDate
): boolean {
  if (!condition) return false;

  if (condition.includes("毎週")) {
    const days = condition.match(/[月火水木金土日](?=曜)/g) ?? [];
    return days.some((d) => WEEKDAY_INDEX[d] === today.weekday);
  }

  if (condition.includes("毎月")) {
    const days = (condition.match(/\d+(?=日)/g) ?? []).map(Number);
    return days.includes(today.day);
  }

  return false;
}

export type TodaysDeal = {
  店舗: string;
  candidate: PaymentCandidate;
};

// 全店舗の候補から、今日（JST）が対象日条件に一致する「特定日限定」の
// 特典だけを集めて、還元率の高い順に並べる。
export function findTodaysDeals(
  paymentData: StorePayments[],
  today: JstDate
): TodaysDeal[] {
  const deals: TodaysDeal[] = [];
  paymentData.forEach((store) => {
    store.候補.forEach((candidate) => {
      if (
        candidate.特定日限定 &&
        candidate.対象日条件 &&
        isTodayWithinCondition(candidate.対象日条件, today)
      ) {
        deals.push({ 店舗: store.店舗, candidate });
      }
    });
  });
  return deals.sort(
    (a, b) =>
      parseRateValue(b.candidate.還元率) - parseRateValue(a.candidate.還元率)
  );
}
