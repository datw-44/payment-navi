"use client";

import { useEffect, useState } from "react";
import { loadMyCardIds, saveMyCardIds } from "../myCards";

// 「マイカード」の登録状態（localStorage永続化）と登録モーダルの
// 開閉状態をまとめて扱うフック。トップページ・店舗ページの両方で使う。
export function useMyCards() {
  const [myCardIds, setMyCardIds] = useState<Set<string> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // localStorageはクライアントでしか読めないため、マウント後に読み込む
  // （サーバー側の描画結果とズレるハイドレーションエラーを避けるため）。
  useEffect(() => {
    setMyCardIds(loadMyCardIds());
  }, []);

  const toggleMyCard = (id: string) => {
    setMyCardIds((prev) => {
      const base = prev ?? new Set<string>();
      const next = new Set(base);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveMyCardIds(next);
      return next;
    });
  };

  return {
    myCardIds,
    hasMyCards: !!myCardIds && myCardIds.size > 0,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    toggleMyCard,
  };
}
