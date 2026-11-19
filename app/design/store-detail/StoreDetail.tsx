'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { PaymentCandidate, StorePayments } from '../../data';
import { useMyCards } from '../../hooks/useMyCards';
import { candidateMatchesMyCards } from '../../myCards';
import MyCardsModal from '../../components/MyCardsModal';
import { groupCandidates, rateParts, type RateGroup } from './model';
import { isAeonDay, shortBenefitName, facts, operation } from './presentation';
import { useToday } from '../calendar/useToday';
import AdUnit from '../../components/AdUnit';
import s from './detail.module.css';
import { getVerification, isVerifiedForDay, verificationMessage, verificationLabel, sourceName, japaneseDate, type VerificationRecord } from './verification';

function Crown() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m3 6 4 3 3-6 3 6 4-3-2 10H5L3 6ZM5 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
function Calendar() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M7 3v4m10-4v4M3 10h18m-14 5h3m4 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function Chevron() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Action({ label = false }: { label?: boolean }) {
  return <span className={s.action}><span className={label ? s.actionLabel : s.srOnly}>条件・詳細を見る</span><Chevron /></span>;
}
function Name({ value }: { value: string }) {
  return <>{value.split('＋').map((part, i) => i ? <span className={s.namePart} key={i}>＋{part}</span> : part)}</>;
}
function Rate({ candidate: c }: { candidate: PaymentCandidate }) {
  const m = rateParts(c);
  return <span className={s.rate} data-rate={c.還元率} aria-label={c.還元率}>
    {m ? <>{m[1] && <span className={s.prefix}>{m[1]}</span>}<strong>{m[2]}</strong><span className={s.percent}>%{m[3] && <span>割引</span>}</span></> : <strong className={s.nonNumeric}>{c.還元率}</strong>}
  </span>;
}
function Verification({ record }: { record: VerificationRecord }) {
  return <section className={s.verification} aria-label="特典の確認状況" data-verification={record.status}>
    <h4>特典の確認状況：{verificationLabel(record.status)}</h4>
    <p>公式条件の確認日：{record.verifiedAt ? japaneseDate(record.verifiedAt) : '記録なし'}</p>
    <p>確認を試みた日：{japaneseDate(record.attemptedAt)}<br />{record.status === 'verified' ? '対象決済・店舗・商品などの条件をご確認ください。' : record.status === 'partial' ? '対象条件の一部は確認できていません。' : record.status === 'possible-change' ? '記載の条件と公式案内に相違がある可能性があります。' : '対象日・支払い方法・対象外の商品や店舗について、最新の条件は未確認です。'}記載の日程だけで、開催や適用が確定するものではありません。</p>
    <p>公式案内で実施状況・対象条件をご確認ください。</p>
    <ul>{record.urls.map((url, i) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{sourceName(url)}{record.urls.filter(u => sourceName(u) === sourceName(url)).length > 1 ? `（${i + 1}）` : ''} ↗</a></li>)}</ul>
  </section>;
}
function FullConditions({ candidate: c, verification }: { candidate: PaymentCandidate; verification?: VerificationRecord }) {
  return <div className={s.full}><dl><dt>支払い方法</dt><dd>{c.カード}</dd><dt>還元率・特典</dt><dd>{c.還元率}</dd><dt>支払い操作</dt><dd>{c.条件要約}</dd><dt>適用条件</dt><dd>{c.条件}</dd><dt>注意事項・対象外</dt><dd>{c.注意}</dd><dt>ポイント・特典の種類</dt><dd>{c.ポイント種類}</dd></dl>{c.発行リンク && <a href={c.発行リンク} target="_blank" rel="noopener noreferrer sponsored">申し込み先（広告） ↗</a>}{verification && <Verification record={verification} />}</div>;
}
function Notes({ candidate: c, includeOperation = true }: { candidate: PaymentCandidate; includeOperation?: boolean }) {
  const lines = facts(c), extra = rateParts(c)?.[4];
  return <div className={s.notes}>{includeOperation && <p>{operation(c)}</p>}{extra && <p className={s.rateNote}>{extra}</p>}{lines.length > 0 && <ul>{lines.map((line, i) => <li key={i}>{line}</li>)}</ul>}</div>;
}
function CandidateRow({ candidate: c, sharedRate = false }: { candidate: PaymentCandidate; sharedRate?: boolean }) {
  return <article className={`${s.row} ${sharedRate ? s.sharedRow : ''}`} data-candidate={c.カード}>
    <details><summary className={s.rowSummary}>
      <div className={s.rowIdentity}><h3><Name value={c.カード} /></h3></div>
      {!sharedRate && <div className={s.rowValue}><Rate candidate={c} /><small>適用条件あり</small></div>}
      <div className={s.rowNotes}><Notes candidate={c} /></div><Action />
    </summary><FullConditions candidate={c} /></details>
  </article>;
}
function NormalGroup({ group, prominent = false, compact = false }: { group: RateGroup; prominent?: boolean; compact?: boolean }) {
  const tied = group.candidates.length > 1;
  return <section className={prominent ? `${s.hero} ${compact ? s.compactHero : ''}` : s.rateGroup} data-rate-group={group.rate} data-zone={prominent ? 'normal' : undefined}>
    {prominent && <header className={s.heroLabel}><Crown /><h2>通常還元の有力候補</h2></header>}
    {prominent && !tied ? <article className={s.leader} data-candidate={group.candidates[0].カード}>
      <details><summary><h3><Name value={group.candidates[0].カード} /></h3><div className={s.heroValue}><Rate candidate={group.candidates[0]} /><span>ポイント還元</span></div><div className={s.leaderFoot}><Notes candidate={group.candidates[0]} /><Action label /></div></summary><FullConditions candidate={group.candidates[0]} /></details>
    </article> : <>
      <header className={s.groupHeading}><h3>{tied ? '同率' : ''}{group.rank}位<span>通常還元の比較内・{group.candidates.length}件</span></h3><div><Rate candidate={group.candidates[0]} /><small>ポイント還元</small></div></header>
      {group.candidates.map(c => <CandidateRow key={c.カード} candidate={c} sharedRate />)}
    </>}
  </section>;
}
function Benefit({ candidate: c, featured, verification, sharedNotice = false }: { candidate: PaymentCandidate; featured: boolean; verification?: VerificationRecord; sharedNotice?: boolean }) {
  return <article className={`${s.benefit} ${featured ? s.featured : ''}`} data-benefit data-candidate={c.カード}>
    <details><summary>
      <p className={s.benefitLabel}><Calendar />{featured ? '本日の注目特典 · ' : ''}{c.対象日条件 || '対象日は条件をご確認ください'}</p>
      <div className={s.benefitIdentity}><h3><Name value={shortBenefitName(c)} /></h3><div className={s.benefitValue}><Rate candidate={c} />{!c.還元率.includes('割引') && <small>還元・条件あり</small>}</div></div>
      {isAeonDay(c) ? <div className={s.eligibility}><p>イオンマークの付いたカード払い<br />WAON払い・AEON Pay</p><p>{c.注意}</p></div> : <Notes candidate={c} includeOperation={facts(c).length === 0} />}
      {!sharedNotice && <p className={s.verificationNotice}>{verificationMessage(verification?.status)}</p>}
      <div className={s.benefitFoot}><span>{featured ? '対象の購入・支払いに限ります' : ''}</span><Action /></div>
    </summary><FullConditions candidate={c} verification={verification} />
    </details>
    {verification?.urls[0] && <a className={s.officialSource} href={verification.urls[0]} target="_blank" rel="noopener noreferrer" aria-label={`${c.カード}：公式の対象条件を確認（新しいタブ）`}>公式の対象条件を確認 ↗</a>}
  </article>;
}
function OtherRows({ items }: { items: PaymentCandidate[] }) {
  const [all, setAll] = useState(false);
  return <><div className={s.rows}>{(all ? items : items.slice(0,3)).map(c => <CandidateRow key={c.カード} candidate={c} />)}</div>{items.length > 3 && <button className={s.more} aria-expanded={all} onClick={() => setAll(!all)}>{all ? '少なく表示する' : `残り${items.length-3}件も見る`}<Chevron /></button>}</>;
}
export default function StoreDetail({ storeId, store, acceptance, hasAcceptance, relatedGuides }: {
  storeId: string; store: StorePayments; acceptance: ReactNode; hasAcceptance: boolean; relatedGuides: ReactNode;
}) {
  const cards = useMyCards(), today = useToday();
  const [mine, setMine] = useState(false), [paymentsOpen, setPaymentsOpen] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const hash = window.location.hash;
      if (['', '#compare', '#my-cards', '#payments'].includes(hash)) setMine(hash === '#my-cards');
      if (hash === '#payments') setPaymentsOpen(true);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const id = hash.slice(1), target = id && document.getElementById(id);
        if (target) { target.scrollIntoView({ block: 'start' }); target.focus({ preventScroll: true }); }
      });
    };
    update(); window.addEventListener('hashchange', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', update); };
  }, []);
  const candidates = mine ? store.候補.filter(c => cards.myCardIds && candidateMatchesMyCards(c.カード, cards.myCardIds)) : store.候補;
  const grouped = groupCandidates(candidates, store.店舗);
  const featured = grouped.days.filter(c => isVerifiedForDay(storeId, c, getVerification(storeId, c.カード), today));
  const otherDays = grouped.days.filter(c => !featured.includes(c));
  const jump = grouped.conditional.length > 0 && <a className={s.conditionalJump} href="#conditional">条件付き・要確認の支払い方法<span>{grouped.conditional.length}件 →</span></a>;
  const normal = <div className={s.normalBlock}>{grouped.groups[0] && <NormalGroup group={grouped.groups[0]} prominent compact={featured.length > 0} />}{jump}</div>;
  const benefits = (items: PaymentCandidate[], prominent: boolean) => {
    const statuses = items.map(c => getVerification(storeId,c.カード)?.status ?? 'unverified');
    const sharedNotice = items.length > 1 && new Set(statuses).size === 1;
    return items.length > 0 && <section className={`${s.benefits} ${items.length > 1 ? s.multipleBenefits : ''}`} aria-label={prominent ? '本日の注目特典' : '特定日のお得'} data-zone="event">{sharedNotice && <p className={s.sharedNotice}>{verificationMessage(statuses[0])}</p>}{items.map(c => <Benefit key={c.カード} candidate={c} featured={prominent} sharedNotice={sharedNotice} verification={getVerification(storeId,c.カード)} />)}</section>;
  };
  return <div className={s.backdrop}><div className={s.page} data-store-detail data-mode={featured.length ? 'benefit' : 'normal'}>
    <header className={s.header}><Link href="/" className={s.brand}><span aria-hidden="true">//</span>お支払いナビ</Link><button className="my-cards-button" aria-haspopup="dialog" onClick={cards.openModal}>マイカード{cards.myCardIds?.size ? ` ${cards.myCardIds.size}` : ''}</button></header>
    <main className={s.main}>
      <Link className={s.back} href="/">〈 お店一覧へ</Link>
      <header className={s.store}><h1>{store.店舗}</h1><span>{store.カテゴリ}</span></header>
      <div id="compare" tabIndex={-1} className={s.anchor} /><div id="my-cards" tabIndex={-1} className={s.anchor} />
      {mine && <section className={s.myHelp} aria-label="マイカードの絞り込み"><p role="status">{cards.myCardIds === null ? '登録情報を読み込んでいます…' : cards.hasMyCards ? '登録したカードに関連する候補です。適用条件は別途ご確認ください。' : 'マイカードは未登録です。カードを登録すると候補を絞れます。'}</p><button onClick={cards.openModal}>登録・変更する</button><a href="#compare">全候補を見る</a></section>}
      {mine && cards.myCardIds !== null && !candidates.length && <p className={s.empty}>該当する支払い候補はありません。</p>}
      <div className={s.primary}>{benefits(featured,true)}{normal}{benefits(otherDays,false)}</div>
      {grouped.groups.length > 1 && <section className={s.comparison} aria-labelledby="usual-heading" data-comparison><header className={s.sectionHeading}><div><h2 id="usual-heading">ほかの通常還元</h2><p>同じ率の候補をまとめて比較</p></div><a className={s.filter} href={mine ? '#compare' : '#my-cards'}>{mine ? '全候補を見る' : 'マイカードで絞る'}</a></header>{grouped.groups.slice(1).map(g => <NormalGroup key={g.rate} group={g} />)}</section>}
      {grouped.conditional.length > 0 && <section id="conditional" tabIndex={-1} className={s.comparison} aria-labelledby="conditional-heading" data-group="conditional"><header className={s.sectionHeading}><div><h2 id="conditional-heading">条件を確認して選ぶ</h2><p>追加条件・対象範囲が異なる候補</p></div>{grouped.groups.length < 2 && <a className={s.filter} href={mine ? '#compare' : '#my-cards'}>{mine ? '全候補を見る' : 'マイカードで絞る'}</a>}</header><OtherRows key={'conditional'+mine} items={grouped.conditional} /></section>}
      {grouped.discounts.length > 0 && <section className={s.comparison} data-group="discount" aria-labelledby="discount-heading"><header className={s.sectionHeading}><div><h2 id="discount-heading">割引のある支払い方</h2><p>ポイント還元とは別に比較</p></div></header><OtherRows key={'discount'+mine} items={grouped.discounts} /></section>}
      <nav className={s.utilityNav} aria-label="店舗の関連情報"><a href="#payments">使える決済</a><a href={mine ? '#compare' : '#my-cards'}>{mine ? '全候補を見る' : 'マイカードで絞る'}</a><Link href="/guide/calendar/">お得カレンダー</Link></nav>
      <section className={s.information}>
        <details id="payments" tabIndex={-1} open={paymentsOpen} onToggle={e => setPaymentsOpen(e.currentTarget.open)}><summary>使える決済方法<Chevron /></summary>{hasAcceptance ? acceptance : <p>対応決済の情報はありません。店舗の公式案内をご確認ください。</p>}{store.共通ポイント.length > 0 && <p>貯まる・使える共通ポイント：{store.共通ポイント.join('・')}</p>}</details>
        <details><summary>比較範囲・掲載情報について<Chevron /></summary><p>通常還元は、記載された条件から通常利用を区別できた候補の範囲で比較しています。すべての決済や特典を含む順位ではありません。条件によって有利な方法は異なります。</p><p>特典の日程だけで、開催や適用が確定するものではありません。対象日・店舗・商品・支払い方をご確認ください。特典の確認日は各詳細に記載しています。</p>{store.解説 && <p>{store.解説}</p>}</details>
        {relatedGuides && <div className={s.related}><h2>関連するお得ガイド</h2>{relatedGuides}</div>}
      </section>
      <AdUnit />
    </main>
    {cards.isModalOpen && <MyCardsModal myCardIds={cards.myCardIds} onToggle={cards.toggleMyCard} onClose={cards.closeModal} />}
  </div></div>;
}
