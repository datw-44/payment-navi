const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const Module = require("module");

const dataPath = path.join(__dirname, "..", "app", "data.ts");
const source = fs.readFileSync(dataPath, "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

const m = new Module(dataPath);
m.filename = dataPath;
m._compile(output, dataPath);
const { paymentData, categoryOrder } = m.exports;

function parseRateValue(rate) {
  const numbers = rate.match(/\d+(\.\d+)?(?=%)/g);
  if (!numbers) return 0;
  return Math.max(...numbers.map(Number));
}

const results = paymentData
  .filter((s) => s.カテゴリ && s.カテゴリ !== "")
  .map((store) => {
    const sorted = [...store.候補].sort(
      (a, b) => parseRateValue(b.還元率) - parseRateValue(a.還元率)
    );
    const top = sorted[0];
    return {
      店舗: store.店舗,
      カテゴリ: store.カテゴリ,
      解説あり: !!store.解説,
      候補数: store.候補.length,
      "1位カード": top.カード,
      "1位還元率": top.還元率,
      "1位注意": top.注意,
      "1位特定日限定": !!top.特定日限定,
      "1位対象日条件": top.対象日条件 || null,
      "2位カード": sorted[1] ? sorted[1].カード : null,
      "2位還元率": sorted[1] ? sorted[1].還元率 : null,
      特定日候補一覧: store.候補
        .filter((c) => c.特定日限定)
        .map((c) => `${c.カード}(${c.還元率}/${c.対象日条件})`),
    };
  });

console.log(JSON.stringify(results, null, 2));
