# FC2掲示板アーカイブビューア

FC2掲示板エクスポートtxtを解析してJSON化し、静的Webで閲覧するためのプロジェクトです。

このフェーズ1では、基盤となるフロントエンド開発環境とディレクトリ構成のみを用意しています。
パーサー本体・一覧表示・詳細表示・検索機能は未実装です。

## セットアップ

1. Node.js 22系以上を用意
2. 依存関係をインストール

```bash
npm install
```

3. 開発サーバー起動

```bash
npm run dev
```

## npm scripts

- `npm run dev`: Vite 開発サーバー起動
- `npm run build`: TypeScript型チェック + 本番ビルド
- `npm run lint`: ESLint 実行
- `npm run preview`: ビルド結果のローカル確認

## ディレクトリ構成（フェーズ1）

```text
.
├── docs/
│   └── spec.md
├── input/
│   └── .gitkeep
├── public/
│   └── data/
│       └── .gitkeep
├── scripts/
│   ├── parser/
│   └── shared/
└── src/
    ├── app/
    ├── components/
    ├── features/
    │   ├── search/
    │   ├── thread-detail/
    │   └── thread-list/
    ├── hooks/
    ├── lib/
    ├── styles/
    └── types/
        └── domain.ts
```

## 開発方針

- 仕様の一次情報は `docs/spec.md` とし、実装は仕様準拠で進める
- 変換処理（parser）とWebアプリを責務分離する
- エラー発生時も処理継続できる設計を優先する
- フェーズごとに段階実装し、各フェーズで `lint` と `build` が通る状態を維持する
