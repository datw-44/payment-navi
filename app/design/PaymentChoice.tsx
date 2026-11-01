"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { PaymentCandidate, StorePayments } from "../data";
import { candidateMatchesMyCards } from "../myCards";
import { parseRateValue } from "../utils";
import { useMyCards } from "../hooks/useMyCards";
import MyCardsModal from "../components/MyCardsModal";
import { PreviewHeader, PreviewFooter } from "./Chrome";
import { conditionHints } from "./conditionHints";
import styles from "./choice.module.css";
import AdUnit from "../components/AdUnit";
import { GUIDE_ARTICLES } from "../guide/articles";
import { getRelatedGuideIds } from "../guide/related";

function PhoneIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M11 18h2M20 6q4 5 0 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>; }
function Rate({ candidate }: { candidate: PaymentCandidate }) {
  const simple = candidate.還元率.match(/^(最大)?(\d+(?:\.\d+)?)%(割引)?$/);
  return <div className={styles.rate}><span className={styles.rateCaption}>条件適用時の{candidate.還元率.includes("最大") ? "最大" : ""}{candidate.還元率.includes("割引") ? "割引・特典" : "還元率"}</span><p className={`${styles.rateValue} ${!simple ? styles.complexRate : ""}`}>{simple ? <>{simple[1] && <small>最大 </small>}{Number(simple[2]).toFixed(1)}<span>%</span>{simple[3] && <small> 割引</small>}</> : candidate.還元率}</p></div>;
}
function Requirements({ candidate }: { candidate: PaymentCandidate }) {
  const hints = conditionHints(candidate);
  return <div className={styles.requirements}>
    <div className={styles.operation}>{candidate.条件要約.includes("スマホ") ? <PhoneIcon/> : <span className={styles.operationArrow} aria-hidden="true">→</span>}<div><span>支払い操作・条件</span><p>{candidate.条件要約}</p></div></div>
    {!!hints.labels.length && <ul className={styles.labels} aria-label="主な適用条件">{hints.labels.map((label) => <li key={label}>{label}</li>)}</ul>}
    <div className={styles.caution}><span aria-hidden="true">!</span><div><p>{candidate.注意}</p>{hints.visibleClauses.map((clause) => <p key={clause}>{clause}</p>)}</div></div>
    {candidate.特定日限定 && candidate.対象日条件 && <p className={styles.specialDay}>対象日：{candidate.対象日条件}</p>}
  </div>;
}

export default function PaymentChoice({ store, acceptance, breadcrumb }: { store: StorePayments; acceptance?: ReactNode; breadcrumb?: ReactNode }) {
  const cards = useMyCards();
  const relatedGuides = GUIDE_ARTICLES.filter((article) => getRelatedGuideIds(store).includes(article.id));
  const hasAffiliateLink = store.候補.some((candidate) => Boolean(candidate.発行リンク));
  const [chosenScope, setChosenScope] = useState<"all" | "mine" | null>(null);
  const scope = chosenScope ?? (cards.hasMyCards ? "mine" : "all");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isCompareOpen, setCompareOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sorted = useMemo(() => [...store.候補].sort((a, b) => parseRateValue(b.還元率) - parseRateValue(a.還元率)), [store]);
  const candidates = cards.myCardIds === null ? [] : scope === "all" ? sorted : sorted.filter((candidate) => candidateMatchesMyCards(candidate.カード, cards.myCardIds!));
  const visible = showAll ? candidates : candidates.slice(0, 5);
  // スコープや登録カードを変更したら、今の候補から外れた選択は比較に持ち込まない。
  const activeSelected = selected.filter((name) => candidates.some((candidate) => candidate.カード === name));
  const compared = candidates.filter((candidate) => activeSelected.includes(candidate.カード));
  const changeScope = (next: "all" | "mine") => { setChosenScope(next); setShowAll(false); setSelected([]); };
  const toggleSelected = (name: string) => setSelected(activeSelected.includes(name) ? activeSelected.filter((value) => value !== name) : activeSelected.length < 2 ? [...activeSelected, name] : activeSelected);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isCompareOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [isCompareOpen]);

  return <div className={styles.shell}>
    <PreviewHeader count={cards.myCardIds?.size ?? 0} onOpen={cards.openModal}/>
    <main className={styles.main}>
      <div className={styles.breadcrumb}>{breadcrumb ?? <nav aria-label="パンくずリスト"><Link href="/">お店を探す</Link><span aria-hidden="true"> / </span><span aria-current="page">{store.店舗}</span></nav>}</div>
      <header className={styles.pageHeading}><p>お店の支払いガイド ／ {store.カテゴリ}</p><h1>{store.店舗}の支払い方法を比較</h1></header>
      {hasAffiliateLink && <p className={styles.prNotice}>本ページには広告（アフィリエイトリンク）が含まれます</p>}
      <div className={styles.layout}>
        <div className={styles.comparison}>
          <section className={styles.scope} aria-label="比較する候補を選ぶ">
            <div className={styles.scopeTop}><h2>まずは、候補を選ぶ</h2><button type="button" onClick={cards.openModal}>{cards.hasMyCards ? "登録カードを変更" : "マイカードを登録"}<span aria-hidden="true"> ＋</span></button></div>
            <div className={styles.tabs}><button type="button" aria-pressed={scope === "all"} onClick={() => changeScope("all")}>全候補<span>{sorted.length}</span></button><button type="button" aria-pressed={scope === "mine"} onClick={() => changeScope("mine")}>マイカードの候補{cards.myCardIds !== null && cards.hasMyCards && <span>{sorted.filter((candidate) => candidateMatchesMyCards(candidate.カード, cards.myCardIds!)).length}</span>}</button></div>
            <p className={styles.scopeHelp}>{scope === "mine" ? "登録したカードに合う候補を表示します。特典の条件達成や実際の利用可否を保証するものではありません。" : "マイカードで、お持ちのカードの候補に絞れます。"}</p>
          </section>
          <section aria-labelledby="comparison-heading" className={styles.results}>
            <div className={styles.resultsHeading}><h2 id="comparison-heading">還元率と条件を比べる</h2><span role="status">{cards.myCardIds === null ? "読込中" : `${candidates.length}件`}</span></div>
            <p className={styles.comparisonNote}>条件付きの最大還元率で比較しています。条件を満たさない場合、表示の還元率は適用されません。</p>
            {cards.myCardIds === null ? <p className={styles.empty} role="status">登録した支払い方法を読み込んでいます…</p> : !candidates.length ? <div className={styles.empty} role="status"><h3>{cards.hasMyCards ? "登録したカードに合う候補がありません" : "マイカードを登録して、候補を絞れます"}</h3><p>{cards.hasMyCards ? "登録内容を変更するか、全候補から支払い方を探してください。" : "お持ちのカードを選ぶだけ。特典条件の達成状況は、カードごとにご確認ください。"}</p><button type="button" onClick={cards.openModal}>マイカードを登録・変更</button><button type="button" onClick={() => changeScope("all")}>全候補を見る</button></div> : <>
              <p className={styles.selectHelp}>気になる2件を選ぶと、条件を並べて比較できます。</p>
              <div className={styles.list}>{visible.map((candidate, index) => {
                const isSelected = activeSelected.includes(candidate.カード);
                const registered = cards.myCardIds && candidateMatchesMyCards(candidate.カード, cards.myCardIds);
                return <article className={`${styles.candidate} ${index === 0 ? styles.leading : ""} ${isSelected ? styles.selected : ""}`} key={candidate.カード} data-candidate={candidate.カード}>
                  <div className={styles.candidateTop}><div className={styles.position}><span>{String(index + 1).padStart(2, "0")}</span>{index === 0 && <small>{scope === "mine" ? "登録したカードの中で上位" : "掲載候補の中で上位"}</small>}{registered && <em>登録済み</em>}</div><label className={styles.selectControl}><input type="checkbox" checked={isSelected} disabled={!isSelected && activeSelected.length === 2} onChange={() => toggleSelected(candidate.カード)}/><span>比較に追加</span><span className={styles.srOnly}>：{candidate.カード}</span></label></div>
                  <div className={styles.candidateHeading}><div><h3>{candidate.カード === "Oliveフレキシブルペイ" ? <><span className={styles.nameChunk}>Olive</span><span className={styles.nameChunk}>フレキシブルペイ</span></> : candidate.カード}</h3><p>{candidate.ポイント種類}</p></div><Rate candidate={candidate}/></div>
                  <Requirements candidate={candidate}/>
                  <details className={styles.details}><summary>詳しい適用条件を見る</summary><div><h4>掲載している適用条件</h4><p>{candidate.条件}</p>{candidate.発行リンク && <a href={candidate.発行リンク} target="_blank" rel="noopener noreferrer sponsored">公式サイトで申し込む ↗</a>}</div></details>
                </article>;
              })}</div>
              {candidates.length > 5 && <button className={styles.more} type="button" onClick={() => setShowAll(!showAll)}>{showAll ? "上位5件に戻す" : `残り${candidates.length - 5}件の支払い方法を見る`}<span aria-hidden="true">{showAll ? "−" : "＋"}</span></button>}
            </>}
          </section>
          <section className={styles.commentary} id="store-notes"><h2>{store.店舗}で支払う前に</h2><p>{store.解説}</p></section>
          {store.解説 && <AdUnit/>}
        </div>
        <aside className={styles.sidebar} aria-label="使える決済と確認情報">
          <details className={styles.acceptance} open><summary>{store.店舗}で使える決済</summary><div>{acceptance}</div></details>
          {!!store.共通ポイント.length && <section className={styles.points}><h2>貯まる・使える共通ポイント</h2><ul>{store.共通ポイント.map((point) => <li key={point}>{point}</li>)}</ul></section>}
          <section className={styles.source}><p>情報の確認時点</p><h2>使う前に、条件を確認</h2>{store.店舗 === "ローソン" ? <><dl><div><dt>三井住友カード・Olive</dt><dd>情報は2026年11月時点</dd></div><div><dt>その他の候補・決済対応</dt><dd>情報は2026年10月時点</dd></div></dl><a href="https://www.smbc-card.com/nyukai/merit/proper_p5.jsp" target="_blank" rel="noopener noreferrer">三井住友カードの公式条件 ↗</a></> : <p className={styles.sourceNote}>確認時点の記載がある情報は、店舗解説・決済対応一覧をご覧ください。</p>}<p className={styles.sourceNote}>条件・対象店舗は、利用前に各社の公式案内をご確認ください。</p><a href="#store-notes">店舗解説と確認情報を読む ↓</a></section>
          {!!relatedGuides.length && <nav className={styles.guides} aria-label="関連ガイド">{relatedGuides.map((article) => <Link key={article.id} href={`/guide/${article.id}/`}>{article.title} ↗</Link>)}</nav>}
        </aside>
      </div>
    </main>
    <PreviewFooter/>
    {!!activeSelected.length && <div className={styles.compareBar}><div><strong role="status">{activeSelected.length}/2件を選択</strong><span>{activeSelected.length === 1 ? "あと1件選ぶと比較できます" : "還元率と条件を並べて確認"}</span></div><button type="button" disabled={activeSelected.length !== 2} onClick={() => setCompareOpen(true)}>2件を比較する</button><button type="button" className={styles.clearSelection} onClick={() => setSelected([])}>解除</button></div>}
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="compare-title" onCancel={() => setCompareOpen(false)} onClose={() => setCompareOpen(false)} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary, input:not([disabled]), [tabindex="0"]')].filter((item) => item.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}><div className={styles.dialogHeading}><div><p>選択した2件を比較</p><h2 id="compare-title">支払い方と条件を見比べる</h2></div><button type="button" onClick={() => setCompareOpen(false)} aria-label="比較を閉じる">×</button></div><p className={styles.dialogNote}>登録したカードでも、特典の適用条件を満たす必要があります。</p><table className={styles.compareTable}><caption className={styles.srOnly}>選択した支払い方法の項目別比較</caption><thead><tr><th scope="col">比較項目</th>{compared.map((candidate) => <th scope="col" key={candidate.カード}>{candidate.カード}</th>)}</tr></thead><tbody>
      <tr><th scope="row">還元率・特典</th>{compared.map((candidate) => <td key={candidate.カード}><Rate candidate={candidate}/></td>)}</tr>
      <tr><th scope="row">支払い操作</th>{compared.map((candidate) => <td key={candidate.カード}>{candidate.条件要約}</td>)}</tr>
      <tr><th scope="row">適用条件</th>{compared.map((candidate) => <td key={candidate.カード}>{conditionHints(candidate).labels.map((label) => <p key={label}>{label}</p>)}{conditionHints(candidate).visibleClauses.length ? conditionHints(candidate).visibleClauses.map((clause) => <p key={clause}>{clause}</p>) : <p>{candidate.条件要約}</p>}</td>)}</tr>
      <tr><th scope="row">注意事項</th>{compared.map((candidate) => <td key={candidate.カード}>{candidate.注意}</td>)}</tr>
      {compared.some((candidate) => candidate.特定日限定) && <tr><th scope="row">対象日</th>{compared.map((candidate) => <td key={candidate.カード}>{candidate.特定日限定 ? candidate.対象日条件 || "条件全文をご確認ください" : "特定日の記載なし"}</td>)}</tr>}
      <tr><th scope="row">ポイント</th>{compared.map((candidate) => <td key={candidate.カード}>{candidate.ポイント種類}</td>)}</tr>
      <tr><th scope="row">条件全文</th>{compared.map((candidate) => <td key={candidate.カード}><details><summary>全文を見る</summary><p>{candidate.条件}</p>{candidate.発行リンク && <a href={candidate.発行リンク} target="_blank" rel="noopener noreferrer sponsored">公式サイトで申し込む ↗</a>}</details></td>)}</tr>
    </tbody></table></dialog>
    {cards.isModalOpen && <MyCardsModal myCardIds={cards.myCardIds} onToggle={cards.toggleMyCard} onClose={cards.closeModal}/>}
  </div>;
}
