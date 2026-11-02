import Link from "next/link";
import type { ReactNode } from "react";
import { getStoreId } from "../../storeIds";
import type { GuideBlock, GuideSection } from "../../guide/content";
import { sectionId } from "./config";
import styles from "./editorial.module.css";
export function inline(text:string):ReactNode[] {
 return text.split(/(\{\{[^}]+\}\})/g).map((part,index)=>{
  const match=part.match(/^\{\{([^}]+)\}\}$/);if(!match)return part;
  const token=match[1];if(token.startsWith("@")){const[id,label]=token.slice(1).split("|");return <Link key={index} href={`/guide/${id}/`}>{label??id}</Link>;}
  const id=getStoreId(token);return id?<Link key={index} href={`/store/${id}/`}>{token}</Link>:token;
 });
}
function PaymentIcon({index}:{index:number}) {
 return <svg viewBox="0 0 56 44" fill="none" aria-hidden="true">{index===2?<><rect x="16" y="2" width="23" height="39" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M25 35h5M45 12q9 9 0 18M43 18q4 4 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>:<><rect x="4" y="10" width="37" height="25" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 18h35M10 29h9" stroke="currentColor" strokeWidth="2"/>{index===0?<path d="M30 3v9m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="2"/>:<path d="M46 10q10 12 0 24m-2-18q5 6 0 12" stroke="currentColor" strokeWidth="2"/>}</>}</svg>;
}
export function Block({block,id,comparison=false}:{block:GuideBlock;id:string;comparison?:boolean}){
 switch(block.type){
 case "p":return <p data-source-block={id}>{inline(block.text)}</p>;
 case "sub":return <h3 data-source-block={id}>{block.text}</h3>;
 case "note":return <aside className={styles.note} data-source-block={id}>{inline(block.text)}</aside>;
 case "ul":return <ul className={comparison?styles.comparison:undefined} data-source-block={id}>{block.items.map((text,i)=><li key={i}>{comparison&&<PaymentIcon index={i}/>}<span>{inline(text)}</span></li>)}</ul>;
 case "ol":return <ol className={styles.steps} data-source-block={id}>{block.items.map((text,i)=><li key={i}><span>{inline(text)}</span></li>)}</ol>;
 }
}
export default function Body({sections,promoted,comparison,afterLast}:{sections:GuideSection[];promoted:readonly[number,number];comparison?:readonly[number,number];afterLast?:ReactNode}){
 return <div className={styles.body}>{sections.map((section,i)=><section key={section.heading} aria-labelledby={sectionId(i)} className={styles.section}>
  <h2 id={sectionId(i)} tabIndex={-1}>{section.heading}</h2>
  {section.blocks.map((block,j)=>i===promoted[0]&&j===promoted[1]?null:<Block key={j} id={`${i}:${j}`} block={block} comparison={comparison?.[0]===i&&comparison[1]===j}/>)}
  {i===sections.length-1&&afterLast}
 </section>)}</div>;
}
