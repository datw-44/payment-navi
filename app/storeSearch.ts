// 検索専用の別名。店舗名、URL、ランキング用データには使わない。
const ALIASES: Record<string, readonly string[]> = {
  セブンイレブン: ["7-eleven", "seven eleven"],
  ファミリーマート: ["ファミマ"],
  マクドナルド: ["マック", "マクド"],
  マツモトキヨシ: ["マツキヨ"],
  ウエルシア: ["ウェルシア"],
  スターバックス: ["スタバ"],
  ケンタッキーフライドチキン: ["ケンタ", "KFC"],
  "ドン・キホーテ": ["ドンキ"],
  CoCo壱番屋: ["ココイチ"],
};

export function normalizeStoreQuery(value: string): string {
  return value.normalize("NFKC").toLowerCase()
    .replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
    .replace(/[\s・･\-‐‑–—−ー]/g, "");
}

export function matchesStoreQuery(name: string, storeId: string, query: string): boolean {
  const normalized = normalizeStoreQuery(query);
  return [name, storeId, ...(ALIASES[name] ?? [])]
    .some((value) => normalizeStoreQuery(value).includes(normalized));
}
