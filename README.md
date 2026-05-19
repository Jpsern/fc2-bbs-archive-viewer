# FC2掲示板アーカイブビューア

FC2掲示板エクスポートtxtを解析してJSON化し、静的Webで閲覧するためのプロジェクトです。

現状はフェーズ4まで完了しています。
- 変換CLI（`npm run convert`）
- `public/data/threads.json` 生成
- パーサーのユニットテスト
- フロント側の最小データ読み込み層
- スレッド一覧画面（表示項目・日付ソート）
- スレッド詳細画面への遷移
- キーワード検索（件名・投稿者・本文、部分一致・大文字小文字無視）
- 詳細メタ情報の展開表示

## セットアップ

1. Node.js 22系以上を用意
2. 依存関係をインストール

```bash
npm install
```

## npm scripts

- `npm run convert`: `input/*.txt` を解析し `public/data/threads.json` を生成
- `npm run dev`: Vite 開発サーバー起動
- `npm run build`: TypeScript型チェック + 本番ビルド
- `npm run lint`: ESLint 実行
- `npm run test`: パーサーのユニットテスト実行
- `npm run preview`: ビルド結果のローカル確認

## ディレクトリ構成

```text
.
├── docs/
│   └── spec.md
├── input/
│   └── .gitkeep
├── public/
│   └── data/
│       ├── .gitkeep
│       ├── parse-errors.json
│       └── threads.json
├── scripts/
│   ├── parser/
│   │   ├── __tests__/
│   │   ├── convert.ts
│   │   └── parser.ts
│   └── shared/
│       └── domain.ts
└── src/
    ├── app/
    ├── components/
    ├── features/
    │   ├── search/
    │   ├── thread-detail/
    │   └── thread-list/
    ├── hooks/
    ├── lib/
    │   └── loadThreads.ts
    ├── styles/
    └── types/
        └── domain.ts
```

## 開発方針

- 仕様の一次情報は `docs/spec.md` とし、実装は仕様準拠で進める
- 変換処理（parser）とWebアプリを責務分離する
- TypeScript strict mode を有効化する
- 例外やパースエラー発生時も可能な限り処理継続する
- any型を極力使わず、テスト可能な構造を優先する
