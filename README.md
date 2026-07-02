# TOI MEMO

`TOI MEMO` は、HTML/CSS/JavaScriptだけで動く個人用メモアプリです。サーバー、ログイン、外部API、データベースは使わず、メモはブラウザの `localStorage` に保存されます。

## ファイル構成

```txt
index.html
style.css
script.js
README.md
```

- `index.html`: 画面の構造
- `style.css`: 見た目、ダークモード、スマホ対応
- `script.js`: メモの保存、検索、並び替え、インポート/エクスポート
- `README.md`: 使い方と公開手順

## 使い方

1. `index.html` をブラウザで開きます。
2. `新規メモ` を押すと空のメモが作られます。
3. タイトル、本文、カテゴリ、タグ、重要度、ピン留め、お気に入りを編集します。
4. 入力内容は自動保存されます。
5. 検索欄に文字を入力すると、タイトル、本文、タグ、カテゴリからリアルタイムで絞り込まれます。
6. カテゴリボタンで表示するメモを切り替えられます。
7. 並び替えから、更新日時、作成日時、重要度、お気に入り、ピン留めの優先順を選べます。
8. `Export` でJSONを書き出し、`Import` でJSONを読み込めます。
9. `Light` / `Dark` で表示テーマを切り替えられます。

## データ保存について

メモはこのキーで `localStorage` に保存されます。

```txt
toiMemo.notes
toiMemo.theme
toiMemo.seeded
```

同じブラウザ、同じURLで開くと保存したメモが読み込まれます。ブラウザのサイトデータを削除するとメモも消えるため、大事なメモは定期的に `Export` してください。

## JSONエクスポート/インポート

`Export` で以下のようなJSONを書き出します。

```json
{
  "app": "TOI MEMO",
  "version": 1,
  "exportedAt": "2026-07-02T10:00:00.000Z",
  "notes": []
}
```

`Import` は、上の形式またはメモ配列そのものを読み込めます。インポート時は現在のメモを置き換えるため、必要なら先にエクスポートしてください。

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作ります。
2. `index.html`、`style.css`、`script.js`、`README.md` をリポジトリ直下にアップロードします。
3. リポジトリの `Settings` を開きます。
4. 左メニューの `Pages` を開きます。
5. `Build and deployment` の `Source` で `Deploy from a branch` を選びます。
6. `Branch` を `main`、フォルダを `/root` にして保存します。
7. 表示されたURLにアクセスすると `TOI MEMO` が開きます。

## 改造しやすいポイント

カテゴリを増やしたい場合は、`script.js` の `CATEGORIES` を編集します。

```js
const CATEGORIES = ["全部", "アイデア", "就活", "授業", "バンド", "創作", "ゲーム", "日記", "その他"];
```

重要度を変えたい場合は、`PRIORITIES` と `PRIORITY_SCORE` を編集します。

```js
const PRIORITIES = ["低", "中", "高"];
const PRIORITY_SCORE = { "高": 3, "中": 2, "低": 1 };
```

初回サンプルメモを変えたい場合は、`createSampleNotes()` の `sampleData` を編集します。

見た目を変えたい場合は、`style.css` の `:root` と `body[data-theme="light"]` にあるCSS変数を編集します。

```css
:root {
  --bg: #101010;
  --surface: #171717;
  --text: #f5f5f5;
}
```

PWA化したい場合は、次のファイルを追加する構成にすると進めやすいです。

```txt
manifest.json
sw.js
icons/
```

その場合は `index.html` に `manifest.json` へのリンクを追加し、`script.js` の最後でService Workerを登録します。

## メモのデータ構造

各メモは次の形で管理しています。

```js
{
  id: "unique-id",
  title: "タイトル",
  body: "本文",
  category: "就活",
  tags: ["SIer", "面接"],
  priority: "中",
  pinned: false,
  favorite: true,
  createdAt: "2026-07-02T10:00:00.000Z",
  updatedAt: "2026-07-02T10:15:00.000Z"
}
```

## 注意

このアプリは個人用の軽いメモアプリです。ログインや同期機能はありません。複数端末で同じメモを共有したい場合は、JSONエクスポート/インポートを使ってください。
