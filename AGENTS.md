# お支払いナビ：開発・保守ルール

## 作業範囲と承認

- Codexクラウド環境の既存チェックアウトを利用する。タスクは隔離されているため、ユーザーの依頼なしにGit worktreeを作成しない。
- 作業前後に `git status --short` と差分を確認し、既存の未コミット変更やローカルの作業を破棄しない。
- 依頼範囲内の小規模で安全な変更は実施してよい。大規模な変更、破壊的操作、無関係な機能・UI・データ・依存関係の変更は事前に承認を求める。
- GitHubへのpush前に、対象ブランチ、変更内容、検証結果を提示し、明示的な承認を得る。開発依頼やコミットの承認だけでpushが承認されたとは扱わない。
- mainへのpushは本番更新を伴う。手動デプロイ、GitHub Pages・Cloudflare DNS・公開設定・広告や計測設定の変更も個別の承認を得る。
- コミットは依頼された場合のみ行う。以前のClaude Code用の共同著者表記（`Co-authored-by`）を新しいコミットに自動追加しない。
- 秘密情報をログ・回答・コミットに含めない。追加ソフトウェアのインストールやシステム設定変更は実行前に確認する。承認済みの範囲は繰り返し確認しない。

## 情報の根拠と日付

- 還元率、キャンペーン、利用可能な決済方法は、店舗・カード会社・決済事業者の公式サイト、規約、公式告知を優先する。第三者情報だけで確定しない。
- 対象期間、対象店舗、支払い方法、エントリー、上限、除外条件、ポイントの重複可否を確認する。曖昧な場合に最大値を安易に採用せず、根拠が不足する更新は保留して不足事項を報告する。
- 参照URL・実際の確認日・適用条件を作業報告に残す。継続管理が必要な根拠や未確認事項は既存構造に合わせて `app/dataMemos.ts` に記録し、独自のデータ項目を無断追加しない。
- 公開情報の確認時点の表記は「情報は2026年X月時点」に統一し、Xには実際に確認した月を入れる。確認していないデータの日付を機械的に更新しない。キャンペーンの開催期間や適用日は、この確認時点と区別して正確に記載する。
- `ACCEPTANCE_CHECKED_AT` など共通の日付が示す範囲に注意し、一部の確認だけで全体が再確認済みに見える更新をしない。

## データの更新

- `app/data.ts`：店舗・候補・還元率・条件・注意・解説を管理する。候補と解説の矛盾を防ぎ、共通ポイントとカード独自のポイントを混同しない。
- `app/acceptance.ts`：確認できた「使える／使えない」だけ記載する。未確認を「使えない」と判断しない。店舗名は `data.ts` に一致させ、定義済みの項目を使い、同じ手段を両方に入れない。
- `app/dataMemos.ts`：運営用メモを置く。アプリからのimportは禁止。公開表示用データや記事本文に「要確認」「未確認」「確認中」「要チェック」「TODO」「FIXME」を入れない。公開リポジトリなので、このファイルにも秘密情報は置かない。
- 特定日特典は公式に日付・曜日を確認できたものだけ `特定日限定: true` とし、既存処理が解釈する形式の `対象日条件` を必ず付ける。
- 店舗名・候補名を変える場合は、acceptance、内部メモ、店舗ID・URL、関連ガイドへの影響を確認する。既存URLを安易に変えない。
- `app/myCards.ts` のカードID、組み合わせ判定、上位カードの扱い、localStorageの保存キーと保存済みデータの互換性を保護する。
- データ変更時は店舗解説、ガイド、ランキング、カレンダー・今日の特典表示との整合性も確認する。特典の日付判定は既存の日本時間の扱いを維持する。

## 開発・検証

リポジトリルートで実行する。依存関係の再導入は、承認された作業範囲でlockfileを維持する `npm ci` を使う。

```bash
npm run check:data
node scripts/rank-check.js
npm run build
```

- `npm run check` は未定義。検査を通すためだけにスクリプトや検証ルールを変更しない。
- `check:data` は表示禁止語、特定日条件、決済手段、内部メモの参照先・importなどを検査し、`prebuild` でも実行される。
- `rank-check.js` は確認用JSONの出力であり、解説との矛盾の自動合否判定ではない。変更店舗の還元率・条件・解説を出力と照合する。
- コストコの条件要約に関する既知の文字数警告4件は現時点では修正不要。新しい警告・エラーとは区別する。
- `npm run build` で型検査と静的生成を確認する。検証失敗時は原因を調べ、検査の無効化や無関係な修正で回避しない。
- 開発サーバーは `npm run dev -- --hostname 127.0.0.1 --port 3000`。ビルドとの同時実行は `.next` の競合を避けるため行わない。
- トップ、変更した店舗・ガイド、関連画面のHTTP応答と内容を確認する。UIや動作の変更では絞り込み、マイカード、カレンダーなど影響する機能も確認する。HTTP確認だけでブラウザ操作まで検証済みとしない。
- `npm run start` は静的エクスポートの配信確認には使わない。必要に応じて `out` を静的HTTPサーバーで配信して確認する。
- CIは `.github/workflows/deploy.yml` のNode.js設定を参照する。クラウドのNode.jsとの違いがあれば報告し、無断で設定を変更しない。
- Next.jsが追加・更新する指示ブロックは手書きルールと区別して保持する。開発起動後に差分を確認し、自動生成ファイルを無条件にコミットしない。
- 終了時に変更内容、実行した検証、失敗・警告・未検証項目を報告する。ローカル向けURLをクラウドの公開プレビューとして案内しない。

## 公開方式と既存機能の保護

- Next.js App Routerの静的エクスポートを維持する。`output: "export"`、`trailingSlash: true`、`images.unoptimized: true`、カスタムドメイン直下の構成を維持する。
- mainへのpushを契機にGitHub Actionsが `npm ci` → `npm run build` → `out` のGitHub Pages公開を行う。依頼なくこのフローを変更しない。
- `app/siteConfig.ts`、`CNAME`、`public/CNAME`、`public/ads.txt`、既存リンク・問い合わせ先・プライバシー表記を依頼なく変更しない。
- 静的公開で動かないサーバー依存の機能を無断で導入しない。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
