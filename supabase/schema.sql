-- ============================================================
-- Trust Design Navi — 家系図 クラウド保存スキーマ
-- Supabase の SQL Editor にこの内容を貼り付けて実行する。
-- ・family_trees … 1ユーザーが複数の家系図を持てる。本体は data(JSONB)。
-- ・tree_shares  … オーナーが「閲覧のみ」で招待した相手（メール）。
-- ・RLS で「自分のもの＋共有されたものだけ」アクセスできるように守る。
-- ============================================================

-- ---------- テーブル ----------
create table if not exists family_trees (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  title       text not null default '私の家系図',
  data        jsonb not null default '{"persons":[],"rootId":null}'::jsonb,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create table if not exists tree_shares (
  id           uuid primary key default gen_random_uuid(),
  tree_id      uuid not null references family_trees(id) on delete cascade,
  shared_email text not null,                       -- 招待した相手のメール（小文字で保存）
  created_at   timestamptz not null default now(),
  unique (tree_id, shared_email)
);

-- よく使う検索のためのインデックス
create index if not exists idx_family_trees_owner on family_trees(owner_id);
create index if not exists idx_tree_shares_email  on tree_shares(shared_email);
create index if not exists idx_tree_shares_tree   on tree_shares(tree_id);

-- updated_at を自動更新
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_family_trees_updated on family_trees;
create trigger trg_family_trees_updated
  before update on family_trees
  for each row execute function set_updated_at();

-- ---------- 行レベルセキュリティ (RLS) ----------
alter table family_trees enable row level security;
alter table tree_shares  enable row level security;

-- ★ 相互参照ポリシーによる「無限再帰(42P17)」を避けるためのヘルパ関数。
--   SECURITY DEFINER（テーブル所有者権限で実行）にすることで、関数内の
--   問い合わせには RLS がかからず、もう一方のテーブルのポリシーを
--   再帰的に呼び出さない。
create or replace function is_tree_owner(t_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from family_trees where id = t_id and owner_id = auth.uid()
  );
$$;

create or replace function is_tree_shared_with_me(t_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from tree_shares
    where tree_id = t_id
      and lower(shared_email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- オーナーは自分のツリーを全操作可（自テーブルの列だけ参照＝再帰なし）
drop policy if exists "owner full access" on family_trees;
create policy "owner full access" on family_trees
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- 共有された人は閲覧のみ（ヘルパ関数で判定＝再帰なし）
drop policy if exists "shared read only" on family_trees;
create policy "shared read only" on family_trees
  for select
  using (is_tree_shared_with_me(id));

-- shares はオーナーのみ管理（ヘルパ関数で判定＝再帰なし）
drop policy if exists "owner manage shares" on tree_shares;
create policy "owner manage shares" on tree_shares
  for all
  using (is_tree_owner(tree_id))
  with check (is_tree_owner(tree_id));

-- 招待された本人は、自分宛の共有レコードを参照できる（自テーブルの列だけ＝再帰なし）
drop policy if exists "invitee read own share" on tree_shares;
create policy "invitee read own share" on tree_shares
  for select
  using (lower(shared_email) = lower(auth.jwt() ->> 'email'));

-- ============================================================
-- user_records テーブル（v7.5 追加）
-- ・診断結果、デジタル遺品リスト、任意後見メモなど、ユーザー個人の
--   多様な記録を `type` で区別して1テーブルにまとめて保存する。
-- ・type 例：'diagnosis' | 'digital_legacy' | 'sns_after' |
--            'crypto_memo' | 'koken_memo' など（アプリ側で規約管理）
-- ・データ本体は data(JSONB) に格納。type ごとに構造は異なる。
-- ・本人のみアクセス可（RLS）。共有は Phase 2 以降で別途検討。
-- ============================================================

create table if not exists user_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- よく使う「自分の type 別記録を新しい順に」向けの複合インデックス
create index if not exists idx_user_records_user_type
  on user_records(user_id, type, updated_at desc);

-- updated_at 自動更新（既存の set_updated_at() を再利用）
drop trigger if exists trg_user_records_updated on user_records;
create trigger trg_user_records_updated
  before update on user_records
  for each row execute function set_updated_at();

-- RLS：本人のみ全操作可
alter table user_records enable row level security;

drop policy if exists "owner full access" on user_records;
create policy "owner full access" on user_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
