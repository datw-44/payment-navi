"use strict";
/**
 * JavaScriptで本文を描画するページ用。Playwright(Chromium)で実際に表示してから
 * innerText / alt / aria-label / 画像URL を取り出す。
 * HTMLだけで条件が読めないページ（西友のカレンダー、ニューデイズなど）で使う。
 */
const fs = require("node:fs");
const path = require("node:path");
const CACHE_DIR = path.join(__dirname, "..", "cache");

/**
 * @param {{name:string,url:string}[]} targets
 * @param {{waitMs?:number, shots?:boolean}} opts
 */
async function renderAll(targets, opts = {}) {
  const { chromium } = require("playwright");
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  for (const { name, url } of targets) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 2400 } });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(opts.waitMs || 2500);
      const data = await page.evaluate(() => ({
        text: document.body ? document.body.innerText : "",
        alts: [...document.querySelectorAll("img[alt]")].map((i) => i.alt).filter((a) => a.trim()),
        labels: [...document.querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label")).filter(Boolean),
        images: [...document.querySelectorAll("img")].map((i) => i.currentSrc || i.src).filter(Boolean),
        links: [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, text: (a.innerText || "").trim().slice(0, 60) })),
      }));
      const lines = [
        data.text,
        "\n===IMG_ALT===", ...data.alts,
        "\n===ARIA===", ...data.labels,
        "\n===IMAGES===", ...data.images,
        "\n===LINKS===", ...data.links.map((l) => `${l.href} | ${l.text}`),
      ].join("\n");
      const out = path.join(CACHE_DIR, `render-${name}.txt`);
      fs.writeFileSync(out, lines);
      if (opts.shots) await page.screenshot({ path: path.join(CACHE_DIR, `render-${name}.png`), fullPage: true });
      results.push({ name, url, ok: true, textLength: data.text.length, alts: data.alts.length,
                     images: data.images.length, links: data.links.length, out });
    } catch (e) {
      results.push({ name, url, ok: false, error: String(e.message).split("\n")[0] });
    }
    await page.close();
  }
  await browser.close();
  return results;
}

module.exports = { renderAll, CACHE_DIR };
