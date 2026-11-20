"use strict";
/**
 * 監査台帳 audit/ledger/ledger.json を生成・更新する。
 *
 * 設計方針
 *  - 掲載内容そのものは台帳に複製しない。app/data.ts を唯一の正とし、
 *    台帳は「監査状態」だけを持つ（二重管理の防止）。
 *  - 掲載内容が変わったかどうかは既存の candidateSignature で判定する。
 *    署名が変われば dataChangedSinceAudit=true を立て、再確認対象に戻す。
 *  - 既存の監査結果は上書きしない。再実行しても調査済みの根拠は保持される。
 *  - 本番表示の承認記録（verification-records.json の displayApproval）とは
 *    完全に別物。この台帳に何を書いても本番表示は変わらない。
 *
 * 使い方: node audit/ledger/build.js
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { load, itemId } = require("../lib/data.js");

/** 掲載内容の指紋。生の内容を台帳に複製しないためハッシュだけを持つ。 */
const fingerprint = (sig) => crypto.createHash("sha1").update(sig).digest("hex").slice(0, 16);

const LEDGER = path.join(__dirname, "ledger.json");
const FINDINGS_DIR = path.join(__dirname, "..", "findings");
const STATUSES = ["一致", "不一致", "一部確認", "未確認"];

function emptyAudit() {
  return {
    status: "未確認",          // 一致 / 不一致 / 一部確認 / 未確認
    officialUrls: [],          // 根拠にした公式URL
    checkedAt: null,           // 確認日時 (ISO8601)
    method: null,              // html / browser / pdf / image / none
    evidence: [],              // 公式本文からの引用（該当箇所）
    confirmed: [],             // 確認できた条件
    unconfirmed: [],           // 未確認の条件
    mismatches: [],            // 掲載データとの相違
    fixes: [],                 // 修正が必要なデータ項目
    recheckAfter: null,        // 次回再確認の目安 (YYYY-MM-DD)
    fetchFailure: null,        // {reason, alternativeRoute} 取得失敗時
  };
}

/** audit/findings/*.json を読み、itemId -> 監査結果 の対応を作る。 */
function loadFindings() {
  const merged = {};
  const sources = {};
  if (!fs.existsSync(FINDINGS_DIR)) return { merged, sources, files: [] };
  const files = fs.readdirSync(FINDINGS_DIR).filter((f) => f.endsWith(".json")).sort();
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(FINDINGS_DIR, f), "utf8"));
    for (const [id, rec] of Object.entries(doc.items || {})) {
      merged[id] = { ...emptyAudit(), ...rec };   // 記録にない欄は既定値で埋める
      sources[id] = f;
    }
  }
  return { merged, sources, files };
}

function build() {
  const d = load();
  const findings = loadFindings();
  const prev = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, "utf8")) : { items: {}, acceptance: {} };
  const items = {};
  const acceptanceRows = {};
  let candidates = 0, benefits = 0, carried = 0, resetBySignature = 0;

  for (const { storeId, store } of d.entries) {
    for (const c of store.候補) {
      const id = itemId(storeId, c.カード);
      const sig = fingerprint(d.candidateSignature(c));
      const kind = c.特定日限定 === true ? "benefit" : "candidate";
      kind === "benefit" ? benefits++ : candidates++;
      const old = prev.items ? prev.items[id] : null;
      // 優先順位: findings の記録 > 前回の台帳 > 空
      let audit = findings.merged[id] || (old ? old.audit : emptyAudit());
      const source = findings.sources[id] || null;
      let dataChangedSinceAudit = false;
      if (old) {
        carried++;
        if (old.dataSignature !== sig && audit.status !== "未確認") {
          dataChangedSinceAudit = true;          // 掲載内容が監査後に変わった
          resetBySignature++;
        }
      }
      items[id] = { storeId, storeName: store.店舗, category: store.カテゴリ, cardName: c.カード,
                    kind, targetDays: c.対象日条件 || null, dataSignature: sig, dataChangedSinceAudit,
                    findingSource: source, audit };
    }
    const sup = d.acceptance[store.店舗];
    const counts = sup ? Object.values(sup).reduce((n, g) => n + ((g && g.使える ? g.使える.length : 0) + (g && g.使えない ? g.使えない.length : 0)), 0) : 0;
    const oldAcc = prev.acceptance ? prev.acceptance[storeId] : null;
    acceptanceRows[storeId] = { storeId, storeName: store.店舗, entryCount: counts,
                                audit: oldAcc ? oldAcc.audit : emptyAudit() };
  }

  const ledger = {
    meta: {
      note: "お支払いナビ 監査台帳。本番表示の承認記録 (app/design/store-detail/verification-records.json) とは別物で、ここの内容は公開画面に影響しない。",
      generatedAt: new Date().toISOString(),
      statuses: STATUSES,
      counts: { stores: d.entries.length, candidates, benefits, items: candidates + benefits,
                acceptanceStores: Object.keys(acceptanceRows).length },
      findingFiles: findings.files,
      acceptanceCheckedAt: d.ACCEPTANCE_CHECKED_AT,
      dataMemoCount: d.dataMemos.length,
      verificationRecords: { total: Object.keys(d.verification).length,
                             byStatus: Object.values(d.verification).reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {}),
                             withDisplayApproval: Object.values(d.verification).filter((r) => r.displayApproval).length },
    },
    items, acceptance: acceptanceRows,
  };
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1) + "\n");
  console.log(`監査台帳を書き出しました: audit/ledger/ledger.json`);
  console.log(`  店舗 ${d.entries.length} / 支払い候補 ${candidates} / 定例特典 ${benefits} / 行数 ${candidates + benefits}`);
  console.log(`  既存の監査結果を引き継いだ行: ${carried}（うち掲載内容の変更で再確認が必要: ${resetBySignature}）`);
  console.log(`  findings から反映した行: ${Object.keys(findings.merged).length}（${findings.files.join(", ") || "なし"}）`);
  const byStatus = {};
  for (const it of Object.values(items)) byStatus[it.audit.status] = (byStatus[it.audit.status] || 0) + 1;
  console.log(`  判定内訳: ${JSON.stringify(byStatus)}`);
  return ledger;
}

if (require.main === module) build();
module.exports = { build, LEDGER, STATUSES, emptyAudit, fingerprint };
