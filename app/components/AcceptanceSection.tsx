import {
  ACCEPTANCE_CHECKED_AT,
  ACCEPTANCE_ITEMS,
  acceptance,
} from "../acceptance";

const GROUP_LABELS = ["クレジットカード", "QRコード決済", "電子マネー"] as const;

// 店舗ページの「◯◯で使える支払い方法」。使えるものは緑のチェック、使えないものはグレーのバツ。
// データがあるものだけ表示し、確認できていない項目は出さない。
// （サーバーコンポーネント。データ量が多いので、クライアント側のJSには含めない）
export default function AcceptanceSection({ storeName }: { storeName: string }) {
  const data = acceptance[storeName];
  if (!data) return null;

  const groups = GROUP_LABELS.map((label) => {
    const group = data[label];
    const items = ACCEPTANCE_ITEMS[label].flatMap((name) => {
      if ((group?.使える as readonly string[] | undefined)?.includes(name))
        return [{ name, ok: true }];
      if ((group?.使えない as readonly string[] | undefined)?.includes(name))
        return [{ name, ok: false }];
      return [];
    });
    return { label, items };
  }).filter((group) => group.items.length > 0);

  const notes = [
    ...(data.その他?.使える ?? []).map((text) => ({ text, ok: true })),
    ...(data.その他?.使えない ?? []).map((text) => ({ text, ok: false })),
  ];

  if (groups.length === 0 && notes.length === 0) return null;

  return (
    <section className="acceptance" aria-labelledby="acceptance-heading">
      <h2 className="acceptance-heading" id="acceptance-heading">
        {storeName}で使える支払い方法
      </h2>
      <p className="acceptance-legend">
        <span className="acceptance-icon acceptance-icon-ok" aria-hidden="true">
          ✓
        </span>
        使える
        <span className="acceptance-icon acceptance-icon-ng" aria-hidden="true">
          ✕
        </span>
        使えない
      </p>

      {groups.map((group) => (
        <div className="acceptance-group" key={group.label}>
          <p className="acceptance-group-label">{group.label}</p>
          <ul className="acceptance-chips">
            {group.items.map((item) => (
              <li
                key={item.name}
                className={`acceptance-chip ${
                  item.ok ? "acceptance-chip-ok" : "acceptance-chip-ng"
                }`}
                aria-label={`${item.name}：${item.ok ? "使えます" : "使えません"}`}
              >
                <span
                  className={`acceptance-icon ${
                    item.ok ? "acceptance-icon-ok" : "acceptance-icon-ng"
                  }`}
                  aria-hidden="true"
                >
                  {item.ok ? "✓" : "✕"}
                </span>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {notes.length > 0 && (
        <div className="acceptance-group">
          <p className="acceptance-group-label">その他・注意</p>
          <ul className="acceptance-notes">
            {notes.map((note) => (
              <li
                key={note.text}
                className="acceptance-note"
                aria-label={`${note.text}：${note.ok ? "使えます" : "使えません"}`}
              >
                <span
                  className={`acceptance-icon ${
                    note.ok ? "acceptance-icon-ok" : "acceptance-icon-ng"
                  }`}
                  aria-hidden="true"
                >
                  {note.ok ? "✓" : "✕"}
                </span>
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="acceptance-foot">
        {ACCEPTANCE_CHECKED_AT}時点の情報です。店舗によって異なる場合があります。
      </p>
    </section>
  );
}
