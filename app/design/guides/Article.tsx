import Link from "next/link";
import type { GuideArticle } from "../../guide/articles";
import { GUIDE_ARTICLES, GUIDE_DISCLAIMER } from "../../guide/articles";
import SmbcStoreList from "../../guide/SmbcStoreList";
import AdUnit from "../../components/AdUnit";
import Frame from "./Frame";
import Body, { Block } from "./Body";
import GuideLinks from "./GuideLinks";
import { guideConfigs, sectionId, type EditorialId } from "./config";
import styles from "./editorial.module.css";
export default function Article({article}:{article:GuideArticle}) {
 const config=guideConfigs[article.id as EditorialId];const sections=config.sections;
 const outline=<ol>{sections.map((section,i)=><li key={i}><a href={`#${sectionId(i)}`}>{section.heading}</a></li>)}</ol>;
 return <Frame><main className={styles.main}>
 <nav aria-label="パンくずリスト" className={styles.breadcrumb}><Link href="/">お店を探す</Link><span>/</span><Link href="/#guides">お得ガイド</Link></nav>
 <article><header className={styles.hero}><p className={styles.category}>お得ガイド</p><h1>{article.title}</h1><p className={styles.lead}>{article.description}</p><p className={styles.dateHint}>確認時点は本文と記事末尾に記載しています。</p></header>
 <div className={styles.readingLayout}><div className={styles.articleColumn}>
 <section className={styles.takeaway} aria-labelledby="key-points"><h2 id="key-points" tabIndex={-1}>最初に押さえたいこと</h2><Block id={`${config.takeaway[0]}:${config.takeaway[1]}`} block={sections[config.takeaway[0]].blocks[config.takeaway[1]]}/></section>
 {!!config.flow.length&&<nav className={styles.flow} aria-label="準備から当日までの流れ">{config.flow.map((i,n)=><a key={i} href={`#${sectionId(i)}`}><span aria-hidden="true">{n+1}</span>{sections[i].heading}<small aria-hidden="true">→</small></a>)}</nav>}
 <details className={styles.mobileToc}><summary>この記事の目次</summary><nav aria-label="記事の目次（スマホ）">{outline}</nav></details>
 <Body sections={sections} promoted={config.takeaway} comparison={config.comparison} afterLast={article.id==="touch-payment"?<SmbcStoreList/>:undefined}/>
 <section className={styles.confirmation} aria-labelledby="confirmation-heading"><h2 id="confirmation-heading">情報の確認時点</h2><p>{GUIDE_DISCLAIMER}</p>{article.id==="touch-payment"&&<p>項目別の確認時点：<a href="#section-1">{sections[0].heading}</a></p>}</section>
 <div className={styles.readNext}><a href="#key-points">記事の要点に戻る ↑</a><Link href="/guide/calendar/">お得な日カレンダー →</Link></div>
 <AdUnit/>
 </div><aside className={styles.desktopToc}><nav aria-label="記事の目次"><p>この記事の目次</p>{outline}</nav></aside></div>
 </article>
 <section className={styles.related} aria-labelledby="related-heading"><div className={styles.relatedHeading}><h2 id="related-heading">あわせて読みたい</h2><Link href="/#guides">お得ガイドを見る →</Link></div><GuideLinks articles={GUIDE_ARTICLES.filter(a=>a.id!==article.id)}/></section>
 </main></Frame>;
}
