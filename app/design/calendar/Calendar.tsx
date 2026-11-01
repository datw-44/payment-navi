"use client";
import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import Link from "next/link";
import { PreviewHeader, PreviewFooter } from "../../design/Chrome";
import { useMyCards } from "../../hooks/useMyCards";
import MyCardsModal from "../../components/MyCardsModal";
import chrome from "../../design/preview.module.css";
import styles from "./calendar.module.css";
import { dateAt, daysInMonth, iso, moveMonth, offersOn, ruleDates, weekdays, type Offer } from "./model";
import type { JstDate } from "../../utils";
import { useToday } from "./useToday";
const confirmationNote = "特典の個別確認日：記録なし";

export function OfferList({offers}: {offers:Offer[]}) {
 return <ul className={styles.offers}>{offers.map(o=><li key={`${o.storeId}:${o.card}`} data-offer={o.card}>
   <div className={styles.offerHeading}><Link href={`/store/${o.storeId}/#compare`}>{o.store}<span aria-hidden="true"> ↗</span></Link><div className={styles.rate}><span>条件適用時</span><strong>{o.rate}</strong></div></div>
   <h3>{o.card}</h3><p className={styles.operation}>{o.summary}</p>
   <ul className={styles.essentials}>{o.essentials.map(line=><li key={line}>{line}</li>)}</ul>
   <p className={styles.verification}>{confirmationNote}</p>
   <details><summary>条件全文・注意事項</summary><dl><dt>適用条件</dt><dd>{o.condition}</dd><dt>注意事項</dt><dd>{o.note}</dd><dt>ポイント・特典</dt><dd>{o.points}</dd></dl><Link href={`/store/${o.storeId}/#compare`}>店舗ページでほかの支払い方も比較 →</Link></details>
 </li>)}</ul>;
}
export default function Calendar({offers, relatedGuides}:{offers:Offer[]; relatedGuides?: ReactNode}) {
 const today=useToday(),cards=useMyCards();
 const [selected,setSelected]=useState<JstDate|null>(null);
 const detailRef=useRef<HTMLHeadingElement>(null),buttons=useRef(new Map<string,HTMLButtonElement>());
 useEffect(()=>{if(today)setSelected(prev=>prev??today);},[today]);
 const chosen=selected?offersOn(offers,selected):[];
 const count=selected?daysInMonth(selected.year,selected.month):0;
 const first=selected?dateAt(selected.year,selected.month,1).weekday:0;
 const cells=Array.from({length:Math.ceil((first+count)/7)*7},(_,i)=>i-first+1);
 const unknown=offers.filter(o=>!ruleDates(o.dateCondition));
 function pick(d:JstDate, focus=false){setSelected(d);if(focus)requestAnimationFrame(()=>buttons.current.get(iso(d))?.focus());}
 function handleKey(event:KeyboardEvent<HTMLButtonElement>,d:JstDate){
  let next:JstDate|undefined;
  if(event.key==="ArrowLeft")next=dateAt(d.year,d.month,d.day-1);
  if(event.key==="ArrowRight")next=dateAt(d.year,d.month,d.day+1);
  if(event.key==="ArrowUp")next=dateAt(d.year,d.month,d.day-7);
  if(event.key==="ArrowDown")next=dateAt(d.year,d.month,d.day+7);
  if(event.key==="Home")next=dateAt(d.year,d.month,d.day-d.weekday);
  if(event.key==="End")next=dateAt(d.year,d.month,d.day+6-d.weekday);
  if(event.key==="PageUp")next=moveMonth(d,-1);
  if(event.key==="PageDown")next=moveMonth(d,1);
  if(next){event.preventDefault();pick(next,true);}
 }
 return <div className={`${chrome.shell} ${styles.scope}`}>
 <PreviewHeader count={cards.myCardIds?.size??0} onOpen={cards.openModal}/>
 <main className={styles.main}><nav className={styles.breadcrumb} aria-label="パンくずリスト"><Link href="/">お店を探す</Link><span>/</span><span aria-current="page">お得な日カレンダー</span></nav>
 <header className={styles.intro}><div><p className={styles.kicker}>買い物の日を、ちょっと上手に。</p><h1>お得な日カレンダー<span className={styles.headingMark} aria-hidden="true">↗</span></h1><p>日付を選ぶと、その日の特典と必要な条件がわかります。</p></div><Link href="/#today-offers-heading">今日のおトクから探す →</Link></header>
 <p className={styles.statusNotice}>掲載中の特典は公式情報の再確認が完了していません。個別の確認日が記録されていないため、ご利用前に各社の開催状況・条件をお確かめください。</p>
 {!selected||!today?<p role="status" className={styles.loading}>日本時間の日付を確認しています…</p>:<div className={styles.layout}>
 <section className={styles.calendar} aria-labelledby="month-title"><div className={styles.monthHeader}><h2 id="month-title" aria-live="polite"><span>{selected.year}年</span>{selected.month}<small>月</small></h2><div className={styles.monthControls}><button type="button" aria-label="前の月" onClick={()=>pick(moveMonth(selected,-1))}>‹</button><button type="button" onClick={()=>pick(today)}>今日</button><button type="button" aria-label="次の月" onClick={()=>pick(moveMonth(selected,1))}>›</button></div></div>
 <table className={styles.grid}><caption className={styles.srOnly}>日付を選択。矢印キーで日付、PageUp・PageDownで月を移動できます。</caption><thead><tr>{weekdays.map((day,i)=><th key={day} scope="col" className={i===0?styles.sunday:undefined}>{day}</th>)}</tr></thead><tbody>{Array.from({length:cells.length/7},(_,week)=><tr key={week}>{cells.slice(week*7,week*7+7).map((day,i)=>{
  if(day<1||day>count)return <td key={i} className={styles.blank}/>;
  const d=dateAt(selected.year,selected.month,day),key=iso(d),n=offersOn(offers,d).length,isToday=key===iso(today),isSelected=key===iso(selected);
  return <td key={i}><button type="button" ref={el=>{if(el)buttons.current.set(key,el);else buttons.current.delete(key);}} className={`${styles.day} ${isToday?styles.today:""}`} aria-label={`${d.year}年${d.month}月${day}日（${weekdays[d.weekday]}）${isToday?"、今日":""}、特典${n}件`} aria-pressed={isSelected} aria-current={isToday?"date":undefined} tabIndex={isSelected?0:-1} onKeyDown={e=>handleKey(e,d)} onClick={()=>{pick(d);if(window.innerWidth<900)requestAnimationFrame(()=>{detailRef.current?.focus({preventScroll:true});detailRef.current?.closest("section")?.scrollIntoView({block:"start",behavior:"instant"});});}}><span className={styles.dayNumber}>{day}</span><span className={styles.dayMeta}>{n>0&&<><i aria-hidden="true"/><span>{n}件</span></>}{isToday&&<small>今日</small>}</span></button></td>;
 })}</tr>)}</tbody></table>
 <p className={styles.legend}><i aria-hidden="true"/> 特典がある日<span>日時は日本時間</span></p><p className={styles.calendarNote}>将来の日付は、登録済みの毎月・毎週の定例ルールから算出した予定です。開催を保証するものではありません。</p>
 <details className={styles.rules}><summary>毎月・毎週の掲載ルールを見る</summary><ul>{offers.map(o=><li key={o.storeId+o.card}><strong>{o.dateCondition}</strong><Link href={`/store/${o.storeId}/#compare`}>{o.store} — {o.card}</Link></li>)}</ul></details>
 </section>
 <section className={styles.selection} aria-labelledby="selected-title"><header className={styles.selectedHeader}><div><p>{iso(selected)===iso(today)?"今日のおトク":iso(selected)>iso(today)?"選んだ日の予定":"選んだ日のおトク"}</p><h2 id="selected-title" ref={detailRef} tabIndex={-1}>{selected.month}<small>月</small>{selected.day}<small>日（{weekdays[selected.weekday]}）</small></h2></div><span role="status">{chosen.length}件の特典</span></header>
 <p className={styles.disclaimer}>対象日でも自動適用ではありません。カード・時間帯などの条件をご確認ください。</p><button type="button" className={styles.pickAgain} onClick={()=>{const button=buttons.current.get(iso(selected));button?.focus({preventScroll:true});button?.closest("section")?.scrollIntoView({block:"start",behavior:"instant"});}}>日付を選び直す ↑</button>
 {chosen.length?<OfferList offers={chosen}/>:<div className={styles.empty}><span aria-hidden="true">—</span><h3>この日の特典掲載はありません</h3><p>目印のある日を選んでみてください。通常の支払い方は店舗ページで比較できます。</p><Link href="/#stores">お店を探す →</Link></div>}
 </section></div>}
 {!!unknown.length&&<p>日付に展開できない掲載情報が{unknown.length}件あります。店舗ページをご確認ください。</p>}
 <p className={styles.bottomNote}>特典ごとの確認日は既存データに記録されていません。店舗ページの確認時点には別の決済の確認も含まれるため、この特典の確認日としては扱っていません。最新の開催状況・条件は各社の公式案内をご確認ください。</p>
 {relatedGuides}
 </main><PreviewFooter/>{cards.isModalOpen&&<MyCardsModal myCardIds={cards.myCardIds} onToggle={cards.toggleMyCard} onClose={cards.closeModal}/>}</div>;
}
