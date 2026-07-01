# Phase 1 タスク分解 — Trust Design Navi v7.5

## 概要

このドキュメントは、[CODEBASE_AUDIT.md](CODEBASE_AUDIT.md) で策定したPhase 1（〜3ヶ月）改修プランを、具体的な実装タスクに分解したものである。タスクは Tier 1（必須）／Tier 2（高優先）／Tier 3（できれば）に分類し、推奨実行順序とともに記す。

判断軸は [MANIFESTO.md](MANIFESTO.md)、機能仕様は [VPC_v7.5.md](VPC_v7.5.md) を参照。

---

## 6テーマの統合マッピング

Phase 1の核となるテーマ統合方針：

| 新テーマ | 旧テーマ統合元 | 内容のポイント |
|---|---|---|
| 1. **医療と判断力の備え** | 旧2入院・手術 + 旧3最終段階医療 + 旧7判断力衰え・認知症 | ACP、医療同意、意思表示の事前準備 |
| 2. **介護・住まい・見守り** | 旧5介護住まい + 旧1見守り | 介護保険、住まいの段階、見守りサービス |
| 3. **資産とお金** | 旧4資産 | 棚卸し、見える化、FP活用 |
| 4. **家族以外の支援** | 旧6身元保証 + 旧8後見人 + 新12要素 | 任意後見、死後事務委任、身元保証サービス |
| 5. **死後の手続きと相続** | 旧9死後事務 + 旧10相続・遺言・寄付 | 葬儀、解約、遺言、寄付（遺贈） |
| 6. **デジタル資産・SNS・暗号資産** | 新11 | デジタル遺品、SNS死後対応、クリプト託し（教育のみ） |

各テーマが持つフィールド：

- `id` (1-6)
- `name`（テーマ名）
- `desc`（診断時の説明）
- `priorityHint`（優先テーマ表示時のヒント）
- `whatToKnow`（最初に知るとよいこと）
- `whereToLearn`（調べる入口）
- `beforeTalking`（**旧 `beforeFamily` から改名**：家族／友人／専門家／自分自身と話す前に考えておくこと）

---

## Tier 1：必須タスク

### Task 0：新6テーマのコンテンツ草稿執筆（前提作業）

**やること：**
- 6テーマそれぞれの `name` / `desc` / `priorityHint` / `whatToKnow` / `whereToLearn` / `beforeTalking` の文章を執筆
- マニフェスト底流テーマ（家族任せをやめる／2040年／専門家と賢く繋がる／世代間負担）を各テーマに織り込む
- 特にテーマ4「家族以外の支援」、テーマ6「デジタル資産」は全文新規執筆

**成果物：** docs内にテキストファイル or 直接 `app.js` の `THEMES` に流し込む

**検収：** 6テーマ揃う、文章のトーンがマニフェストと整合、各テーマで「家族あり前提」になっていない

**見積：** 8-10時間（コンテンツライティング）

---

### Task 1：app.js の THEMES データを新6テーマで再定義

**やること：**
- 既存の10要素 `THEMES` 配列を、新6要素に置換
- `beforeFamily` フィールドを `beforeTalking` に改名（または両立）
- 統合元の旧テーマ内容を合流させ、重複・矛盾を解消

**ファイル：** `app.js` (line 7-98)

**検収：** 診断画面で6テーマ進行する、優先テーマ表示が機能する、結果のリテラシーマップが6セル表示

**見積：** 2時間（コンテンツ反映、コード調整）

**依存：** Task 0

---

### Task 2：CHAT_SCENARIOS を新6テーマで書き直し

**やること：**
- `CHAT_SCENARIOS` オブジェクト（id 1〜10）を新6テーマ（id 1〜6）で書き直し
- 各テーマ：intro + 3 steps（bot質問 + 4選択肢）
- v7.5マニフェスト準拠：
  - 既婚前提・子あり前提の問いを避ける／分岐
  - 「家族／友人／専門家／自分自身」と選択肢を多角化
  - 「専門家と賢く繋がる」視点を選択肢に含める

**ファイル：** `app.js` (line 425-536)

**検収：** AIナビゲーター画面で6テーマすべてが3問完走する、未婚/子なしユーザーが違和感なく回答できる

**見積：** 6時間

**依存：** Task 1

---

### Task 3：index.html のテーマカード10→6に更新

**やること：**
- LP内の `themes-overview-grid` 配下の10カード（line 96-147）を6カードに置換
- 各カードの番号・名称・説明文を新6テーマに合わせる
- セクションタイトル・リード文の数字「10テーマ」も適宜更新

**ファイル：** `index.html` (line 84-163)

**検収：** LPに6カード表示、レスポンシブ崩れず、診断CTAから遷移できる

**見積：** 2時間

**依存：** Task 1

---

### Task 4：LP冒頭・About文言・Footerをv7.5マニフェスト準拠に更新

**やること：**
- Hero タグ・タイトル・サブタイトル（line 47-57）
- About / Message セクション（line 166-181）
- 3 Steps セクション（line 184-225）
- Notice / Footer の文言調整

**底流テーマ織り込み方針：**
- 直接スローガン化しない
- 「家族の有無に関わらず」「これからの安心は、自分でデザインする」をトーンに反映
- 「学ぶ・決める・託す」の枠は維持

**ファイル：** `index.html` (Heroセクション以下)

**検収：** マニフェストのトーンと整合、運動色を出さない、煽らない

**見積：** 2-3時間

**依存：** Task 1 完了後（テーマ名が固まる）

---

### Task 5：user_records テーブル追加＋RLS設計

**やること：**

```sql
create table if not exists user_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,        -- 'diagnosis' | 'digital_legacy' | 'sns_after' | 'crypto_memo' | 'koken_memo' 等
  title       text,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists idx_user_records_user_type
  on user_records(user_id, type, updated_at desc);

alter table user_records enable row level security;

create policy "owner full access" on user_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at トリガは既存の set_updated_at() を使い回せる
create trigger trg_user_records_updated
  before update on user_records
  for each row execute function set_updated_at();
```

**ファイル：** `supabase/schema.sql` に追記、Supabase ダッシュボードのSQL Editor で実行

**検収：** テーブル作成成功、RLS有効、本人のみ全操作可

**見積：** 1.5時間

**依存：** なし（独立進行可）

---

### Task 6：診断結果のクラウド保存機能

**やること：**
- `db.js` に追加：
  - `saveDiagnosis(answers, themeStates, priorityThemes)` — user_records に type='diagnosis' で保存
  - `listMyDiagnoses()` — 自分の診断履歴を取得
  - `getDiagnosis(recordId)` — 特定の診断を取得
- `app.js` の `finishDiagnosis()` 完了時に保存呼び出し（ログイン時のみ）
- 未ログイン時は localStorage に保存（key: `tdn_diagnosis_history_v1`）

**ファイル：** `db.js`, `app.js`

**検収：** ログイン後の診断結果が user_records に保存される、別端末からログインして履歴が見える

**見積：** 3-4時間

**依存：** Task 5

---

### Task 7：診断結果履歴ビュー（軽量版）

**やること：**
- 新ビュー `view-history` を index.html に追加
- ヘッダーナビに「履歴」リンク追加（ログイン時のみ表示）
- ビュー内：過去診断のリスト（日付＋優先テーマ表示）、クリックで該当結果を再表示
- Phase 2で「前回との変化グラフ」追加予定（今は不要）

**ファイル：** `index.html`, `app.js`

**検収：** ログイン状態で履歴ボタン表示、過去の診断を呼び出して見られる

**見積：** 3-4時間

**依存：** Task 6

---

## Tier 2：高優先タスク

### Task 8：関係性マップ拡張（カテゴリ追加）

**やること：**
- `family.js` の `newPerson()` ファクトリに `category` フィールド追加
- カテゴリ：`family`（家族） / `relative`（親族） / `friend`（友人） / `lawyer`（行政書士・FP・弁護士） / `medical`（医療・介護関係者） / `community`（地域・行政） / `service`（事業者）
- 人物追加モーダルにカテゴリ選択UIを追加（カテゴリで「家族系」「家族以外」を明確に分ける）
- カード表示：カテゴリ別のアイコンまたは色チップ
- 続柄（`computeRelations`）はカテゴリ=family/relative の場合のみ計算
- 代襲相続マーカーはカテゴリ=family/relative にのみ適用

**ファイル：** `family.js`, `index.html`（モーダル）, `style.css`（カード色分け）

**検収：** 家族以外の人物（士業、友人など）も追加・配置できる、カード上で見分けがつく、家系図の血族構造は維持される

**見積：** 8-10時間

**依存：** なし（独立進行可）

---

### Task 9：LP「読み物」セクション追加（構造解説コンテンツ枠）

**やること：**
- LP内に「読み物」セクション新設（10テーマ概要セクションの直後あたり）
- 記事カード 3枚スケルトン（タイトル・リード・著者・読了時間表示）
- クリックで個別記事ビュー（`view-reading-article`）へ遷移
- 個別記事ビュー：Markdown→HTML埋め込み or 直接HTML本文
- **記事1本目だけは本文も書く**（「2040年問題と単身世帯化」が最も無難で書きやすい）
- 記事2, 3はタイトル・リードのみ、本文「執筆中」プレースホルダー

**ファイル：** `index.html`, `style.css`, `app.js`（記事データ）

**検収：** LPに「読み物」セクション表示、3カード、1本目は読める

**見積：** 5-6時間（スケルトン4h + 1本執筆1-2h）

**依存：** なし

---

## Tier 3：できれば

### Task 10：診断の前提ヒアリング

**やること：**
- 診断開始前に「家族構成・性別役割への意識・親サポート状況」を3問だけヒアリング
- 結果を state に保存し、各テーマの設問の表現を微分岐
- 結果保存時に user_records にも前提情報を含める

**ファイル：** `app.js`, `index.html`

**検収：** 未婚/既婚/子なしで一部の設問・選択肢が変わる

**見積：** 4-5時間

**依存：** Task 1, 2, 5, 6

---

### Task 11：安心デザインカード PDF

**やること：**
- 診断結果＋関係性マップ＋優先テーマ＋連携先（士業・サービスメモ）を1枚にまとめたPDF出力
- 既存の `familyPrint()` のロジックを流用しつつ、別レイアウト（A4 縦 1枚）
- 「家族・士業共有用」のメッセージ・日付・本人名を含める

**ファイル：** `app.js`（新関数）, `style.css`（@media print 拡張）

**検収：** 印刷プレビューで A4 1枚に収まる、家族・士業に手渡せる体裁

**見積：** 4-5時間

**依存：** Task 6, 8

---

## 推奨実行順序

```
[Step 0] Task 0   コンテンツ草稿執筆（先にこれをやらないと進まない）
         │
[Step 1] Task 5   DB拡張             ← 独立進行可
[Step 2] Task 1   THEMES再定義       ─┐
         Task 2   CHAT_SCENARIOS    ─┤
         Task 3   テーマカード更新    ─┤  Step 1 と並行可
         Task 4   LP文言更新        ─┘
[Step 3] Task 6   診断結果保存
[Step 4] Task 7   履歴ビュー
[Step 5] Task 8   関係性マップ拡張   ─┐
         Task 9   読み物セクション   ─┘  並行可
[Step 6] Task 10  診断前提ヒアリング  （余裕あれば）
[Step 7] Task 11  安心デザインカード  （余裕あれば）
```

**合計見積：** Tier 1: 約25-30時間 ／ Tier 2: 約13-16時間 ／ Tier 3: 約8-10時間 ／ 全部：約46-56時間

---

## 着手前の準備チェック

- [ ] Task 0（コンテンツ草稿）に着手する時間を確保する
- [ ] Supabase ダッシュボードへのアクセスを確認（Task 5 で SQL 実行）
- [ ] Vercel デプロイ環境が稼働していることを確認
- [ ] 既存の `family_trees` データ（テストデータ含む）のバックアップ取得

---

## 改訂履歴

- 2026-06-30: 初版作成。テーマ統合方針（10→6）確定、12タスク分解。
