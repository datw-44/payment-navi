import Link from "next/link";
import { categoryOrder, paymentData } from "../data";
import { getStoreId } from "../storeIds";
import { parseRateValue } from "../utils";
import { isSmbcTouchCandidate } from "./related";

// タッチ決済の記事の「対象店舗一覧」。既存データから自動生成する。
export default function SmbcStoreList() {
  const groups = categoryOrder
    .map((category) => ({
      category,
      stores: paymentData
        .filter((store) => store.カテゴリ === category && getStoreId(store.店舗))
        .map((store) => {
          const hits = store.候補.filter(isSmbcTouchCandidate);
          const best = Math.max(0, ...hits.map((c) => parseRateValue(c.還元率)));
          return { name: store.店舗, hits: hits.length, best };
        })
        .filter((store) => store.hits > 0),
    }))
    .filter((group) => group.stores.length > 0);

  return (
    <div className="guide-store-groups">
      {groups.map((group) => (
        <div key={group.category}>
          <p className="guide-store-group-label">{group.category}</p>
          <ul className="guide-store-links">
            {group.stores.map((store) => (
              <li key={store.name}>
                <Link href={`/store/${getStoreId(store.name)}/`}>
                  {store.name}
                  <span className="guide-store-rate">最大{store.best}%</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
