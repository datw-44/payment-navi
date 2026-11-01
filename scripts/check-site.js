// npm run build の後に node scripts/check-site.js で実行する。追加の依存関係は不要。
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "out");
const site = "https://oshiharai-navi.tiny-handy-works.com";
const searchPath = path.join(root, "app/storeSearch.ts");
const search = new Module(searchPath);
search._compile(ts.transpileModule(fs.readFileSync(searchPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
}).outputText, searchPath);
const { matchesStoreQuery } = search.exports;
for (const query of ["まくどなるど", "ﾏｸﾄﾞﾅﾙﾄﾞ", "マック", "ＭＣＤＯＮＡＬＤＳ"]) {
  assert.ok(matchesStoreQuery("マクドナルド", "mcdonalds", query), query);
}
assert.ok(matchesStoreQuery("ドン・キホーテ", "don-quijote", "どんき"));
assert.ok(matchesStoreQuery("ケンタッキーフライドチキン", "kfc", "ＫＦＣ"));
assert.ok(matchesStoreQuery("イトーヨーカドー", "ito-yokado", "いとーよーかどー"));
assert.ok(!matchesStoreQuery("ローソン", "lawson", "存在しない店舗"));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const pages = walk(out).filter((file) => file.endsWith("/index.html") &&
  !["404", "_not-found"].includes(path.basename(path.dirname(file))));
assert.ok(pages.length > 100, "店舗を含む静的ページが生成されていること");
const urls = new Set();
for (const file of pages) {
  const relative = path.relative(out, file).split(path.sep).join("/");
  const route = relative === "index.html" ? "/" : `/${relative.slice(0, -10)}`;
  const html = fs.readFileSync(file, "utf8");
  const canonical = `${site}${route}`;
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: h1は1つ`);
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);
  const canonicalLinks = links.filter((tag) => /rel="canonical"/.test(tag));
  assert.equal(canonicalLinks.length, 1, `${route}: canonicalは1つ`);
  assert.ok(canonicalLinks[0].includes(`href="${canonical}"`), canonical);
  urls.add(canonical);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !title.includes("最新"), `${route}: 未確認の最新表記を避ける`);
  const description = [...html.matchAll(/<meta\b[^>]*>/g)]
    .find((match) => /name="description"/.test(match[0]))?.[0];
  assert.ok(description, `${route}: description`);
  assert.ok(!/最大\d|1位は/.test(description), `${route}: 最大率・順位を強調しない`);
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  assert.ok(schemas.some((data) => data["@graph"]?.some((item) => item["@type"] === "WebSite")), `${route}: WebSite`);
  if (/^\/(store|guide)\//.test(route)) {
    const breadcrumb = schemas.find((data) => data["@type"] === "BreadcrumbList");
    assert.equal(breadcrumb?.itemListElement.at(-1).item, canonical, `${route}: breadcrumb`);
  }
  for (const match of html.matchAll(/<a\b[^>]*href="([^"#]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|\/\/)/.test(href)) continue;
    const target = new URL(href, canonical).pathname;
    const local = path.join(out, decodeURIComponent(target), target.endsWith("/") ? "index.html" : "");
    assert.ok(fs.existsSync(local), `${route}: リンク先 ${target}`);
  }
}
const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
assert.ok(!sitemap.includes("<lastmod>"), "管理していない更新日時を出力しない");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "サイトマップに重複がない");
assert.deepEqual(new Set(sitemapUrls), urls, "全公開ページとサイトマップが一致する");
const robots = fs.readFileSync(path.join(out, "robots.txt"), "utf8");
assert.match(robots, /Allow: \/\s/);
assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));
console.log(`check-site: OK（検索表記ゆれ、${pages.length}ページのh1・canonical・メタ情報・構造化データ・内部リンク・サイトマップ・robots）`);
