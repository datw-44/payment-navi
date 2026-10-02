import type { PaymentCandidate, StorePayments } from "../data";
import { parseRateValue } from "../utils";

// 「スマホのタッチ決済で7%以上」の三井住友カード系の候補かどうか。
// タッチ決済の記事の対象店舗一覧と、店舗ページからの関連リンクの判定に使う。
export function isSmbcTouchCandidate(candidate: PaymentCandidate): boolean {
  return (
    /三井住友|Olive/.test(candidate.カード) &&
    /スマホのタッチ決済/.test(candidate.条件要約 + candidate.条件) &&
    parseRateValue(candidate.還元率) >= 7
  );
}

// 店舗ページから関連づける記事のID一覧を返す（データから自動判定する）。
export function getRelatedGuideIds(store: StorePayments): string[] {
  const ids: string[] = [];
  if (store.店舗 === "ウエルシア") ids.push("welcatsu");
  if (store.候補.some(isSmbcTouchCandidate)) ids.push("touch-payment");
  if (store.候補.some((c) => c.特定日限定 && c.対象日条件)) ids.push("calendar");
  return ids;
}
