"use client";

import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
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
  const titleId = useId();
  const helpId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && previousFocus !== document.body) {
        previousFocus.focus();
      } else {
        // 登録によって空状態のボタンが消えた場合も、安定した操作箇所へ戻す。
        document.querySelector<HTMLButtonElement>(".my-cards-button")?.focus();
      }
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const items = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]'
    );
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  };

  return (
    <div className="my-cards-modal-overlay" onClick={onClose}>
      <div className="my-cards-modal" ref={dialogRef} role="dialog" aria-modal="true"
        aria-labelledby={titleId} aria-describedby={helpId}
        onKeyDown={handleKeyDown} onClick={(event) => event.stopPropagation()}>
        <div className="my-cards-modal-header">
          <h2 className="my-cards-modal-title" id={titleId}>マイカードの登録・変更</h2>
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
          <p className="modal-help" id={helpId}>選択内容はこのブラウザに保存されます。特典の達成条件は別途ご確認ください。</p>
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
