# 家系図 クラウド保存・ログイン・家族共有 セットアップ手順

このフォルダ（`5_prototype_v2`）に、Supabase を使った **ログイン・クラウド保存・家族共有** を追加しました。
ビルド不要のバニラ JS のままです（CDN で supabase-js を読み込みます）。

> Supabase を設定しなくても、アプリは今まで通り「お試しモード（この端末の localStorage に保存）」で動きます。
> クラウド保存・ログイン・共有を使うときだけ、以下の設定をしてください。

---

## 1. Supabase プロジェクトを作る

1. <https://supabase.com> でアカウント作成 → **New project**（無料枠でOK）。
2. プロジェクトができたら、左メニュー **SQL Editor** を開く。
3. このフォルダの `supabase/schema.sql` の中身を全部コピーして貼り付け、**Run**。
   - `family_trees` / `tree_shares` テーブルと、RLS（行レベルセキュリティ）ポリシーが作られます。

## 2. メールログイン（マジックリンク）を有効化

1. 左メニュー **Authentication → Providers → Email** を開く。
2. **Email** が有効になっていることを確認（標準で有効）。
3. **Authentication → URL Configuration** の **Redirect URLs** に、アプリを開く URL を登録：
   - ローカル確認用：`http://localhost:3000`（後述のローカルサーバのポートに合わせる）
   - 本番用：Vercel の URL（例：`https://trust-design-navi.vercel.app`）
   - ※ ここに登録した URL でないと、メールのリンクを押してもログインが完了しません（つまずきポイント）。

## 3. 接続情報をアプリに設定

1. 左メニュー **Project Settings → API** を開く。
2. **Project URL** と **anon public** キーをコピー。
3. このフォルダの `supabase-config.js` を開き、2か所を書き換える：

   ```js
   export const SUPABASE_URL      = 'https://xxxx.supabase.co';   // ← Project URL
   export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';              // ← anon public キー
   ```

   - `anon` キーは公開してよいキーです（GitHub に上げてもOK）。実データは RLS が守ります。

---

## 4. ローカルで動作確認

`file://` で直接開くとマジックリンクのリダイレクトが不安定なので、簡易サーバ経由で開きます。

```bash
cd 5_prototype_v2
npx serve -l 3000      # または: python -m http.server 3000
```

ブラウザで `http://localhost:3000` を開く（手順2の Redirect URLs に同じ URL を登録しておく）。

### 確認したいこと
1. **未ログイン**：家系図を作る → リロードしても残る（localStorage、従来動作）。
2. ヘッダーの **ログイン** → メール入力 → 届いたリンクを押す → ログイン状態に。
3. 初回ログイン時、ローカルに家系図があれば「アカウントに引き継ぐ？」と聞かれる → はい でクラウド保存。
4. 別ブラウザ／シークレットウィンドウで同じメールでログイン → 同じ家系図が見える（＝クラウド保存できている）。
5. **共有パネル**で家族のメールを招待 → その家族が同じメールでログインし、「共有された家系図」タブから **閲覧のみ** できる（編集ボタンが出ない）。
6. **ログアウト** → 他人の端末から中身が見えないこと。

---

## 5. Vercel へデプロイ

- このフォルダは静的サイトなので、そのまま Vercel にデプロイできます（フレームワーク設定 = Other / Static）。
- デプロイ後の本番 URL を、必ず Supabase の **Redirect URLs**（手順2）に追加してください。
- リポジトリ（`Rucola-mi/trust-design-navi`, main=v2）へは、ローカルで動作確認できてから反映するのがおすすめです。

---

## 仕組みの概要

| ファイル | 役割 |
|---|---|
| `supabase-config.js` | 接続情報＋ supabase クライアント生成。未設定なら自動で「お試しモード」 |
| `auth.js` | ログイン／ログアウト／セッション監視、ヘッダー・共有UIの司令塔。`window.TDN` を公開 |
| `db.js` | クラウドの読み書き、localStorage→クラウド移行、招待・共有・閲覧 |
| `family.js` | （改修）保存先をログイン状態で切替。共有閲覧時は読み取り専用 |
| `supabase/schema.sql` | DB テーブルと RLS ポリシー |

- **データ保存形**：1家系図 = 1行（`family_trees.data` に `{persons, rootId}` を JSONB で丸ごと）。続柄計算・レイアウト・印刷はこれまで通りブラウザ側で処理。
- **共有**：`tree_shares` に招待相手のメールを登録。RLS により「自分のもの＋自分宛に共有されたものだけ」アクセス可。共有相手は閲覧のみ（編集はオーナーだけ）。
