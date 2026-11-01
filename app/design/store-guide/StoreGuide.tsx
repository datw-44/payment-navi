"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { PaymentCandidate, StorePayments } from "../../data";
import { parseRateValue } from "../../utils";
import { candidateMatchesMyCards } from "../../myCards";
import { useMyCards } from "../../hooks/useMyCards";
import MyCardsModal from "../../components/MyCardsModal";
import { PreviewHeader, PreviewFooter } from "../../design/Chrome";
import { essentialConditions } from "./essentialConditions";
import GuideGraphic from "./GuideGraphic";
import AdUnit from "../../components/AdUnit";
import chrome from "../../design/preview.module.css";
import styles from "./guide.module.css";

type View = "all" | "mine" | "payments" | null;
const routes = [
  { view: "all" as const, hash: "#compare", letter: "A", title: "おトクな支払い方を探す", short: "おトク順", description: "還元率と、受け取るための条件を比べる" },
  { view: "mine" as const, hash: "#my-cards", letter: "B", title: "持っているカードから探す", short: "マイカード", description: "登録したカードに関連する候補に絞る" },
  { view: "payments" as const, hash: "#payments", letter: "C", title: "使える決済方法を調べる", short: "使える決済", description: "カード・QRコード・電子マネーの対応を見る" },
];
function currentView(): View { return routes.find((route) => route.hash === window.location.hash)?.view ?? null; }
function Rate({ candidate }: { candidate: PaymentCandidate }) {
  const simple = candidate.還元率.match(/^(最大|約)?(\d+(?:\.\d+)?)%(割引)?$/);
  const compound = candidate.還元率.match(/^(最大|約|決済分)?(\d+(?:\.\d+)?)%(（.*）)$/);
  return <span className={`${styles.rate} ${simple ? "" : compound ? styles.compoundRate : styles.complexRate}`}>{simple ? <>{simple[1] && <small>{simple[1]}</small>}{simple[2]}<small>%{simple[3]}</small></> : compound ? <><span className={styles.rateAmount}>{compound[1] && <small>{compound[1]}</small>}{compound[2]}<small>%</small></span><span className={styles.rateSuffix}>{compound[3]}</span></> : candidate.還元率}</span>;
}
function Essential({ candidate }: { candidate: PaymentCandidate }) {
  return <span className={styles.essential}>{essentialConditions(candidate).map((line) => <span key={line} className={styles.conditionLine}>{line}</span>)}</span>;
}
function OfficialReference({ candidate }: { candidate: PaymentCandidate }) {
  return <>{/三井住友|Olive/.test(candidate.カード) && /スマホ.*タッチ/.test(candidate.条件 + candidate.条件要約) && parseRateValue(candidate.還元率) >= 7 && <a href="https://www.smbc-card.com/nyukai/merit/proper_p5.jsp" target="_blank" rel="noopener noreferrer">三井住友カードの公式条件 ↗</a>}{candidate.発行リンク && <a href={candidate.発行リンク} target="_blank" rel="noopener noreferrer sponsored">公式の申し込みページ（広告） ↗</a>}<p>利用前に、カード会社の公式案内で最新の条件をご確認ください。</p></>;
}

function Board({ store, mine, cards }: { store: StorePayments; mine: boolean; cards: ReturnType<typeof useMyCards> }) {
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const prefix = useId().replace(/:/g, "");
  const sorted = useMemo(() => [...store.候補].sort((a, b) => parseRateValue(b.還元率) - parseRateValue(a.還元率)), [store]);
  const candidates = cards.myCardIds === null ? [] : mine ? sorted.filter((candidate) => candidateMatchesMyCards(candidate.カード, cards.myCardIds!)) : sorted;
  const visible = showAll ? candidates : candidates.slice(0, 5);
  if (cards.myCardIds === null) return <p className={styles.status} role="status">カードの登録情報を読み込んでいます…</p>;
  return <>
    {mine && <div className={styles.myCardsHelp}><div><strong>{cards.hasMyCards ? `${cards.myCardIds.size}件の支払い方法を登録済み` : "お持ちのカードを登録すると、候補を絞れます"}</strong><p>保有カードとの関連で絞り込みます。特典の適用条件を満たすとは限りません。</p></div><button type="button" onClick={cards.openModal}>{cards.hasMyCards ? "登録内容を変更" : "マイカードを登録"}</button></div>}
    {!candidates.length ? <div className={styles.empty} role="status"><h3>{cards.hasMyCards ? "登録したカードに関連する候補がありません" : "まずは、カードを選びましょう"}</h3><p>{cards.hasMyCards ? "登録内容を変更するか、全候補から探してください。" : "登録はこのブラウザに保存されます。全候補を見ることもできます。"}</p><a href="#compare">全候補から探す →</a></div> : <>
      <div className={styles.boardNote}><p>条件付きの最大還元率順です。適用条件を満たす必要があります。</p><span role="status">{candidates.length}件の候補</span></div>
      <ul className={styles.comparisonList} aria-label="支払い方法の比較一覧">{visible.map((candidate, index) => {
        const open = expanded === candidate.カード;
        const id = `${prefix}-detail-${index}`;
        return <li className={styles.candidate} key={candidate.カード} data-candidate={candidate.カード}>
          <button className={styles.choiceRow} type="button" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setExpanded(open ? null : candidate.カード)}>
            <span className={styles.rowHeading}><span className={styles.method}>{candidate.カード}</span><span className={styles.rateColumn}><span className={styles.rateLabel}>条件適用時</span><Rate candidate={candidate}/><span className={styles.rowAction}>{open ? "閉じる" : "条件を見る"}<span aria-hidden="true"> {open ? "−" : "＋"}</span></span></span>
            <span className={styles.operation}><span className={styles.operationLabel}>支払い操作</span><span>{candidate.条件要約}</span></span></span>
            <Essential candidate={candidate}/>
          </button>
          {open && <section className={styles.detail} id={id} aria-label={`${candidate.カード}の詳細`}><h3>{candidate.カード}の適用条件</h3><dl><div><dt>条件の全文</dt><dd>{candidate.条件}</dd></div><div><dt>注意事項・対象外</dt><dd>{candidate.注意}</dd></div><div><dt>ポイントの種類</dt><dd>{candidate.ポイント種類}</dd></div></dl><div className={styles.reference}><h4>公式情報の確認先</h4><OfficialReference candidate={candidate}/></div></section>}
        </li>;
      })}</ul>
      {candidates.length > 5 && <button className={styles.more} type="button" onClick={() => { setShowAll(!showAll); setExpanded(null); }}>{showAll ? "上位5件に戻す" : `残り${candidates.length - 5}件の候補を見る`}<span aria-hidden="true">{showAll ? "−" : "＋"}</span></button>}
    </>}
  </>;
}

export default function StoreGuide({ store, acceptance, hasAcceptance, relatedGuides }: { store: StorePayments; acceptance: ReactNode; hasAcceptance: boolean; relatedGuides: ReactNode }) {
  const cards = useMyCards();
  const [view, setView] = useState<View>(null);
  const focusRef = useRef<HTMLHeadingElement>(null);
  const lastView = useRef<View>(null);
  useEffect(() => {
    const update = () => setView(currentView());
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    const frame = requestAnimationFrame(() => {
      focusRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);
  const selected = routes.find((route) => route.view === view);
  return <div className={`${chrome.shell} ${styles.previewScope}`}>
    <PreviewHeader count={cards.myCardIds?.size ?? 0} onOpen={cards.openModal}/>
    <main className={`${styles.main} ${view === null ? styles.entryMain : styles.compareMain}`}>
      <nav className={styles.breadcrumb} aria-label="パンくずリスト"><Link href="/">お店を探す</Link><span aria-hidden="true">/</span><span aria-current="page">{store.店舗}</span></nav>
      {view === null ? <div className={styles.entryLayout}>
        <header className={`${styles.storeIntro} ${store.店舗.length > 10 ? styles.longName : ""}`}><p>{store.カテゴリ}のお支払いガイド</p><h1>{store.店舗}</h1><span>知りたいことから、<br/>支払い方を見つけましょう。</span><div className={styles.guideGraphic}><GuideGraphic/></div></header>
        <section className={styles.entrance} aria-labelledby="guide-heading"><h2 id="guide-heading" ref={focusRef} tabIndex={-1}>何を調べますか？</h2><nav aria-label={`${store.店舗}で調べたいこと`}>{routes.map((route) => <a key={route.view} href={route.hash} className={styles.sign}><span className={styles.letter} aria-hidden="true">{route.letter}</span><span className={styles.signText}><strong>{route.title}</strong><small>{route.description}</small></span><span className={styles.arrow} aria-hidden="true">→</span></a>)}</nav></section>
      </div> : <>
        <header className={styles.compactHeader}><h1>{store.店舗}</h1><a href="#guide">← 案内に戻る</a></header>
        <nav className={styles.localNav} aria-label="店舗内の表示切り替え">{routes.map((route) => <a key={route.view} href={route.hash} aria-current={view === route.view ? "location" : undefined}>{route.short}</a>)}</nav>
        <section className={`${styles.panel} ${view === "payments" ? "" : styles.comparePanel}`} aria-labelledby="panel-heading" key={view}><div className={styles.panelHeading}><span>{selected?.letter}</span><h2 id="panel-heading" ref={focusRef} tabIndex={-1}>{view === "all" ? "おトクな支払い方を比較" : view === "mine" ? "持っているカードから比較" : `${store.店舗}で使える決済方法`}</h2></div>
          {view === "payments" ? <><p className={styles.supportLead}>還元特典の条件と、お店で決済に使えるかどうかは別です。</p>{hasAcceptance ? <div className={styles.acceptance}>{acceptance}</div> : <p className={styles.status}>掲載している対応決済データはありません。利用前に店舗の公式案内をご確認ください。</p>}{!!store.共通ポイント.length && <p className={styles.commonPoints}>貯まる・使える共通ポイント：{store.共通ポイント.join(" ／ ")}</p>}</> : <Board key={view} store={store} mine={view === "mine"} cards={cards}/>}
        </section>
      </>}
      <details className={styles.information}><summary>掲載情報・確認時点について</summary><div><p>{store.解説}</p>{store.候補.some((candidate) => /三井住友|Olive/.test(candidate.カード) && /スマホ.*タッチ/.test(candidate.条件 + candidate.条件要約) && parseRateValue(candidate.還元率) >= 7) && <a href="https://www.smbc-card.com/nyukai/merit/proper_p5.jsp" target="_blank" rel="noopener noreferrer">三井住友カード・Oliveの公式条件 ↗</a>}{relatedGuides}</div></details>
      {view !== null && store.解説 && <AdUnit/>}
    </main>
    <PreviewFooter/>
    {cards.isModalOpen && <MyCardsModal myCardIds={cards.myCardIds} onToggle={cards.toggleMyCard} onClose={cards.closeModal}/>}
  </div>;
}
