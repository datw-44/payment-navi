"use client";

export default function MyCardsButton({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  return (
    <button type="button" className="my-cards-button" aria-haspopup="dialog" onClick={onClick}>
      マイカードを登録・変更{count > 0 ? `（${count}件登録済み）` : ""}
    </button>
  );
}
