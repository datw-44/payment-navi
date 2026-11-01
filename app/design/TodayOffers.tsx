import Link from "next/link";
import type { JstDate } from "../utils";
import styles from "./todayOffers.module.css";

export type TodayDeal = {
  store: string;
  storeId: string;
  card: string;
  rate: string;
  dateCondition: string;
  summary: string;
  note: string;
};

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M7 2v6M17 2v6M3 11h18M7 15h3M14 15h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}

function BenefitValue({ rate }: { rate: string }) {
  const simple = rate.match(/^(最大|約)?(\d+(?:\.\d+)?)%(割引)?$/);
  return <strong className={simple ? styles.simpleRate : styles.complexRate}>{simple ? <>{simple[1] && <span className={styles.qualifier}>{simple[1]}</span>}{simple[2]}<span className={styles.rateUnit}>%{simple[3]}</span></> : rate}</strong>;
}

function Offer({ deal }: { deal: TodayDeal }) {
  return <li className={styles.offer}>
    <Link href={`/store/${deal.storeId}/`} className={styles.offerLink}>
      <div className={styles.store}><h3>{deal.store}<span className={styles.mobileArrow} aria-hidden="true"> ↗</span></h3><p>{deal.card}</p></div>
      <div className={styles.benefit}><span>条件適用時の特典</span><BenefitValue rate={deal.rate}/></div>
      <div className={styles.conditions}><p className={styles.summary}>{deal.summary}</p><p className={styles.schedule}>{deal.dateCondition}<span className={styles.note}>{deal.note}</span></p></div>
      <span className={styles.detailsLink}>条件を確認 <span aria-hidden="true">→</span></span>
    </Link>
  </li>;
}

// 対象日・還元率順の判定は既存のHomePreviewで行い、このコンポーネントは表示のみを担当する。
export default function TodayOffers({ today, deals }: { today: JstDate | null; deals: TodayDeal[] }) {
  const isoDate = today ? `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}` : undefined;
  return <section className={styles.section} aria-labelledby="today-offers-heading" aria-busy={today === null}>
    <header className={styles.heading}>
      <div className={styles.title}><CalendarIcon/><h2 id="today-offers-heading">今日のおトク</h2>{today && deals.length > 0 && <span className={styles.count}>{deals.length}件</span>}</div>
      {today ? <time className={styles.date} dateTime={isoDate}>{today.month}<span>月</span>{today.day}<span>日（{["日", "月", "火", "水", "木", "金", "土"][today.weekday]}）</span><small>日本時間</small></time> : <span className={styles.loadingDate}>日付を確認中</span>}
    </header>
    {today === null ? <p className={styles.empty} role="status">今日の特典を確認しています…</p> : deals.length ? <>
      <ul className={styles.offers}>{deals.slice(0, 2).map((deal) => <Offer key={`${deal.store}::${deal.card}`} deal={deal}/>)}</ul>
      {deals.length > 2 && <details className={styles.more}><summary>ほか{deals.length - 2}件の特典を見る</summary><ul className={styles.offers}>{deals.slice(2).map((deal) => <Offer key={`${deal.store}::${deal.card}`} deal={deal}/>)}</ul></details>}
    </> : <div className={styles.empty}><p>今日は、掲載中の特典日の対象がありません。</p><span>別の日のおトクは、特典カレンダーから探せます。</span></div>}
    <footer className={styles.footer}>
      <p>対象日でも自動適用ではありません。カード・時間帯など、店舗ごとの適用条件をご確認ください。</p>
      <Link href="/guide/calendar/" className={styles.calendarLink}><CalendarIcon/>特典カレンダーを見る <span aria-hidden="true">→</span></Link>
    </footer>
  </section>;
}
