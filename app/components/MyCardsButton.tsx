"use client";

export default function MyCardsButton({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  return (
    <button type="button" className="my-cards-button" onClick={onClick}>
      ＋ 支払い方法を追加{count > 0 ? `（${count}件登録済み）` : ""}
    </button>
  );
}
