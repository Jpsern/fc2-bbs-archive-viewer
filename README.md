# FC2掲示板アーカイブビューア

## アプリ概要

FC2掲示板のエクスポート txt ファイルを解析して JSON に変換し、静的Webアプリとして閲覧するためのツールです。

## セットアップ

1. Node.js 22 系以上を用意する
2. 依存関係をインストールする

```bash
npm install
```

## 実行方法

- 変換（`input/*.txt` -> `public/data/threads.json`）

```bash
npm run convert
```

- 開発サーバー起動

```bash
npm run dev
```

- 本番ビルド

```bash
npm run build
```

## 開発方法

- Lint 実行

```bash
npm run lint
```

- テスト実行

```bash
npm run test
```

- 仕様確認: `docs/spec.md` を正として実装する
- パーサー実装: `scripts/` 配下
- フロント実装: `src/` 配下
