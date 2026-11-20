"use strict";
/** app/ のデータ（TypeScript）を監査ツールから読むための共通ローダ。 */
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

let installed = false;
function installTsRequire() {
  if (installed) return;
  require.extensions[".ts"] = (m, f) => m._compile(
    ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText, f);
  installed = true;
}

function load() {
  installTsRequire();
  const root = path.join(__dirname, "..", "..");
  const { getAllStoreIdEntries } = require(path.join(root, "app/storeIds.ts"));
  const { candidateSignature } = require(path.join(root, "app/design/store-detail/model.ts"));
  const { acceptance, ACCEPTANCE_CHECKED_AT } = require(path.join(root, "app/acceptance.ts"));
  const { dataMemos } = require(path.join(root, "app/dataMemos.ts"));
  const verification = require(path.join(root, "app/design/store-detail/verification-records.json"));
  return { entries: getAllStoreIdEntries(), candidateSignature, acceptance, ACCEPTANCE_CHECKED_AT, dataMemos, verification };
}

/** 監査台帳の行キー。店舗ID と候補名（店舗内で一意）で作る。 */
const itemId = (storeId, cardName) => `${storeId}::${cardName}`;

module.exports = { load, itemId, installTsRequire };
