// ============================================================
// 家系図のクラウド保存・共有（Supabase）
// ・family.js（クラシックスクリプト）の familyState / familyApplyData /
//   familyRender を window 経由で使う。
// ・状態は window.TDN.state（auth.js が用意）で共有する。
//   { user, currentTreeId, mode:'own'|'shared', readOnly }
// ============================================================

import { supabase } from './supabase-config.js';

const LOCAL_KEY = 'tdn_family_v1';            // family.js と同じキー
const MIGRATED_FLAG = 'tdn_migrated_v1';      // 移行を一度尋ねたら立てる

// 現在の familyState を {persons, rootId} で取り出す
function snapshot() {
  return {
    persons: window.familyState ? window.familyState.persons : [],
    rootId:  window.familyState ? window.familyState.rootId  : null
  };
}

// data(JSONB) を画面へ反映
function applyData(data, { readOnly }) {
  const persons = data && Array.isArray(data.persons) ? data.persons : [];
  const rootId  = data && data.rootId ? data.rootId : (persons[0] && persons[0].id) || null;
  window.familyApplyData(persons, rootId, { readOnly });
}

// ---------- 自分の家系図を開く（無ければ作る） ----------
export async function openOwnTree() {
  const user = window.TDN.state.user;
  if (!user) return;

  // 自分の家系図を1件取得（最近更新したもの）
  let { data: trees, error } = await supabase
    .from('family_trees')
    .select('id, data')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) { console.error('ツリー取得失敗:', error); return; }

  let tree = trees && trees[0];

  // 無ければ新規作成
  if (!tree) {
    const ins = await supabase
      .from('family_trees')
      .insert({ owner_id: user.id, data: { persons: [], rootId: null } })
      .select('id, data')
      .single();
    if (ins.error) { console.error('ツリー作成失敗:', ins.error); return; }
    tree = ins.data;
  }

  window.TDN.state.currentTreeId = tree.id;
  window.TDN.state.mode = 'own';
  window.TDN.state.readOnly = false;

  const cloudPersons = tree.data && Array.isArray(tree.data.persons) ? tree.data.persons : [];

  // クラウドが空で、この端末の localStorage にデータがあれば「引き継ぎ」を提案
  if (cloudPersons.length === 0 && !localStorage.getItem(MIGRATED_FLAG)) {
    const migrated = await maybeMigrateLocal();
    if (migrated) return;   // 移行時に apply 済み
  }

  applyData(tree.data, { readOnly: false });
}

// ---------- localStorage → クラウド 移行 ----------
async function maybeMigrateLocal() {
  let local = null;
  try { local = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'); } catch (e) {}
  const persons = local && Array.isArray(local.persons) ? local.persons : [];
  if (persons.length === 0) return false;

  const ok = confirm(
    'この端末に保存されている家系図（' + persons.length + '人）が見つかりました。\n' +
    'ログイン中のアカウントに引き継いで、クラウドに保存しますか？'
  );
  localStorage.setItem(MIGRATED_FLAG, '1');   // 尋ねたら以後は出さない
  if (!ok) return false;

  applyData({ persons, rootId: local.rootId }, { readOnly: false });
  await saveCurrentTreeNow();
  return true;
}

// ---------- 保存（デバウンス付き） ----------
let _saveTimer = null;
export function saveCurrentTree() {
  if (window.TDN.state.mode !== 'own' || !window.TDN.state.currentTreeId) return;
  clearTimeout(_saveTimer);
  window.TDN.setSaveState && window.TDN.setSaveState('保存中…');
  _saveTimer = setTimeout(saveCurrentTreeNow, 600);
}

export async function saveCurrentTreeNow() {
  const id = window.TDN.state.currentTreeId;
  if (!id) return;
  const { error } = await supabase
    .from('family_trees')
    .update({ data: snapshot() })
    .eq('id', id);
  if (error) {
    console.error('保存失敗:', error);
    window.TDN.setSaveState && window.TDN.setSaveState('保存に失敗');
  } else {
    window.TDN.setSaveState && window.TDN.setSaveState('クラウドに保存済み ✓');
  }
}

// ---------- 共有（招待・一覧・解除） ----------
export async function inviteToShare(email) {
  const id = window.TDN.state.currentTreeId;
  if (!id) return { error: 'ツリーがありません' };
  const clean = String(email || '').trim().toLowerCase();
  if (!clean || !clean.includes('@')) return { error: 'メールアドレスを正しく入力してください' };
  if (clean === (window.TDN.state.user.email || '').toLowerCase())
    return { error: '自分自身は招待できません' };

  const { error } = await supabase
    .from('tree_shares')
    .insert({ tree_id: id, shared_email: clean });
  if (error) {
    if (error.code === '23505') return { error: 'この方はすでに招待済みです' };
    console.error('招待失敗:', error);
    return { error: '招待に失敗しました' };
  }
  return { ok: true };
}

export async function listShares() {
  const id = window.TDN.state.currentTreeId;
  if (!id) return [];
  const { data, error } = await supabase
    .from('tree_shares')
    .select('id, shared_email, created_at')
    .eq('tree_id', id)
    .order('created_at', { ascending: true });
  if (error) { console.error('共有一覧失敗:', error); return []; }
  return data || [];
}

export async function removeShare(shareId) {
  const { error } = await supabase.from('tree_shares').delete().eq('id', shareId);
  if (error) console.error('共有解除失敗:', error);
}

// ---------- 自分に共有されたツリー ----------
export async function listSharedWithMe() {
  const email = (window.TDN.state.user.email || '').toLowerCase();
  // 自分宛の共有レコード → tree_id を集める
  const { data: shares, error } = await supabase
    .from('tree_shares')
    .select('tree_id')
    .eq('shared_email', email);
  if (error) { console.error('共有受信一覧失敗:', error); return []; }
  const ids = (shares || []).map(s => s.tree_id);
  if (ids.length === 0) return [];

  // 自分がオーナーのものは除く（自分のツリーは別タブで見る）
  const { data: trees, error: e2 } = await supabase
    .from('family_trees')
    .select('id, title, owner_id, updated_at')
    .in('id', ids)
    .neq('owner_id', window.TDN.state.user.id);
  if (e2) { console.error('共有ツリー取得失敗:', e2); return []; }
  return trees || [];
}

// ---------- 共有されたツリーを閲覧（読み取り専用） ----------
export async function openSharedTree(treeId) {
  const { data, error } = await supabase
    .from('family_trees')
    .select('id, data, title')
    .eq('id', treeId)
    .single();
  if (error) { console.error('共有ツリー閲覧失敗:', error); alert('この家系図を開けませんでした。'); return; }

  window.TDN.state.currentTreeId = data.id;
  window.TDN.state.mode = 'shared';
  window.TDN.state.readOnly = true;
  applyData(data.data, { readOnly: true });
}
