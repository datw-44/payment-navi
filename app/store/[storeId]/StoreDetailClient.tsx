"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { StorePayments } from "../../data";
import { candidateMatchesMyCards } from "../../myCards";
import {
  formatRateHeadline,
  getBrandChip,
  getInitial,
  getPointStyle,
  getRankTier,
  getStoreIconColor,
  isSimpleRate,
  parseRateValue,
  shortChipLabel,
} from "../../utils";
import MyCardsButton from "../../components/MyCardsButton";
import MyCardsModal from "../../components/MyCardsModal";
import { useMyCards } from "../../hooks/useMyCards";

const VISIBLE_RANK_COUNT = 5;

type ResultTab = "mine" | "all";

export default function StoreDetailClient({ store }: { store: StorePayments }) {
  const {
    myCardIds,
    hasMyCards,
    isModalOpen,
    openModal,
    closeModal,
    toggleMyCard,
  } = useMyCards();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ResultTab>("all");
  const [showAll, setShowAll] = useState(false);

  // 登録済みカードがあれば「マイリスト」、なければ「すべて」をデフォルトタブにする。
  useEffect(() => {
    if (myCardIds === null) return;
    setActiveTab(myCardIds.size > 0 ? "mine" : "all");
  }, [myCardIds]);

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

  const myCandidates = useMemo(() => {
    if (!myCardIds) return [];
    return sortedCandidates.filter((candidate) =>
      candidateMatchesMyCards(candidate.カード, myCardIds)
    );
  }, [sortedCandidates, myCardIds]);

  const sourceCandidates =
    activeTab === "mine" && hasMyCards ? myCandidates : sortedCandidates;

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

      {/* 2. 「貯まる・使えるポイント」の帯（レジ提示で貯まる共通ポイントのみ） */}
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

      {/* 2.2 使えない決済手段（コストコ等、対応が限定的な店舗のみ表示） */}
      {store.非対応決済 && store.非対応決済.length > 0 && (
        <div className="unsupported-band">
          <p className="unsupported-band-label">
            ✕ この店舗で使えない決済手段
          </p>
          <ul className="unsupported-band-list">
            {store.非対応決済.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <MyCardsButton onClick={openModal} count={myCardIds?.size ?? 0} />

      {/* 2.5 マイリスト／すべて タブ */}
      <div className="result-tabs">
        <button
          type="button"
          className={`result-tab${activeTab === "mine" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("mine");
            setShowAll(false);
          }}
        >
          マイリスト
        </button>
        <button
          type="button"
          className={`result-tab${activeTab === "all" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("all");
            setShowAll(false);
          }}
        >
          すべて
        </button>
      </div>

      {activeTab === "mine" && !hasMyCards && (
        <div className="my-list-empty">
          <p className="my-list-empty-text">
            支払い方法を登録すると、あなたが使えるカードだけで比較できます
          </p>
          <button
            type="button"
            className="my-list-empty-button"
            onClick={openModal}
          >
            支払い方法を登録する
          </button>
        </div>
      )}

      {activeTab === "mine" && hasMyCards && sourceCandidates.length === 0 && (
        <div className="my-list-empty">
          <p className="my-list-empty-text">
            登録した支払い方法では、このお店で使える候補がありません
          </p>
          <button
            type="button"
            className="my-list-empty-button"
            onClick={() => setActiveTab("all")}
          >
            すべての候補を見る
          </button>
        </div>
      )}

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

                    <div className="rank-card-condition-row">
                      <p className="rank-card-condition">
                        ※{candidate.条件要約}
                      </p>
                      <button
                        type="button"
                        className="rank-card-toggle"
                        onClick={() => toggleExpanded(cardKey)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "閉じる" : "詳しい条件を見る"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="rank-card-expanded">
                        <p className="rank-card-expanded-text">
                          ※{candidate.条件}
                        </p>
                        {!isSimpleRate(candidate.還元率) && (
                          <p className="rank-card-expanded-text">
                            還元率の詳細: {candidate.還元率}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="rank-card-rate">
                      {formatRateHeadline(candidate.還元率)}
                    </p>
                  </div>
                </div>

                <div className="rank-card-detail">
                  <p className="rank-card-note">※{candidate.注意}</p>

                  {candidate.発行リンク && (
                    <div className="rank-card-affiliate">
                      <span className="rank-card-pr-badge">PR</span>
                      <a
                        href={candidate.発行リンク}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="rank-card-affiliate-button"
                      >
                        このカードを発行する
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
