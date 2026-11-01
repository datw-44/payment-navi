import { getAllStoreIdEntries } from "../../storeIds";
import { essentialConditions } from "../../design/store-guide/essentialConditions";
import type { Offer } from "./model";
export function getOffers(): Offer[] {
  return getAllStoreIdEntries().flatMap(({store, storeId}) => store.候補.filter(c => c.特定日限定 && c.対象日条件).map(c => ({
    store: store.店舗, storeId, card: c.カード, rate: c.還元率, dateCondition: c.対象日条件!, summary: c.条件要約, note: c.注意, condition: c.条件, points: c.ポイント種類, essentials: essentialConditions(c),
  })));
}
