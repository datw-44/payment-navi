import type { JstDate } from "../../utils";
export type Offer = { store: string; storeId: string; card: string; rate: string; dateCondition: string; summary: string; note: string; condition: string; points: string; essentials: string[] };
export const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
export const iso = (d: JstDate) => `${d.year}-${String(d.month).padStart(2,"0")}-${String(d.day).padStart(2,"0")}`;
export const dateAt = (year: number, month: number, day: number): JstDate => {
  const d = new Date(Date.UTC(year, month - 1, day));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth()+1, day: d.getUTCDate(), weekday: d.getUTCDay() };
};
export const daysInMonth = (y: number, m: number) => dateAt(y, m+1, 0).day;
export const moveMonth = (d: JstDate, delta: number) => {
  const first = dateAt(d.year, d.month+delta, 1);
  return dateAt(first.year, first.month, Math.min(d.day, daysInMonth(first.year, first.month)));
};
// 日付の列挙・連続期間・曜日だけを解釈する。未知の書式を推測で日付へ変換しない。
export function ruleDates(rule: string): { kind: "month" | "week"; values: number[] } | null {
  if (/^毎週[日月火水木金土]曜日?(?:・[日月火水木金土]曜日?)*$/.test(rule)) {
    return { kind: "week", values: [...new Set((rule.match(/[日月火水木金土](?=曜)/g) ?? []).map(d => weekdays.indexOf(d)))] };
  }
  if (!/^毎月\d{1,2}日?(?:[〜～-]\d{1,2})?日(?:・\d{1,2}日?(?:[〜～-]\d{1,2})?日)*$/.test(rule)) return null;
  const values: number[] = [];
  for (const part of rule.slice(2).split("・")) {
    const [start, end = start] = part.replaceAll("日", "").split(/[〜～-]/).map(Number);
    if (start < 1 || end > 31 || start > end) return null;
    for (let n=start; n<=end; n++) values.push(n);
  }
  return { kind: "month", values: [...new Set(values)] };
}
export function matchesDay(rule: string, date: JstDate) {
  const parsed = ruleDates(rule);
  return Boolean(parsed?.values.includes(parsed.kind === "week" ? date.weekday : date.day));
}
export const offersOn = (offers: Offer[], date: JstDate) => offers.filter(offer => matchesDay(offer.dateCondition, date));
