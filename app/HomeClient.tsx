"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getCategoryColor } from "./categoryTheme";
import { matchesStoreQuery } from "./storeSearch";
import {
  isTodayWithinCondition,
  parseRateValue,
  formatJstDateLabel,
  getBrandChip,
  getJstDate,
  getPointStyle,
  shortChipLabel,
  type JstDate,
} from "./utils";
import MyCardsButton from "./components/MyCardsButton";
import MyCardsModal from "./components/MyCardsModal";
import { useMyCards } from "./hooks/useMyCards";
import GuideList from "./guide/GuideList";

type HomeStore = { name: string; storeId: string; category: string; points: string[] };
type HomeDeal = { 店舗: string; storeId: string; candidate: { カード: string; 還元率: string; 対象日条件: string } };

export default function HomeClient({ stores, categories, deals }: {
  stores: HomeStore[]; categories: string[]; deals: HomeDeal[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
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
    () => today ? deals.filter((deal) => isTodayWithinCondition(deal.candidate.対象日条件, today))
      .sort((a, b) => parseRateValue(b.candidate.還元率) - parseRateValue(a.candidate.還元率)) : [],
    [today, deals]
  );

  // カテゴリごとに、検索キーワードに一致する店舗だけをグループ化する。
  const groupedStores = useMemo(() => {
    const query = searchQuery.trim();
    return categories
      .map((category) => ({
        category,
        stores: stores
          .filter((store) => store.category === category)
          .filter((store) => matchesStoreQuery(store.name, store.storeId, query)),
      }))
      .filter((group) => group.stores.length > 0);
  }, [searchQuery, stores, categories]);

  return (
    <main>
      {today && (
        <section className="today-deals">
          <p className="today-deals-label">今日お得なお店</p>

          {todaysDeals.length === 0 ? (
            <p className="today-deals-empty">
              掲載データに今日の特典はありません
            </p>
          ) : (
            <div className="today-deals-list">
              {todaysDeals.map((deal) => {
                const chip = getBrandChip(deal.candidate.カード);
                const dateLabel = formatJstDateLabel(today);
                const storeId = deal.storeId;
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
                        {deal.candidate.還元率}
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

      <header className="site-header">
        <h1 className="site-header-name">お支払いナビ</h1>
        <p className="site-header-tagline">
          いつもの買い物、一番お得な払い方がすぐわかる
        </p>
      </header>

      <MyCardsButton onClick={openModal} count={myCardIds?.size ?? 0} />

      <section className="store-search" aria-labelledby="store-search-heading">
        <h2 id="store-search-heading" className="section-heading">店舗名から支払い方法を探す</h2>
        <label htmlFor="store-search-input" className="search-label">店舗名・略称で検索</label>
        <div className="store-search-controls">
          <input ref={searchRef} id="store-search-input" type="search" inputMode="search"
            className="store-search-input" placeholder="例：セブン、まっく、ＫＦＣ"
            aria-describedby="store-search-help" value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape" && !event.nativeEvent.isComposing) setSearchQuery(""); }} />
          {searchQuery && <button type="button" className="search-clear" onClick={() => {
            setSearchQuery(""); searchRef.current?.focus();
          }}>検索をクリア</button>}
        </div>
        <p id="store-search-help" className="search-help">ひらがな・カタカナ・全角・半角に対応。一部の略称でも探せます。</p>
        <p className="search-count" role="status">{groupedStores.reduce((sum, group) => sum + group.stores.length, 0)}店舗</p>
      </section>

      {groupedStores.length === 0 && (
        <p className="store-search-empty">
          「{searchQuery}」に一致する店舗が見つかりません
        </p>
      )}

      {groupedStores.map((group) => (
        <div className="store-category" key={group.category}>
          <h3 className="store-category-label">
            <span
              className="category-dot"
              style={{ backgroundColor: getCategoryColor(group.category) }}
            />
            {group.category}
          </h3>
          <div className="store-selector">
            {group.stores.map((store) => {
              const storeId = store.storeId;
              if (!storeId) return null;
              return (
                <Link
                  key={storeId}
                  href={`/store/${storeId}/`}
                  className="store-button"
                >
                  <span className="store-button-name">{store.name}</span>
                  <span className="store-points">
                    {store.points.map((token) => {
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
                          role="img" aria-label={token}
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

      <section className="guide-home">
        <h2 className="section-heading">お得ガイド</h2>
        <GuideList />
      </section>

      <section className="feedback-section">
        <h2 className="section-heading">ご意見・ご要望はこちら</h2>
        <p className="feedback-lead">
          追加してほしい店舗・カードや、サイトの改善点があればお気軽にどうぞ
        </p>
        <div className="feedback-frame-wrap">
          <iframe
            src="https://forms.gle/xrAa6keaBCLRghSF7"
            className="feedback-frame"
            title="ご意見・ご要望フォーム"
            loading="lazy"
          >
            読み込み中...
          </iframe>
        </div>
        <p className="feedback-fallback">
          フォームが表示されない場合は
          <a
            href="https://forms.gle/xrAa6keaBCLRghSF7"
            target="_blank"
            rel="noopener noreferrer"
          >
            こちら
          </a>
          から直接ご入力ください。
        </p>
      </section>

      <p className="footer-note">
        情報は2026年10月時点のものです。最新の条件は
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
