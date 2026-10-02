// データの品質チェック。`npm run build` の前（prebuild）に自動で実行される。
//
// ルール：「要確認」「未確認」などの運営用メモは、app/data.ts（ページに表示される項目：
// 注意・条件・解説など）に書いてはいけない。必ず app/dataMemos.ts に書く
// （dataMemos.ts はアプリからimportしないので、ページのHTML・JSに入らず読者には見えない）。
// 違反があると終了コード1で止まり、ビルド・デプロイも止まる。
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const Module = require("module");

const FORBIDDEN = ["要確認", "未確認", "確認中", "要チェック", "TODO", "FIXME"];

const dataPath = path.join(__dirname, "..", "app", "data.ts");
const output = ts.transpileModule(fs.readFileSync(dataPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
}).outputText;
const m = new Module(dataPath);
m.filename = dataPath;
m._compile(output, dataPath);
const { paymentData } = m.exports;

const errors = [];
const warnings = [];

// すべての文字列を再帰的に調べる
function scan(value, where) {
  if (typeof value === "string") {
    for (const word of FORBIDDEN) {
      if (value.includes(word)) {
        errors.push(`${where}: 「${word}」は表示用の項目に書けません → app/dataMemos.ts に移してください: ${value.slice(0, 60)}`);
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scan(v, `${where}[${i}]`));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "内部メモ") {
        errors.push(`${where}: 内部メモ項目は data.ts に置けません → app/dataMemos.ts に移してください`);
        continue;
      }
      scan(v, `${where}.${k}`);
    }
  }
}

paymentData.forEach((store) => {
  scan(store, `[${store.店舗}]`);
  store.候補.forEach((c) => {
    if ((c.条件要約 || "").length > 20) {
      warnings.push(`[${store.店舗}] ${c.カード}: 条件要約が20文字を超えています（${c.条件要約.length}文字）`);
    }
    // 特定日限定は、日付・曜日の指定がないと機能しない
    if (c.特定日限定 && !c.対象日条件) {
      errors.push(`[${store.店舗}] ${c.カード}: 特定日限定なのに対象日条件がありません`);
    }
  });
});

// acceptance.ts（店舗ごとの「使える支払い方法」）の検査
const accPath = path.join(__dirname, "..", "app", "acceptance.ts");
if (fs.existsSync(accPath)) {
  const accOut = ts.transpileModule(fs.readFileSync(accPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const am = new Module(accPath);
  am.filename = accPath;
  am._compile(accOut, accPath);
  const { acceptance, ACCEPTANCE_ITEMS } = am.exports;
  const storeNames = new Set(paymentData.filter((st) => st.カテゴリ).map((st) => st.店舗));
  scan(acceptance, "acceptance.ts");
  for (const [name, data] of Object.entries(acceptance)) {
    if (!storeNames.has(name)) errors.push(`acceptance.ts: 存在しない店舗「${name}」`);
    for (const [group, value] of Object.entries(data)) {
      const ok = value.使える || [];
      const ng = value.使えない || [];
      const dup = ok.filter((x) => ng.includes(x));
      if (dup.length) errors.push(`acceptance.ts: [${name}].${group}: 「${dup.join("・")}」が使える・使えない両方に入っています`);
      if (group !== "その他") {
        const allowed = ACCEPTANCE_ITEMS[group];
        if (!allowed) errors.push(`acceptance.ts: [${name}] 不明な項目グループ「${group}」`);
        else for (const item of [...ok, ...ng]) {
          if (!allowed.includes(item)) errors.push(`acceptance.ts: [${name}].${group}: 「${item}」は表示項目にありません（${allowed.join("／")}）`);
        }
      }
    }
  }
  const noData = [...storeNames].filter((n) => !acceptance[n]);
  if (noData.length) warnings.push(`acceptance.ts: 使える支払い方法が未登録の店舗: ${noData.join("、")}`);
}

// dataMemos.ts：存在しない店舗・候補を指していないか（古いメモの残り）を検査する
const memoPath = path.join(__dirname, "..", "app", "dataMemos.ts");
if (fs.existsSync(memoPath)) {
  const memoOut = ts.transpileModule(fs.readFileSync(memoPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mm = new Module(memoPath);
  mm.filename = memoPath;
  mm._compile(memoOut, memoPath);
  for (const memo of mm.exports.dataMemos) {
    const store = paymentData.find((st) => st.店舗 === memo.店舗);
    if (!store) {
      errors.push(`dataMemos.ts: 存在しない店舗「${memo.店舗}」`);
    } else if (memo.カード && !store.候補.some((c) => c.カード === memo.カード)) {
      errors.push(`dataMemos.ts: [${memo.店舗}] に候補「${memo.カード}」がありません（名前を変えた？）`);
    }
  }
}

// アプリのコードが dataMemos.ts を読み込んでいないか（読み込むとページに同梱されてしまう）
(function checkNoImport(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) checkNoImport(full);
    else if (/\.(ts|tsx)$/.test(entry.name) && entry.name !== "dataMemos.ts") {
      if (/from\s+["'][^"']*dataMemos["']|require\([^)]*dataMemos/.test(fs.readFileSync(full, "utf8"))) {
        errors.push(`${path.relative(path.join(__dirname, ".."), full)}: dataMemos を import しないでください（ページに同梱され、読者に見えます）`);
      }
    }
  }
})(path.join(__dirname, "..", "app"));

// 記事の本文にも書かない
const guideContent = path.join(__dirname, "..", "app", "guide", "content.ts");
if (fs.existsSync(guideContent)) {
  const text = fs.readFileSync(guideContent, "utf8");
  for (const word of FORBIDDEN) {
    if (text.includes(word)) errors.push(`app/guide/content.ts: 「${word}」が含まれています`);
  }
}

warnings.forEach((w) => console.warn("warn:", w));
if (errors.length > 0) {
  console.error(`\ncheck-data: ${errors.length}件の問題があります\n` + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log(`check-data: OK（${paymentData.length}店舗、警告${warnings.length}件）`);
