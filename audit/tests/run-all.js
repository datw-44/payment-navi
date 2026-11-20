"use strict";
/** 監査ツールのテストをまとめて実行する。 node audit/tests/run-all.js */
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const files = ["extract.test.js", "ledger.test.js"];
let failed = 0;
for (const f of files) {
  try {
    process.stdout.write(execFileSync("node", [path.join(__dirname, f)], { encoding: "utf8" }));
  } catch (e) {
    failed++;
    process.stdout.write(String(e.stdout || ""));
    process.stderr.write(String(e.stderr || ""));
  }
}
console.log(failed ? `\n${failed} テストファイルが失敗しました` : "\nすべてのテストファイルが成功しました");
process.exit(failed ? 1 : 0);
