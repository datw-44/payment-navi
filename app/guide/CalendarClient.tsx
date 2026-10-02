"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatJstDateLabel, getJstDate, parseRateValue, type JstDate } from "../utils";
import { WEEKDAY_NAMES, type CalendarData, type CalendarEntry } from "./calendar";

function EntryRow({ entry, highlight }: { entry: CalendarEntry; highlight: boolean }) {
  return (
    <li className={`calendar-entry${highlight ? " calendar-entry-today" : ""}`}>
      <div className="calendar-entry-main">
        <Link href={`/store/${entry.storeId}/`} className="calendar-entry-store">
          {entry.store}
        </Link>
        <span className="calendar-entry-rate">{entry.rate}</span>
      </div>
      <p className="calendar-entry-sub">
        {entry.card}／{entry.summary}
      </p>
      <p className="calendar-entry-sub">※{entry.note}</p>
    </li>
  );
}

export default function CalendarClient({ data }: { data: CalendarData }) {
  // 日付はサーバーとクライアントでずれるとハイドレーションエラーになるため、
  // マウント後に日本時間の今日を確定させる。
  const [today, setToday] = useState<JstDate | null>(null);
  useEffect(() => {
    setToday(getJstDate());
  }, []);

  // 今日が特典日の店舗（同じ店舗は還元率が高い方だけ）
  const todaysEntries = useMemo(() => {
    if (!today) return [];
    const best = new Map<string, CalendarEntry>();
    const consider = (entries: CalendarEntry[]) =>
      entries.forEach((entry) => {
        const current = best.get(entry.store);
        if (!current || parseRateValue(current.rate) < parseRateValue(entry.rate)) {
          best.set(entry.store, entry);
        }
      });
    data.monthly.filter((g) => g.day === today.day).forEach((g) => consider(g.entries));
    data.weekly.filter((g) => g.weekday === today.weekday).forEach((g) => consider(g.entries));
    return [...best.values()].sort(
      (a, b) => parseRateValue(b.rate) - parseRateValue(a.rate)
    );
  }, [today, data]);

  return (
    <>
      {today && (
        <section className="calendar-today">
          <p className="calendar-today-label">
            今日（{formatJstDateLabel(today)}）の特典日
          </p>
          {todaysEntries.length === 0 ? (
            <p className="calendar-today-empty">
              今日は、特典日がある店舗はありません
            </p>
          ) : (
            <ul className="calendar-today-list">
              {todaysEntries.map((entry) => (
                <li key={entry.store}>
                  <Link href={`/store/${entry.storeId}/`}>
                    <strong>{entry.store}</strong>
                    <span className="calendar-today-rate">{entry.rate}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="guide-section">
        <h2 className="guide-h2">毎月の特典日（日付順）</h2>
        {data.monthly.map((group) => {
          const isToday = today?.day === group.day;
          return (
            <div
              className={`calendar-group${isToday ? " calendar-group-today" : ""}`}
              key={group.day}
            >
              <p className="calendar-group-label">
                毎月{group.day}日
                {isToday && <span className="calendar-today-badge">今日</span>}
              </p>
              <ul className="calendar-list">
                {group.entries.map((entry) => (
                  <EntryRow key={entry.store} entry={entry} highlight={isToday} />
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="guide-section">
        <h2 className="guide-h2">毎週の特典日（曜日順）</h2>
        {data.weekly.map((group) => {
          const isToday = today?.weekday === group.weekday;
          return (
            <div
              className={`calendar-group${isToday ? " calendar-group-today" : ""}`}
              key={group.weekday}
            >
              <p className="calendar-group-label">
                毎週{WEEKDAY_NAMES[group.weekday]}曜日
                {isToday && <span className="calendar-today-badge">今日</span>}
              </p>
              <ul className="calendar-list">
                {group.entries.map((entry) => (
                  <EntryRow key={entry.store} entry={entry} highlight={isToday} />
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </>
  );
}
