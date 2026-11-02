"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { matchesStoreQuery } from "../storeSearch";
import { parseRateValue } from "../utils";
import { useMyCards } from "../hooks/useMyCards";
import MyCardsModal from "../components/MyCardsModal";
import { PreviewHeader, PreviewFooter } from "./Chrome";
import { CompassMark, ShopDrawing, Signpost, SearchIcon } from "./Graphics";
import styles from "./preview.module.css";
import GuideLinks from "./guides/GuideLinks";
import guideStyles from "./guides/editorial.module.css";
import { GUIDE_ARTICLES } from "../guide/articles";
import TodayOffers, { type TodayDeal } from "./calendar/Today";
import { useToday } from "./calendar/useToday";
import { matchesDay } from "./calendar/model";

type Store = { name: string; storeId: string; category: string; points: string[] };
type Deal = TodayDeal;
const storeLink = (id: string) => `/store/${id}/`;

export default function HomePreview({ stores, categories, deals }: { stores: Store[]; categories: string[]; deals: Deal[] }) {
  const [allCategories, setAllCategories] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const today = useToday();
  const inputRef = useRef<HTMLInputElement>(null);
  const cards = useMyCards();
  const groups = useMemo(() => categories.map((name) => ({ name, stores: stores.filter((store) => store.category === name && matchesStoreQuery(store.name, store.storeId, query)) }))
    .filter((group) => group.stores.length && (query.trim() || category === "すべて" || category === group.name)), [stores, categories, category, query]);
  const todaysDeals = useMemo(() => today ? deals.filter((deal) => matchesDay(deal.dateCondition, today))
    .sort((a, b) => parseRateValue(b.rate) - parseRateValue(a.rate)) : [], [today, deals]);
  const count = groups.reduce((sum, group) => sum + group.stores.length, 0);
  const goToResults = () => document.getElementById("stores")?.scrollIntoView({ block: "start" });

  return <>
    <PreviewHeader count={cards.myCardIds?.size ?? 0} onOpen={cards.openModal} />
    <main className={styles.home}>
      <section className={styles.hero} aria-labelledby="preview-title">
        <div className={styles.heroContent}>
          <div className={styles.heroIntro}>
            <div><p className={styles.eyebrow}>お店で選ぶ、支払いガイド</p><h1 id="preview-title">いつものお店で、<br/><span>おトクな支払い方</span>が<br className={styles.desktopBreak}/>わかる。</h1></div>
            <div className={styles.mobileArt}><Signpost /></div>
          </div>
          <p className={styles.heroLead}>コンビニ・スーパー・カフェなど、<br/>お店ごとの還元率と条件を、わかりやすく比較。</p>
          <form className={styles.search} onSubmit={(event) => { event.preventDefault(); goToResults(); }} role="search">
            <label className={styles.visuallyHidden} htmlFor="preview-search">店舗名・略称で検索</label>
            <SearchIcon />
            <input ref={inputRef} id="preview-search" type="search" value={query} placeholder="お店の名前で検索" autoComplete="off"
              onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape" && !event.nativeEvent.isComposing) setQuery(""); }} />
            {query && <button className={styles.clearSearch} type="button" aria-label="検索をクリア" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>×</button>}
            <button type="submit" className={styles.searchSubmit}>検索</button>
          </form>
          <p className={styles.visuallyHidden} role="status">{query.trim() || browseAll ? `${count}件のお店が見つかりました` : "店舗名やカテゴリから探せます"}</p>
          <p className={styles.searchHint}>例：セブン、まっく、ＫＦＣ <span>／ {stores.length}のお店を掲載</span></p>
        </div>
        <div className={styles.heroArt}><Signpost/><span className={styles.artCaption}></span></div>
      </section>

      <TodayOffers today={today} deals={todaysDeals}/>

      <section className={styles.browse} id="stores" aria-labelledby="stores-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>店舗を探す</p><h2 id="stores-title">条件からお店を探す</h2></div><span className={styles.resultCount} role="status">{query.trim() || browseAll ? count : stores.length}<small> 店舗</small></span></div>
        <div className={styles.directoryLayout}>
          <nav className={styles.categories} aria-label="店舗カテゴリ">{["コンビニ", "スーパー", "ファストフード", "カフェ", "ドラッグストア", "ホームセンター", "すべて", ...(allCategories ? categories.filter((name) => !["コンビニ", "スーパー", "ファストフード", "カフェ", "ドラッグストア", "ホームセンター"].includes(name)) : [])].map((name) => <button key={name} type="button" aria-label={name === "すべて" ? "すべてのカテゴリ" : undefined} aria-expanded={name === "すべて" ? allCategories : undefined} aria-pressed={category === name} className={category === name ? styles.categoryActive : ""}
            onClick={() => { setCategory(name); setQuery(""); setBrowseAll(true); if (name === "すべて") setAllCategories(!allCategories); }}><ShopDrawing category={name}/><span>{name === "すべて" ? "すべてのカテゴリ" : name}</span><small>{name === "すべて" ? stores.length : stores.filter((store) => store.category === name).length}</small></button>)}</nav>
          <div className={styles.directory}>
            {!browseAll && !query.trim() && <section className={styles.featuredStores}><div className={styles.groupHeading}><h3>定番のお店から探す</h3><button type="button" onClick={() => setBrowseAll(true)}>すべてのお店を見る →</button></div><div className={styles.featuredGrid}>{["ローソン", "セブンイレブン", "ファミリーマート", "マクドナルド", "スターバックス", "イオン"].map((name) => stores.find((store) => store.name === name)).filter((store): store is Store => !!store).map((store) => <Link key={store.storeId} href={storeLink(store.storeId)}><ShopDrawing category={store.category}/><strong>{store.name}</strong><span>支払い方法を比較 →</span></Link>)}</div></section>}
            {!count && <div className={styles.empty}><SearchIcon/><p>「{query}」に一致するお店はありません。</p><button type="button" onClick={() => { setQuery(""); setCategory("すべて"); inputRef.current?.focus(); }}>検索をクリアして探す</button></div>}
            {(browseAll || query.trim()) && groups.map((group) => <section key={group.name} className={styles.storeGroup} aria-label={group.name}>
              <div className={styles.groupHeading}><h3>{group.name}</h3><span>{group.stores.length.toString().padStart(2, "0")} STORES</span></div>
              <div className={styles.storeLinks}>{group.stores.map((store, index) => <Link href={storeLink(store.storeId)} className={styles.storeLink} key={store.storeId}>
                <span className={styles.shopStamp}><ShopDrawing category={group.name}/></span>
                <span className={styles.storeLinkText}><strong>{store.name}</strong><small title={store.points.join(" / ")}>{store.points.length ? store.points.slice(0, 2).join(" / ") : "支払い方法を比較"}</small></span><span className={styles.linkArrow} aria-hidden="true">↗</span>
              </Link>)}</div>
            </section>)}
          </div>
        </div>
      </section>
      <section className={guideStyles.related} id="guides"><p className={guideStyles.category}>お得ガイド</p><h2>支払いの「なぜ？」を、<br/>わかりやすく。</h2><GuideLinks articles={GUIDE_ARTICLES}/></section>
      <details className={styles.feedback}><summary>ご意見・ご要望を送る</summary><p>追加してほしい店舗・カードや改善点をお聞かせください。</p><iframe src="https://forms.gle/xrAa6keaBCLRghSF7" title="ご意見・ご要望フォーム" loading="lazy"/><a href="https://forms.gle/xrAa6keaBCLRghSF7" target="_blank" rel="noopener noreferrer">フォームを別の画面で開く ↗</a></details>
      <p className={styles.pageNote}>掲載情報の確認時点は、各店舗の注記をご覧ください。適用条件は各社の公式案内もご確認ください。</p>
    </main>
    <PreviewFooter/>
    {cards.isModalOpen && <MyCardsModal myCardIds={cards.myCardIds} onToggle={cards.toggleMyCard} onClose={cards.closeModal}/>}
  </>;
}
