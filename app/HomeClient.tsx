"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { categoryOrder, paymentData } from "./data";
import { getStoreId } from "./storeIds";
import {
  findTodaysDeals,
  formatJstDateLabel,
  formatRateHeadline,
  getBrandChip,
  getJstDate,
  getPointStyle,
  shortChipLabel,
  type JstDate,
} from "./utils";
import MyCardsButton from "./components/MyCardsButton";
import MyCardsModal from "./components/MyCardsModal";
import { useMyCards } from "./hooks/useMyCards";

export default function HomeClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [today, setToday] = useState<JstDate | null>(null);
  const {
    myCardIds,
    isModalOpen,
    openModal,
    closeModal,
    toggleMyCard,
  } = useMyCards();

  // 日付はサーバーとクライアントで値がずれるとハイドレーションエラーに
  // なるため、マウント後（クライアント側）でだけ日本時間の今日を確定させる。
  useEffect(() => {
    setToday(getJstDate());
  }, []);

  const todaysDeals = useMemo(
    () => (today ? findTodaysDeals(paymentData, today) : []),
    [today]
  );

  // 店舗ボタンに並べるポイントアイコン用のマップ（店舗名→共通ポイントの配列）。
  const storePointTypes = useMemo(() => {
    const map: Record<string, string[]> = {};
    paymentData.forEach((store) => {
      map[store.店舗] = store.共通ポイント;
    });
    return map;
  }, []);

  // カテゴリごとに、検索キーワードに一致する店舗だけをグループ化する。
  const groupedStores = useMemo(() => {
    const query = searchQuery.trim();
    return categoryOrder
      .map((category) => ({
        category,
        stores: paymentData
          .filter((store) => store.カテゴリ === category)
          .filter((store) => query === "" || store.店舗.includes(query))
          .map((store) => store.店舗),
      }))
      .filter((group) => group.stores.length > 0);
  }, [searchQuery]);

  return (
    <main>
      {today && (
        <section className="today-deals">
          <p className="today-deals-label">今日お得なお店</p>

          {todaysDeals.length === 0 ? (
            <p className="today-deals-empty">
              今日は特別な特典日はありません
            </p>
          ) : (
            <div className="today-deals-list">
              {todaysDeals.map((deal) => {
                const chip = getBrandChip(deal.candidate.カード);
                const dateLabel = formatJstDateLabel(today);
                const storeId = getStoreId(deal.店舗);
                if (!storeId) return null;
                return (
                  <Link
                    key={`${deal.店舗}::${deal.candidate.カード}`}
                    href={`/store/${storeId}/`}
                    className="today-deal-card"
                  >
                    <span
                      className="today-deal-logo"
                      style={{ backgroundColor: chip.bg }}
                    >
                      <span className="today-deal-logo-label">
                        {shortChipLabel(chip.label)}
                      </span>
                    </span>
                    <span className="today-deal-text">
                      {dateLabel}は
                      <strong>{deal.店舗}</strong>が
                      <strong className="today-deal-rate">
                        {formatRateHeadline(deal.candidate.還元率)}
                      </strong>
                      お得
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      <h1>お得な支払い方法チェッカー</h1>

      <MyCardsButton onClick={openModal} count={myCardIds?.size ?? 0} />

      <div className="store-search">
        <input
          type="text"
          inputMode="search"
          className="store-search-input"
          placeholder="店舗名で検索"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {groupedStores.length === 0 && (
        <p className="store-search-empty">
          「{searchQuery}」に一致する店舗が見つかりません
        </p>
      )}

      {groupedStores.map((group) => (
        <div className="store-category" key={group.category}>
          <p className="store-category-label">{group.category}</p>
          <div className="store-selector">
            {group.stores.map((store) => {
              const storeId = getStoreId(store);
              if (!storeId) return null;
              return (
                <Link
                  key={store}
                  href={`/store/${storeId}/`}
                  className="store-button"
                >
                  <span className="store-button-name">{store}</span>
                  <span className="store-points">
                    {(storePointTypes[store] ?? []).map((token) => {
                      const style = getPointStyle(token);
                      return (
                        <span
                          key={token}
                          className="point-icon"
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                          }}
                          title={token}
                        >
                          {style.label}
                        </span>
                      );
                    })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <p className="footer-note">
        情報は2026年9月時点のものです。最新の条件は
        各カード会社の公式サイトをご確認ください
      </p>

      {isModalOpen && (
        <MyCardsModal
          myCardIds={myCardIds}
          onToggle={toggleMyCard}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
