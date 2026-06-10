// ============================================================
// Supabase 接続設定
// ・ここに自分の Supabase プロジェクトの URL と anon(public) キーを入れる。
//   取得：Supabase ダッシュボード → Project Settings → API
// ・anon キーは「公開してよい」キー。実データは DB 側の RLS（行レベル
//   セキュリティ）で守るので、フロントに置いて GitHub に上げても問題ない。
// ・未設定（プレースホルダのまま）の場合、アプリはログイン無効の
//   「お試しモード（localStorage 保存）」として今まで通り動く。
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://xpppsyyoylqrszdpjhvy.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_aUJuKvpON-f5VPlR_5y6Bw_Xc2ndtcj';

// プレースホルダのままかどうか（未設定なら true）
export const isConfigured =
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR-ANON');

// 未設定でも import 側が落ちないよう、ダミー URL でクライアントは生成しておく
export const supabase = createClient(
  isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isConfigured ? SUPABASE_ANON_KEY : 'placeholder-key'
);
