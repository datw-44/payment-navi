// カテゴリごとのテーマカラー（店舗一覧の見出しアイコンに使用）。
// 新しいカテゴリをcategoryOrderに追加したら、ここにも1行追加する。
export const CATEGORY_COLORS: Record<string, string> = {
  コンビニ: "#16A34A",
  ドラッグストア: "#2563EB",
  スーパー: "#EA580C",
  ファストフード: "#DC2626",
  家電量販店: "#0891B2",
  ホームセンター: "#65A30D",
  アパレル: "#DB2777",
  カフェ: "#92400E",
  飲食チェーン: "#C026D3",
  その他: "#7C3AED",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#6b6b6b";
}
