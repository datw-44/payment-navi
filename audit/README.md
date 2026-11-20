# 監査基盤（audit/）

お支払いナビの掲載データを公式一次情報と照合するための調査・監査用のコード置き場です。
**本番のアプリ（`app/`）からは一切importしません。公開画面には影響しません。**

## これは何のためにあるか

2026-11-19の初回監査で、2件の特典を誤って「公式に記載なし」と判定しました。

| 誤判定 | 原因 |
|---|---|
| ローソンPontaプラスの時間帯別還元率 | `<img alt="...">` をタグごと除去していたため、altにしか書かれていない条件を読めていなかった |
| まいばすけっとの20日・30日5倍デー | 抽出結果を先頭80行で打ち切っていたため、118行目の該当セクションを読めていなかった |

**「取得できなかった」「抽出できなかった」と「公式に存在しない」は別物です。**
この区別を壊さないことが、この基盤の最大の目的です。

## ファイル構成

```
audit/
  lib/extract.js     HTML → 全文テキスト（alt / aria-label / meta description / title を本文として保持）
  lib/fetch.js       公式ページの取得。取得結果は audit/cache/ に保存して再取得しない
  lib/render.js      Playwright(Chromium)で描画後の本文・alt・画像URLを取得（JS描画ページ用）
  lib/data.js        app/ のデータ（TypeScript）を監査ツールから読む共通ローダ
  cli.js             コマンドライン（fetch / batch / search / links）
  tests/             回帰テスト。上記2件の誤判定を再現テストにしている
  ledger/build.js    監査台帳 ledger.json を生成・更新
  ledger/status.js   監査の進捗を表示
  ledger/ledger.json 監査台帳（生成物。findings から再生成できる）
  findings/*.json    監査の根拠記録（手で書く。これが一次記録）
  cache/             取得した生HTML・描画結果（.gitignore 済み。コミットしない）
```

## 禁止事項（コードで守る）

`lib/extract.js` は次を行いません。変更する場合も行わないでください。

1. `img` の alt 属性をタグごと捨てる
2. 先頭N行で打ち切る／行数を制限する
3. 文字コードを utf-8 と決めつける（Shift_JIS・EUC-JPのページがある）

呼び出し側も、`head` などで途中を切った出力を根拠に「記載なし」と判定してはいけません。
検索は `search()` を使い、一致行は全件返します。

## 使い方

```bash
# 回帰テスト（抽出バグが再発していないか）
node audit/tests/extract.test.js

# 1ページ取得して該当箇所を見る（2回目以降はキャッシュから）
node audit/cli.js fetch https://www.lawson.co.jp/ponta/ 10日 20日 エントリー

# キャッシュ済み本文を再取得せずに検索
node audit/cli.js search https://www.lawson.co.jp/ponta/ 16時 ポイント

# ページ内のリンク一覧（公式の下位ページ・発行元ページを辿る）
node audit/cli.js links https://www.daiei.co.jp/sitemap/ okaidoku

# 複数URLをまとめて取得
node audit/cli.js batch /path/to/targets.json

# 監査台帳の生成・更新と進捗表示
node audit/ledger/build.js
node audit/ledger/status.js
node audit/ledger/status.js --kind benefit --status 未確認
```

JS描画ページは `lib/render.js` の `renderAll()` を使います（西友のカレンダー、ニューデイズの決済ページなど）。

## 記録の役割分担（二重管理しない）

| ファイル | 役割 | 誰が書くか |
|---|---|---|
| `app/data.ts` | 公開する掲載データ。**唯一の正** | 承認を得た更新作業 |
| `app/dataMemos.ts` | 運営用メモ。公開画面に出さない要確認事項 | 既存の運用どおり |
| `app/design/store-detail/verification-records.json` | **本番表示の承認記録**。`displayApproval` が揃った特典だけが読者に「確認済み」と表示される | 承認を得た更新作業のみ |
| `audit/findings/*.json` | **監査の根拠記録**（一次記録）。公式URL・引用・判定・修正案 | 監査作業 |
| `audit/ledger/ledger.json` | 監査状態の一覧（生成物） | `build.js` が生成 |

- 台帳は掲載内容を複製しません。掲載内容は `app/data.ts` を読み、台帳は**監査状態だけ**を持ちます。
- 掲載内容が変わったかどうかは既存の `candidateSignature` のハッシュで判定します。
  変わっていれば `dataChangedSinceAudit: true` が立ち、再確認対象に戻ります。
- **ページを取得できたことは `displayApproval` を付ける理由になりません。** 監査台帳に何を書いても本番表示は変わりません。

## 判定の4分類

| 判定 | 意味 |
|---|---|
| 一致 | 公式根拠と掲載データが合致する |
| 不一致 | 公式根拠と掲載データが明確に矛盾する |
| 一部確認 | 一部の条件だけ公式で確認できた |
| 未確認 | 判断できる公式根拠を取得できていない |

**「公式ページに記載がない」「抽出で見つからない」だけで不一致・終了と判定してはいけません。**
取得できなかった場合は `fetchFailure` に理由と代替確認ルートを書き、`未確認` のままにします。

## 公式情報が取れないときの探索順

1. 公式の特典紹介ページ
2. 公式FAQ・利用条件・キャンペーン規約
3. 同じ運営会社の別の公式ページ（例：イオン本体が403でも、ダイエーの `/okaidoku/` で同一プログラムの条件が取れた）
4. カード発行元・決済サービス提供元の公式案内（例：TOHOシネマズ → セゾンカード公式）
5. 公式PDF・公式画像・公式のお知らせ
6. 現行ページからリンクされている関連公式資料（`cli.js links` で辿る）
7. それでも取れない場合は、人間がブラウザで確認すべき項目として `fetchFailure.alternativeRoute` に具体的に書く

アクセス制限の回避はしません。403・503は事実として記録します。
検索結果の抜粋や第三者サイトだけで条件を確定させてはいけません。

## 週次更新の手順（想定）

```bash
node audit/tests/extract.test.js      # 1. 抽出処理が壊れていないか
node audit/ledger/build.js            # 2. 掲載データの変更を台帳に反映
node audit/ledger/status.js           # 3. 未確認・再確認が必要な項目を確認
# 4. 対象を調査（cli.js batch / render.js）し、audit/findings/ に根拠を追記
node audit/ledger/build.js            # 5. 台帳を更新
npm run check:data && node scripts/test-store-detail.cjs && node scripts/rank-check.js && npm run build && node scripts/check-site.js
# 6. 掲載データの修正とpushは、根拠と検証結果を提示して承認を得てから
```
