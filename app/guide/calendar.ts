import { paymentData } from "../data";
import { getStoreId } from "../storeIds";
import { parseRateValue } from "../utils";

// お得な日カレンダーの1行分。「特定日限定」の候補データから自動生成する。
export type CalendarEntry = {
  store: string;
  storeId: string;
  card: string;
  rate: string;
  summary: string;
  note: string;
};

export type CalendarData = {
  monthly: { day: number; entries: CalendarEntry[] }[];
  weekly: { weekday: number; entries: CalendarEntry[] }[];
};

// 月〜日の順で並べる（0=日曜）
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const WEEKDAY_INDEX: Record<string, number> = {
  日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6,
};

export function buildCalendarData(): CalendarData {
  const monthly = new Map<number, Map<string, { entry: CalendarEntry; value: number }>>();
  const weekly = new Map<number, Map<string, { entry: CalendarEntry; value: number }>>();

  // 同じ店舗・同じ日に複数の候補がある場合は、還元率が高い方だけを載せる。
  const put = (
    target: Map<number, Map<string, { entry: CalendarEntry; value: number }>>,
    key: number,
    entry: CalendarEntry,
    value: number
  ) => {
    const bucket = target.get(key) ?? new Map();
    const current = bucket.get(entry.store);
    if (!current || current.value < value) bucket.set(entry.store, { entry, value });
    target.set(key, bucket);
  };

  paymentData.forEach((store) => {
    const storeId = getStoreId(store.店舗);
    if (!storeId) return;
    store.候補.forEach((candidate) => {
      if (!candidate.特定日限定 || !candidate.対象日条件) return;
      const condition = candidate.対象日条件;
      const entry: CalendarEntry = {
        store: store.店舗,
        storeId,
        card: candidate.カード,
        rate: candidate.還元率,
        summary: candidate.条件要約,
        note: candidate.注意,
      };
      const value = parseRateValue(candidate.還元率);
      if (condition.includes("毎週")) {
        (condition.match(/[月火水木金土日](?=曜)/g) ?? []).forEach((d) =>
          put(weekly, WEEKDAY_INDEX[d], entry, value)
        );
      } else if (condition.includes("毎月")) {
        (condition.match(/\d+(?=日)/g) ?? []).map(Number).forEach((day) =>
          put(monthly, day, entry, value)
        );
      }
    });
  });

  const toEntries = (bucket: Map<string, { entry: CalendarEntry; value: number }>) =>
    [...bucket.values()].sort((a, b) => b.value - a.value).map((x) => x.entry);

  return {
    monthly: [...monthly.keys()]
      .sort((a, b) => a - b)
      .map((day) => ({ day, entries: toEntries(monthly.get(day)!) })),
    weekly: WEEKDAY_ORDER.filter((w) => weekly.has(w)).map((weekday) => ({
      weekday,
      entries: toEntries(weekly.get(weekday)!),
    })),
  };
}
