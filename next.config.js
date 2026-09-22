/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pagesへの静的書き出し用設定。
  output: "export",
  // GitHub Pagesは拡張子なしURLを "/store/xxx/index.html" として
  // 配信できないため、常に末尾スラッシュ付きURLにする。
  trailingSlash: true,
  images: {
    // next/image の最適化サーバーは静的書き出しでは使えないため無効化。
    unoptimized: true,
  },
  // プロジェクトサイト（https://datw-44.github.io/payment-navi/）として
  // 公開するため、リポジトリ名をサブパスに設定する。
  // これを設定しないと、公開後にJS/CSS/画像などが
  // ルート直下（存在しないパス）を探しにいって読み込めなくなる。
  basePath: "/payment-navi",
  assetPrefix: "/payment-navi/",
};

module.exports = nextConfig;
