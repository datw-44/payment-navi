"use client";

import { myCardCategoryOrder, myCardRegistry } from "../myCards";

export default function MyCardsModal({
  myCardIds,
  onToggle,
  onClose,
}: {
  myCardIds: Set<string> | null;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const count = myCardIds?.size ?? 0;

  return (
    <div className="my-cards-modal-overlay" onClick={onClose}>
      <div className="my-cards-modal" onClick={(event) => event.stopPropagation()}>
        <div className="my-cards-modal-header">
          <p className="my-cards-modal-title">支払い方法を追加</p>
          <button
            type="button"
            className="my-cards-modal-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="my-cards-modal-body">
          {myCardCategoryOrder.map((category) => (
            <div className="my-cards-category" key={category}>
              <p className="my-cards-category-label">{category}</p>
              <div className="my-cards-list">
                {myCardRegistry
                  .filter((def) => def.category === category)
                  .map((def) => {
                    const checked = !!myCardIds?.has(def.id);
                    return (
                      <label className="my-cards-checkbox-row" key={def.id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(def.id)}
                        />
                        <span className="my-cards-checkbox-name">
                          {def.name}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="my-cards-modal-footer">
          <button
            type="button"
            className="my-cards-modal-done"
            onClick={onClose}
          >
            完了{count > 0 ? `（${count}件選択中）` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
