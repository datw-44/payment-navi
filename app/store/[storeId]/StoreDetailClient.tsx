"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { StorePayments } from "../../data";
import { candidateMatchesMyCards } from "../../myCards";
import {
  getBrandChip,
  getInitial,
  getPointStyle,
  getRankTier,
  getStoreIconColor,
  parseRateValue,
  shortChipLabel,
} from "../../utils";
import RateDisplay from "../../components/RateDisplay";
import MyCardsButton from "../../components/MyCardsButton";
import MyCardsModal from "../../components/MyCardsModal";
import AdUnit from "../../components/AdUnit";
import GuideList from "../../guide/GuideList";
import { GUIDE_ARTICLES } from "../../guide/articles";
import { getRelatedGuideIds } from "../../guide/related";
import { useMyCards } from "../../hooks/useMyCards";

const VISIBLE_RANK_COUNT = 5;

type ResultTab = "mine" | "all";

export default function StoreDetailClient({
  store,
  acceptance,
}: {
  store: StorePayments;
  acceptance?: ReactNode;
}) {
  const {
    myCardIds,
    hasMyCards,
    isModalOpen,
    openModal,
    closeModal,
    toggleMyCard,
  } = useMyCards();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<ResultTab | null>(null);
  const activeTab = selectedTab ?? (hasMyCards ? "mine" : "all");
  const isLoading = myCardIds === null;
  const [showAll, setShowAll] = useState(false);

  const toggleExpanded = (key: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const sortedCandidates = useMemo(
    () =>
      [...store.候補].sort(
        (a, b) => parseRateValue(b.還元率) - parseRateValue(a.還元率)
      ),
    [store]
  );

  const hasAffiliateLink = store.候補.some((c) => Boolean(c.発行リンク));

  const myCandidates = useMemo(() => {
    if (!myCardIds) return [];
    return sortedCandidates.filter((candidate) =>
      candidateMatchesMyCards(candidate.カード, myCardIds)
    );
  }, [sortedCandidates, myCardIds]);

  const sourceCandidates =
    isLoading ? [] : activeTab === "mine" ? myCandidates : sortedCandidates;
  const topCandidate = sourceCandidates[0];
  const topChip = topCandidate ? getBrandChip(topCandidate.カード) : null;

  const relatedGuideIds = getRelatedGuideIds(store);
  const relatedGuides = GUIDE_ARTICLES.filter((a) => relatedGuideIds.includes(a.id));

  const hiddenCount = Math.max(sourceCandidates.length - VISIBLE_RANK_COUNT, 0);
  const visibleCandidates =
    showAll || hiddenCount === 0
      ? sourceCandidates
      : sourceCandidates.slice(0, VISIBLE_RANK_COUNT);

  return (
    <main>
      <Link href="/" className="back-link">
        ← 店舗一覧に戻る
      </Link>

      {/* 1. 店舗名（アイコン付き、中央揃え） */}
      <div className="store-header">
        <span
          className="store-header-icon"
          style={{ backgroundColor: getStoreIconColor(store.店舗) }}
        >
          {getInitial(store.店舗)}
        </span>
        <p className="store-header-name">{store.店舗}</p>
      </div>

      {/* 1.5 PR表記（広告リンクがあるページのみ） */}
      {hasAffiliateLink && (
        <p className="pr-notice">
          本ページには広告（アフィリエイトリンク）が含まれます
        </p>
      )}

      <section className="comparison-controls" aria-label="比較する支払い方法">
        <MyCardsButton onClick={openModal} count={myCardIds?.size ?? 0} />
        <div className="result-tabs" aria-label="比較対象">
          <button type="button" className={`result-tab${activeTab === "all" ? " active" : ""}`}
            aria-pressed={activeTab === "all"} disabled={isLoading}
            onClick={() => { setSelectedTab("all"); setShowAll(false); }}>すべて</button>
          <button type="button" className={`result-tab${activeTab === "mine" ? " active" : ""}`}
            aria-pressed={activeTab === "mine"} disabled={isLoading}
            onClick={() => { setSelectedTab("mine"); setShowAll(false); }}>マイリスト</button>
        </div>
        <p className="comparison-note">条件付きの最大還元率で比較しています。特定日特典・割引を含み、条件の達成状況は判定していません。</p>
        {activeTab === "mine" && !isLoading && (
          <p className="comparison-note">登録した支払い方法で絞り込んでいます。特典の達成条件は別途ご確認ください。</p>
        )}
      </section>

      {isLoading ? (
        <p className="comparison-status" role="status">登録した支払い方法を読み込んでいます…</p>
      ) : topCandidate ? (
        <section className="conclusion">
          <h2 className="conclusion-heading">
            {activeTab === "mine" ? "登録した支払い方法でのおすすめ" : "すべての支払い方法からのおすすめ"}
          </h2>
          <div className="conclusion-main">
            <div
              className="conclusion-logo"
              style={{ backgroundColor: topChip?.bg }}
            >
              <span className="conclusion-logo-label">
                {topChip ? shortChipLabel(topChip.label) : ""}
              </span>
            </div>
            <div className="conclusion-body">
              <p className="conclusion-card-name">{topCandidate.カード}</p>
            </div>
          </div>
          <RateDisplay candidate={topCandidate} />
          <p className="conclusion-note">※{topCandidate.注意}</p>
        </section>
      ) : (
        <div className="my-list-empty" role="status">
          <p className="my-list-empty-text">
            {activeTab === "mine" && !hasMyCards
              ? "支払い方法を登録すると、登録内容に合う候補を比較できます"
              : "登録した支払い方法に一致する候補がありません"}
          </p>
          <button type="button" className="my-list-empty-button" onClick={openModal}>支払い方法を登録・変更する</button>
          <button type="button" className="my-list-empty-button"
            onClick={() => { setSelectedTab("all"); setShowAll(false); }}>すべての候補を見る</button>
        </div>
      )}

      {/* 2.2 使える支払い方法（サーバー側で作った表示を受け取る） */}
      {acceptance}

      {/* 3. 解説文 */}
      {store.解説 && (
        <section className="store-commentary">
          <h2 className="store-commentary-heading">
            {store.店舗}の支払い方法について（店舗全体の解説）
          </h2>
          <p className="store-commentary-text">{store.解説}</p>
        </section>
      )}

      {/* 解説文の下の広告（1ページ1箇所のみ） */}
      {store.解説 && <AdUnit />}

      <h2 className="section-heading">
        {activeTab === "mine" ? "登録した支払い方法のお得ランキング" : "支払い方法のお得ランキング"}
      </h2>
      <p className="comparison-note">条件付きの最大還元率で比較しています。</p>

      {/* 3. 支払い方法のランキング（デフォルトは上位5位まで） */}
      {sourceCandidates.length > 0 && (
        <div className="rank-grid">
          {visibleCandidates.map((candidate, index) => {
            const chip = getBrandChip(candidate.カード);
            const tier = getRankTier(index);
            const isFirst = index === 0;
            const cardKey = `${store.店舗}::${candidate.カード}`;
            const isExpanded = expandedCards.has(cardKey);

            return (
              <div
                className={`rank-card${isFirst ? " rank-first" : ""}`}
                key={candidate.カード}
              >
                <span className={`rank-badge ${tier.className}`}>
                  {tier.label}
                </span>

                <div className="rank-card-main">
                  {candidate.画像URL ? (
                    <img
                      src={candidate.画像URL}
                      alt={candidate.カード}
                      className="rank-card-logo rank-card-logo-photo"
                    />
                  ) : (
                    <div
                      className="rank-card-logo"
                      style={{ backgroundColor: chip.bg }}
                    >
                      <span className="rank-card-logo-label">
                        {shortChipLabel(chip.label)}
                      </span>
                    </div>
                  )}

                  <div className="rank-card-body">
                    <p className="rank-card-name">{candidate.カード}</p>

                    <RateDisplay candidate={candidate} />
                    <button type="button" className="rank-card-toggle"
                      onClick={() => toggleExpanded(cardKey)} aria-expanded={isExpanded}>
                      {isExpanded ? "閉じる" : "詳しい条件を見る"}
                    </button>

                    {isExpanded && (
                      <div className="rank-card-expanded">
                        <p className="rank-card-expanded-text">
                          ※{candidate.条件}
                        </p>
                      </div>
                    )}


                  </div>
                </div>

                <div className="rank-card-detail">
                  <p className="rank-card-note">※{candidate.注意}</p>

                  {candidate.発行リンク && (
                    <div className="rank-card-affiliate">
                      <a
                        href={candidate.発行リンク}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="rank-card-affiliate-button"
                      >
                        公式サイトで申し込む
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hiddenCount > 0 && (
        <button
          type="button"
          className="rank-more-button"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "閉じる" : `もっと見る（他${hiddenCount}件）`}
        </button>
      )}

      {/* 5. 「貯まる・使えるポイント」の帯（レジ提示で貯まる共通ポイントのみ） */}
      {store.共通ポイント.length > 0 && (
        <div className="point-band">
          <p className="point-band-label">貯まる・使えるポイント</p>
          <div className="point-band-list">
            {store.共通ポイント.map((token) => {
              const style = getPointStyle(token);
              return (
                <span className="point-chip" key={token}>
                  <span
                    className="point-chip-dot"
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                    }}
                  >
                    {style.label}
                  </span>
                  <span className="point-chip-name">{token}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {relatedGuides.length > 0 && (
        <section className="related-guides">
          <h2 className="section-heading">関連するお得ガイド</h2>
          <GuideList articles={relatedGuides} />
        </section>
      )}

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
