# FC2掲示板アーカイブビューア 仕様書

最終更新: 2026-05-27

この仕様書は Codex CLI による実装の基準とする。
実装と差異が出た場合は README ではなく本仕様書を優先する。

## 1. 概要

### 1.1 アプリ名

FC2掲示板アーカイブビューア

### 1.2 目的

FC2掲示板からエクスポートしたtxtファイルを解析し、ブラウザ上で閲覧できる形に変換・表示する。

過去ログを静的WEBサイトとして保存し、ローカル環境または静的ホスティング環境で閲覧可能にする。

### 1.3 想定ユーザー

* 開発者本人のみ
* 不特定多数への公開は想定しない

### 1.4 動作環境

* ローカルPC
* 静的ホスティング環境

  * GitHub Pages
  * Cloudflare Pages
  * Netlify
  * nginx配信
  * その他静的配信環境

---

# 2. システム構成

## 2.1 アーキテクチャ

```text
FC2エクスポートtxt
↓
変換スクリプト
↓
JSON生成
↓
静的WEBアプリ
↓
ブラウザ閲覧
```

## 2.2 構成要素

### 変換スクリプト

役割：

* txtファイル解析
* スレッド構築
* JSON生成
* エラーレポート出力

### WEBアプリ

役割：

* スレッド一覧表示
* スレッド詳細表示
* 検索
* ソート

---

# 3. 入力ファイル仕様

## 3.1 入力形式

* FC2掲示板エクスポートtxt
* UTF-8想定
* 複数ファイル対応

## 3.2 入力配置

```text
input/*.txt
```

## 3.3 投稿フォーマット

```text
POSTED BY:
SUBJECT:
EMAIL:
SITE:
DATE:
USER AGENT:
IP:
ICON:
COLOR:
AUTHORIZED:

本文
```

返信投稿の場合：

```text
-----
REPLY:
POSTED BY:
...
```

---

# 4. パース仕様

## 4.1 投稿開始判定

以下を投稿開始として扱う。

### 親投稿

```text
POSTED BY:
```

### 返信投稿

```text
REPLY:
POSTED BY:
```

## 4.2 スレッド判定ルール

* `REPLY:` が直前に存在しない投稿は親投稿
* `REPLY:` が直前に存在する投稿は返信
* 返信は直前の親投稿スレッドに紐づける
* txtファイルをまたいだ返信継続は考慮しない

## 4.3 本文判定

* メタ情報終了後の空行以降を本文とする
* 本文中の改行は保持する

## 4.4 パースエラー

以下はエラーとして記録する。

* 必須項目欠落
* 日付解析失敗
* スレッド構造不整合

エラー発生時も可能な限り処理継続する。

---

# 5. データ構造

## 5.1 Thread

```ts
type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  replyCount: number;
  posts: Post[];
};
```

## 5.2 Post

```ts
type Post = {
  id: string;
  type: "parent" | "reply";
  author: string;
  subject: string;
  email: string;
  site: string;
  date: string;
  userAgent: string;
  ip: string;
  icon: string;
  color: string;
  authorized: boolean;
  body: string;
};
```

---

# 6. JSON出力仕様

## 6.1 出力先

```text
public/data/threads.json
```

## 6.2 出力形式

```json
[
  {
    "id": "...",
    "title": "...",
    "posts": []
  }
]
```

## 6.3 ソート

* 投稿日時昇順で格納
* スレッド一覧表示時は降順表示

---

# 7. 画面仕様

## 7.1 スレッド一覧画面

### 表示項目

* 件名
* 投稿者
* 投稿日時
* 最終更新日時
* 返信数
* 本文抜粋

### 機能

* キーワード検索
* 日付順ソート
* スレッド詳細遷移

## 7.2 スレッド詳細画面

### 表示項目

* 投稿者
* 投稿日時
* 件名
* 本文

### 返信表示

* 投稿日時順表示

### メタ情報

以下は初期非表示。

* EMAIL
* SITE
* USER AGENT
* IP
* ICON
* COLOR
* AUTHORIZED

「詳細を表示」で展開可能にする。

## 7.3 月別アーカイブ

### 目的

スレッドを月単位で絞り込み、過去ログを時系列でたどりやすくする。

### 判定基準

* スレッドの月は `createdAt` を基準とする
* 月キーは `YYYY-MM` 形式で扱う（例: `2026-05`）

### 機能

* スレッド一覧画面に月フィルタを設置する
* 月フィルタで指定した月に属するスレッドのみ表示する
* 既存のキーワード検索・日付ソート・ページングと併用できること
* 月フィルタ未指定時は全件表示する

### 表示順

* 月フィルタ候補は新しい月から順に表示する
* 月フィルタの表示形式は `yyyy年MM月` とする（例: `2026年05月`）
* スレッド表示順は既存ソート仕様に従う

---

# 8. 検索仕様

## 8.1 検索対象

* 件名
* 投稿者
* 本文

## 8.2 検索方式

* 部分一致
* 大文字小文字を区別しない

---

# 9. 非機能要件

## 9.1 パフォーマンス

* 数千スレッド程度で快適に動作すること

## 9.2 静的ホスティング対応

サーバーサイド処理不要で動作すること。

## 9.3 可搬性

Node.js環境でセットアップ可能であること。

---

# 10. 技術スタック

## 10.1 フロントエンド

* React
* TypeScript
* Vite

## 10.2 スタイリング

* Tailwind CSS

## 10.3 データ生成

* Node.js
* TypeScript

---

# 11. ディレクトリ構成

```text
fc2-bbs-archive-viewer/
├── input/
├── scripts/
├── public/
│   └── data/
├── src/
├── package.json
└── README.md
```

---

# 12. npm scripts

## 12.1 convert

```bash
npm run convert
```

txt解析とJSON生成を行う。

## 12.2 dev

```bash
npm run dev
```

ローカル開発サーバー起動。

## 12.3 build

```bash
npm run build
```

静的ファイル生成。

---

# 13. 今後の拡張候補

* 全文検索強化
* 投稿者別一覧
* 年別アーカイブ
* Markdownエクスポート
* ダークモード
* お気に入り機能
* スレッドURL共有
* Lunr.js等による高速検索
* IndexedDBキャッシュ

---

# 14. Codex向け実装ガイドライン

* TypeScript strict mode を有効化する
* ESLint を導入する
* React Hooks を利用する
* コンポーネントを適切に分割する
* パース処理をユニットテスト可能にする
* 例外発生時も可能な限り処理継続する
* any型を極力使用しない
* 可読性を優先する

---

# 15. 実装優先順位

1. パーサーCLI
2. JSON生成
3. 一覧画面
4. 詳細画面
5. 検索
