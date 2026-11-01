"use client";
import { useEffect, useState } from "react";
import { getJstDate, type JstDate } from "../../utils";
export function useToday() {
  const [today,setToday]=useState<JstDate|null>(null);
  useEffect(()=>{const update=()=>setToday(getJstDate());update();const timer=setInterval(update,30000);const visible=()=>{if(document.visibilityState==="visible")update();};document.addEventListener("visibilitychange",visible);return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",visible);};},[]);
  return today;
}
