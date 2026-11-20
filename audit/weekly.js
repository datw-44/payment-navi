#!/usr/bin/env node
"use strict";
/**
 * 週次更新の一連の流れを通して実行する。
 *   node audit/weekly.js [--refetch]
 *
 *   1. 監査ツールのテスト（抽出処理が壊れていないか）
 *   2. 公式情報の取得（--refetch 指定時）
 *   3. 前回取得分との差分検出（公式ページが変わったかどうか）
 *   4. 掲載データとの比較（台帳の再生成）
 *   5. 修正が必要な項目の特定と修正候補の生成
 *   6. 既存の検証テスト
 *   7. 報告（audit/reports/ に書き出す）
 *
 * 本番データは一切変更しない。修正候補は提案として書き出すだけ。
 */
const { execFileSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, "cache");
const SNAP = path.join(CACHE, "page-snapshots.json");
const REPORTS = path.join(__dirname, "reports");
const LEDGER = path.join(__dirname, "ledger/ledger.json");
const ISSUERS = path.join(__dirname, "findings/issuers/2026-11-issuers.json");
const refetch = process.argv.includes("--refetch");

const log = (s) => console.log(s);
const run = (cmd, args) => {
  try { return { ok: true, out: execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) }; }
  catch (e) { return { ok: false, out: String(e.stdout || "") + String(e.stderr || "") }; }
};

// curl ではTLSのレガシー再ネゴシエーション要求で接続できないが、実ブラウザなら到達できるホスト。
// アクセス制限の回避ではなく、接続方式の非互換への対応。
const BROWSER_HOSTS = ["dpoint.docomo.ne.jp"];
const needsBrowser = (u) => { try { return BROWSER_HOSTS.includes(new URL(u).host); } catch { return false; } };

async function main() {
  // ───────── 1 ─────────
  log("【1】監査ツールのテスト");
  const t1 = run("node", ["audit/tests/run-all.js"]);
  log(`  ${t1.ok ? "合格" : "失敗"}: ${(t1.out.match(/\d+ tests passed/g) || []).join(" / ") || "出力なし"}`);
  if (!t1.ok) { log("  抽出処理が壊れている可能性があるため中止します。"); process.exitCode = 1; return; }

  // ───────── 2-3 ─────────
  log("\n【2-3】公式ページの取得と前回との差分");
  const { fetchPage, verdict } = require("./lib/fetch.js");
  const { renderAll } = require("./lib/render.js");
  const snapshots = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, "utf8")) : {};
  const ledger0 = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
  const issuerDoc = JSON.parse(fs.readFileSync(ISSUERS, "utf8"));
  const urls = new Set();
  for (const it of Object.values(ledger0.items)) for (const u of it.audit.officialUrls || []) urls.add(u);
  for (const iss of Object.values(issuerDoc.issuers)) for (const u of iss.officialUrls || []) urls.add(u);
  const watched = [...urls].filter((u) => /^https?:\/\//.test(u));
  log(`  監視対象の公式URL: ${watched.length}件`);

  const changes = [], failures = [], unchanged = [];
  if (refetch) {
    const browserTargets = watched.filter(needsBrowser);
    const rendered = {};
    if (browserTargets.length) {
      const res = await renderAll(browserTargets.map((u, i) => ({ name: "weekly" + i, url: u })), { waitMs: 2500 });
      res.forEach((x, i) => { if (x.ok && fs.existsSync(x.out)) rendered[browserTargets[i]] = fs.readFileSync(x.out, "utf8"); });
    }
    for (const u of watched) {
      let text = null, v = null;
      if (needsBrowser(u)) {
        text = rendered[u] || null;
        v = text ? "取得成功（ブラウザ）" : "ブラウザでも取得できず";
      } else {
        const r = fetchPage(u, { force: true });
        v = verdict(r);
        if (r.extracted && /取得成功/.test(v)) text = r.extracted.text;
      }
      if (!text) { failures.push({ url: u, verdict: v }); continue; }
      const lines = text.split("\n").length;
      const h = crypto.createHash("sha1").update(text).digest("hex").slice(0, 16);
      const prev = snapshots[u];
      if (!prev) snapshots[u] = { hash: h, lines, seenAt: new Date().toISOString() };
      else if (prev.hash !== h) {
        changes.push({ url: u, before: prev.lines, after: lines, lastSeen: prev.seenAt });
        snapshots[u] = { hash: h, lines, seenAt: new Date().toISOString() };
      } else unchanged.push(u);
    }
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(SNAP, JSON.stringify(snapshots, null, 1));
    log(`  取得成功 ${watched.length - failures.length} / 変化あり ${changes.length} / 変化なし ${unchanged.length} / 取得失敗 ${failures.length}`);
    for (const c of changes) log(`    変化: ${c.url}（${c.before}行 → ${c.after}行、前回 ${c.lastSeen}）`);
  } else {
    log("  --refetch 未指定のため取得はスキップ（差分検出には再取得が必要）");
  }

  // ───────── 4 ─────────
  log("\n【4】掲載データとの比較（台帳の再生成）");
  const t4 = run("node", ["audit/ledger/build.js"]);
  log(t4.out.trim().split("\n").map((l) => "  " + l.trim()).join("\n"));

  // ───────── 5 ─────────
  log("\n【5】修正候補の生成");
  const fresh = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
  const proposals = [];
  for (const [id, it] of Object.entries(fresh.items)) {
    const fixes = it.audit.fixes || [];
    if (!fixes.length) continue;
    proposals.push({ id, store: it.storeName, card: it.cardName, status: it.audit.status,
                     officialUrls: it.audit.officialUrls, checkedAt: it.audit.checkedAt,
                     fixes, mismatches: it.audit.mismatches || [] });
  }
  proposals.sort((a, b) => (a.status === "不一致" ? 0 : 1) - (b.status === "不一致" ? 0 : 1));
  log(`  修正候補のある項目: ${proposals.length}件（うち不一致 ${proposals.filter((p) => p.status === "不一致").length}件）`);

  // ───────── 6 ─────────
  log("\n【6】既存の検証テスト");
  const results = [];
  for (const [name, cmd, args] of [
    ["データ検査", "npm", ["run", "check:data"]],
    ["店舗UIテスト", "node", ["scripts/test-store-detail.cjs"]],
    ["ランキング検査", "node", ["scripts/rank-check.js"]],
  ]) {
    const r = run(cmd, args);
    results.push({ name, ok: r.ok });
    log(`  ${r.ok ? "OK  " : "失敗"} ${name}`);
  }

  // ───────── 7 ─────────
  log("\n【7】報告の書き出し");
  fs.mkdirSync(REPORTS, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const out = path.join(REPORTS, `${today}-weekly.md`);
  const tally = (f) => Object.values(fresh.items).filter(f).length;
  const md = [
    `# お支払いナビ 週次監査レポート（${today}）`, "",
    "本番データは変更していません。以下は現状の報告と修正の提案です。", "",
    "## 監査の進捗", "",
    `- 対象: 店舗 ${fresh.meta.counts.stores} / 支払い候補 ${fresh.meta.counts.candidates} / 定例特典 ${fresh.meta.counts.benefits}（合計 ${fresh.meta.counts.items}）`,
    `- 一致 ${tally((v) => v.audit.status === "一致")} / 不一致 ${tally((v) => v.audit.status === "不一致")} / 一部確認 ${tally((v) => v.audit.status === "一部確認")} / 未確認 ${tally((v) => v.audit.status === "未確認")}`,
    `- 調査済み ${tally((v) => v.phase === "調査済み")} / 未着手 ${tally((v) => v.phase === "未着手")}`,
    `- 本番の承認記録（別管理・変更しない）: ${fresh.meta.verificationRecords.total}件、displayApproval付き ${fresh.meta.verificationRecords.withDisplayApproval}件`, "",
    "## 公式ページの変化", "",
    refetch
      ? (changes.length ? changes.map((c) => `- ${c.url}（${c.before}行 → ${c.after}行、前回確認 ${c.lastSeen}）`).join("\n") : "- 変化は検出されませんでした。")
      : "- 今回は再取得していないため差分は未検出（`node audit/weekly.js --refetch` で実行）。", "",
    ...(refetch && failures.length
      ? ["### 取得できなかった公式URL", "", ...failures.map((f) => `- ${f.url} … ${f.verdict}`), ""]
      : []),
    "## 修正候補", "",
    ...(proposals.length
      ? proposals.flatMap((p) => [
          `### [${p.status}] ${p.store} / ${p.card}`, "",
          ...(p.mismatches.length ? ["**相違点**", "", ...p.mismatches.map((m) => `- ${m}`), ""] : []),
          "**修正候補**", "", ...p.fixes.map((f) => `- ${f}`), "",
          `出典: ${(p.officialUrls || []).join(" / ") || "（なし）"}　確認日時: ${p.checkedAt || "（なし）"}`, "",
        ])
      : ["- 修正候補はありません。", ""]),
    "## 検証結果", "",
    ...results.map((r) => `- ${r.name}: ${r.ok ? "OK" : "失敗"}`), "",
    "## 未確認の扱い", "",
    "公式情報を取得できなかった項目は、推測で埋めず未確認のままにしています。",
    "取得失敗の理由と代替確認ルートは `audit/ledger/ledger.json` の `audit.fetchFailure` に記録しています。", "",
  ].join("\n");
  fs.writeFileSync(out, md + "\n");
  log(`  書き出しました: ${path.relative(ROOT, out)}`);
  log("\n完了。本番データは変更していません。");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
