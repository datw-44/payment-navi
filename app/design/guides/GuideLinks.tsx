import Link from "next/link";
import type { GuideArticle } from "../../guide/articles";
import styles from "./editorial.module.css";
export default function GuideLinks({articles}:{articles:GuideArticle[]}) {
 return <div className={styles.guideLinks}>{articles.map(a=><Link href={`/guide/${a.id}/`} key={a.id} className={styles.guideLink} data-guide-link={a.id}>
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">{a.id==="calendar"?<><rect x="7" y="10" width="34" height="31" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M15 6v8M33 6v8M7 20h34M16 28h3m8 0h4m-15 7h3" stroke="currentColor" strokeWidth="2"/></>:a.id==="welcatsu"?<><path d="M8 9h32M8 24h32M8 39h32" stroke="#d9e5f4" strokeWidth="2"/><circle cx="12" cy="9" r="4" fill="currentColor"/><circle cx="24" cy="24" r="4" fill="currentColor"/><circle cx="36" cy="39" r="4" fill="currentColor"/><path d="m14 12 8 9m4 6 8 9" stroke="currentColor" strokeWidth="2"/></>:<><rect x="7" y="13" width="19" height="26" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="21" y="6" width="19" height="26" rx="2" fill="white" stroke="currentColor" strokeWidth="2"/><path d="m25 15 4 4 7-7M12 32h8" stroke="currentColor" strokeWidth="2"/></>}</svg>
  <div><h3>{a.title}</h3><p>{a.summary}</p></div><span className={styles.linkArrow} aria-hidden="true">↗</span>
 </Link>)}</div>;
}
