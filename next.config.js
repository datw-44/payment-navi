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
  // カスタムドメイン（oshiharai-navi.tiny-handy-works.com）の
  // ルート直下に公開するため、basePath/assetPrefixは設定しない。
};

module.exports = nextConfig;
