# TOI MEMO

`TOI MEMO` は、HTML/CSS/JavaScriptだけで動く個人用メモアプリです。サーバー、ログイン、外部API、データベースは使わず、メモはブラウザの `localStorage` に保存されます。

## ファイル構成

```txt
index.html
style.css
script.js
manifest.json
service-worker.js
icon.svg
README.md
```

- `index.html`: 画面の構造
- `style.css`: 見た目、ダークモード、スマホ対応
- `script.js`: メモの保存、テンプレート作成、検索、並び替え、インポート/エクスポート
- `manifest.json`: PWAとしてホーム画面に追加するための設定
- `service-worker.js`: オフライン表示用のキャッシュ処理
- `icon.svg`: ホーム画面用の簡易アイコン
- `README.md`: 使い方と公開手順

## 使い方

1. `index.html` をブラウザで開きます。
2. `新規メモ` を押すとテンプレート選択画面が開きます。
3. 用途に近いテンプレートを選ぶと、タイトル、カテゴリ、タグ、本文が入ったメモが作られます。
4. タイトル、本文、カテゴリ、タグ、重要度、ピン留め、お気に入りを編集します。
5. 入力内容は自動保存されます。
6. 検索欄に文字を入力すると、タイトル、本文、タグ、カテゴリからリアルタイムで絞り込まれます。
7. カテゴリボタンで表示するメモを切り替えられます。
8. 並び替えから、更新日時、作成日時、重要度、お気に入り、ピン留めの優先順を選べます。
9. `Export` でJSONを書き出し、`Import` でJSONを読み込めます。
10. `Light` / `Dark` で表示テーマを切り替えられます。

## テンプレート機能

v1.5.0では、新規メモ作成時にテンプレートを選べるようになりました。PCではモーダル、スマホでは下から出るボトムシート風の選択画面として表示されます。

用意しているテンプレート:

- 通常メモ
- 就活企業メモ
- 授業レポートメモ
- バンドPAチェック
- 創作キャラ設定
- ゲーム案
- 日記

テンプレート選択画面は `×`、`キャンセル`、背景タップ、Escキーで閉じられます。選んだテンプレートは通常のメモとして保存されるため、作成後は自由に編集できます。

## データ保存について

メモはこのキーで `localStorage` に保存されます。

```txt
toiMemo.notes
toiMemo.theme
toiMemo.seeded
toiMemo.lastExportAt
```

## 設定とバックアップ

ヘッダーの `設定` を押すと、設定画面を開けます。

設定画面では次の情報を確認できます。

- `TOI MEMO v1.5.0`
- 現在のメモ数
- 最終バックアップ日時
- バックアップ推奨メッセージ

JSONエクスポートに成功すると、最終バックアップ日時が `toiMemo.lastExportAt` に保存されます。メモ本文の保存先である `toiMemo.notes` とは別のキーなので、既存メモのデータは変更されません。

メモが5件以上あり、まだ一度もエクスポートしていない場合は、バックアップ推奨メッセージが表示されます。最後のエクスポートから7日以上経っている場合も、同じくバックアップをおすすめします。

表示される文:

```txt
大事なメモを守るため、そろそろエクスポートしておくと安心です。
```

## PWA更新通知

PWA更新が検出されると、画面下に `新しいバージョンがあります。更新しますか？` と表示されます。

`更新する` を押すと、新しいService Workerに切り替えてページを再読み込みします。`後で` を押すと通知だけを閉じます。

## UI改善とPWAアイコン

v1.3.0では、黒・白・グレーを基調にしたデザインシステムを整理しました。CSS変数で色、余白、角丸、影、文字サイズを管理し、ボタン、カテゴリ、タグ、メモカード、設定画面、スマホの編集ボトムシートの見た目を統一しています。

PWAアイコンの `icon.svg` も更新しました。黒背景に白い紙アウトラインを描いた、TOI MEMOらしいミニマルなメモアイコンです。maskable iconとして使っても切れにくいよう、外周に余白を残しています。

## Adobe Fonts

Adobe Fontsはロゴ用に整理しています。`index.html` の `<head>` 内でkit `nyu7vux` を読み込み、`style.css` では次のfont-familyを確認済みです。

- `grappa-variable`
- `grappa-two-variable`
- `ads-route7`

現在は `TOI MEMO` ロゴだけAdobe Fontsを優先し、日本語UI、ボタン、本文、メモタイトル、入力欄はsystem-ui系に統一しています。Adobe Fontsが読み込めない場合でも、`system-ui, -apple-system, BlinkMacSystemFont, sans-serif` に落ちるため、表示や操作は継続できます。

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
2. `index.html`、`style.css`、`script.js`、`manifest.json`、`service-worker.js`、`icon.svg`、`README.md` をリポジトリ直下にアップロードします。
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

新規作成テンプレートを増やしたい場合は、`script.js` の `NOTE_TEMPLATES` に項目を追加します。`title`、`category`、`tags`、`body` を指定すると、テンプレート選択画面と作成処理に反映されます。

見た目を変えたい場合は、`style.css` の `:root` と `body[data-theme="light"]` にあるCSS変数を編集します。

```css
:root {
  --bg: #101010;
  --surface: #171717;
  --text: #f5f5f5;
}
```

## PWAとしてホーム画面に追加する

`TOI MEMO` はPWA対応済みです。GitHub Pagesなどの `https://` URLで開くと、ブラウザが `manifest.json` と `service-worker.js` を読み込みます。

Android Chromeの場合:

1. GitHub Pagesで公開した `TOI MEMO` をChromeで開きます。
2. 右上のメニューを開きます。
3. `アプリをインストール` または `ホーム画面に追加` を選びます。
4. 名前が `TOI MEMO` になっていることを確認して追加します。

iPhone Safariの場合:

1. GitHub Pagesで公開した `TOI MEMO` をSafariで開きます。
2. 共有ボタンを押します。
3. `ホーム画面に追加` を選びます。
4. 名前が `TOI MEMO` になっていることを確認して追加します。

オフライン時は、最低限 `index.html`、`style.css`、`script.js`、`manifest.json`、`icon.svg` がキャッシュから読み込まれます。メモ本体はこれまで通りブラウザの `localStorage` に保存されるため、PWA化しても保存方式は変わりません。

PWA関連ファイルは次の構成です。

```txt
manifest.json
service-worker.js
icon.svg
```

Service Workerは `file://` では動作しないため、ローカルで `index.html` を直接開いた場合は登録されません。GitHub Pagesで公開したURLでは登録されます。

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
