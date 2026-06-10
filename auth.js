// ============================================================
// 認証（Supabase）＋ クラウド連携の司令塔
// ・window.TDN にまとめて公開し、family.js（クラシックスクリプト）と
//   index.html のインライン onclick から使えるようにする。
// ・supabase-js は CDN(esm.sh) から読み込む（ビルド不要）。
// ============================================================

import { supabase, isConfigured } from './supabase-config.js';
import * as db from './db.js';

// ---------- 共有状態 ----------
const state = {
  user: null,
  currentTreeId: null,
  mode: 'own',        // 'own' | 'shared'
  readOnly: false
};

window.TDN = {
  state,
  db,
  configured: isConfigured,
  setSaveState: (t) => window.setSaveState && window.setSaveState(t),
  boot
};

// ---------- DOM ヘルパ ----------
const $ = (id) => document.getElementById(id);
const show = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };

// ============================================================
// ブート（family.js の DOMContentLoaded から呼ばれる）
// ============================================================
let _lastUserId = '__init__';

async function boot() {
  if (!isConfigured) {
    // Supabase 未設定 → お試しモード（localStorage 保存）で従来通り動かす
    updateHeaderUI(null);
    show($('family-auth-banner'), true);
    setBannerLoggedOut('（クラウド保存は未設定です。ログイン機能を使うには supabase-config.js を設定してください）');
    window.familyLoadLocal();
    window.familyRender();
    return;
  }

  // セッション変化を監視（初回 INITIAL_SESSION／マジックリンク後の SIGNED_IN／SIGNED_OUT）
  supabase.auth.onAuthStateChange((_event, session) => {
    refreshAfterAuth(session ? session.user : null);
  });
}

async function refreshAfterAuth(user) {
  const id = user ? user.id : null;
  state.user = user;
  updateHeaderUI(user);

  if (id === _lastUserId) return;   // 同一ユーザーの重複イベントは無視
  _lastUserId = id;

  if (user) {
    setActiveTab('own');
    show($('family-tabs'), true);
    show($('family-share-panel'), true);
    show($('shared-list-wrap'), false);
    setBannerLoggedIn(user.email);
    await db.openOwnTree();
    await refreshShareList();
    await refreshSharedCount();
  } else {
    state.mode = 'own';
    state.readOnly = false;
    state.currentTreeId = null;
    show($('family-tabs'), false);
    show($('family-share-panel'), false);
    show($('shared-list-wrap'), false);
    setBannerLoggedOut();
    window.familyLoadLocal();
    window.familyRender();
  }
}

// ============================================================
// ヘッダー / バナー UI
// ============================================================
function updateHeaderUI(user) {
  show($('btn-login'), !user);
  show($('auth-user-wrap'), !!user);
  if (user && $('auth-user-email')) $('auth-user-email').textContent = user.email || 'ログイン中';
}

function setBannerLoggedIn(email) {
  const b = $('family-auth-banner');
  if (!b) return;
  show(b, true);
  b.className = 'family-auth-banner is-in';
  b.innerHTML = '☁ <strong>' + escapeText(email) + '</strong> でログイン中。データはクラウドに保存され、家族に共有できます。';
}

function setBannerLoggedOut(extra) {
  const b = $('family-auth-banner');
  if (!b) return;
  show(b, true);
  b.className = 'family-auth-banner is-out';
  b.innerHTML =
    'ログインすると、どの端末からでも見られて、家族と共有できます。' +
    (extra ? '<br><span class="family-auth-note">' + escapeText(extra) + '</span>'
           : ' <button class="btn btn-primary btn-sm" onclick="tdnOpenLogin()">ログイン / 新規登録</button>');
}

// ============================================================
// ログイン（マジックリンク）
// ============================================================
window.tdnOpenLogin = function () {
  if (!isConfigured) { alert('クラウド保存は未設定です。supabase-config.js に URL と anon キーを設定してください。'); return; }
  $('login-status').textContent = '';
  $('login-email').value = '';
  show($('login-modal'), true);
  $('login-email').focus();
};
window.tdnCloseLogin = function () { show($('login-modal'), false); };

// パスワードでログイン
window.tdnSignIn = async function () {
  const email = $('login-email').value.trim();
  const password = $('login-password').value;
  if (!email || !email.includes('@')) { $('login-status').textContent = 'メールアドレスを正しく入力してください。'; return; }
  if (!password) { $('login-status').textContent = 'パスワードを入力してください。'; return; }
  $('login-status').textContent = 'ログイン中…';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(error);
    $('login-status').textContent = (error.message && error.message.includes('Invalid'))
      ? 'メールかパスワードが違います。（初めての方は「新規登録」を押してください）'
      : 'ログインに失敗しました：' + error.message;
  } else {
    $('login-status').textContent = '';
    tdnCloseLogin();   // onAuthStateChange(SIGNED_IN) が画面を切り替える
  }
};

// パスワードで新規登録
window.tdnSignUp = async function () {
  const email = $('login-email').value.trim();
  const password = $('login-password').value;
  if (!email || !email.includes('@')) { $('login-status').textContent = 'メールアドレスを正しく入力してください。'; return; }
  if (!password || password.length < 6) { $('login-status').textContent = 'パスワードは6文字以上にしてください。'; return; }
  $('login-status').textContent = '登録中…';
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error(error);
    $('login-status').textContent = (error.message && error.message.includes('already'))
      ? 'このメールは登録済みです。「ログイン」を押してください。'
      : '登録に失敗しました：' + error.message;
  } else if (data.session) {
    $('login-status').textContent = '';
    tdnCloseLogin();   // 即ログイン（メール確認OFFのとき）
  } else {
    $('login-status').textContent = '登録しました。メール確認が必要な設定の場合は、届いたメールのリンクを押してください。';
  }
};

window.tdnSendLink = async function () {
  const email = $('login-email').value.trim();
  if (!email || !email.includes('@')) { $('login-status').textContent = 'メールアドレスを正しく入力してください。'; return; }
  $('login-status').textContent = '送信中…';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href.split('#')[0] }
  });
  if (error) {
    console.error(error);
    $('login-status').textContent = '送信に失敗しました：' + error.message;
  } else {
    $('login-status').textContent = '✉ ' + email + ' にログイン用リンクを送りました。メールを開いてリンクを押してください。';
  }
};

window.tdnLogout = async function () {
  await supabase.auth.signOut();
  // onAuthStateChange(SIGNED_OUT) が refreshAfterAuth(null) を呼ぶ
};

// ============================================================
// タブ切替（自分の家系図 / 共有された家系図）
// ============================================================
function setActiveTab(which) {
  if ($('tab-own'))    $('tab-own').classList.toggle('active', which === 'own');
  if ($('tab-shared')) $('tab-shared').classList.toggle('active', which === 'shared');
}

window.tdnShowOwn = async function () {
  setActiveTab('own');
  show($('shared-list-wrap'), false);
  show($('family-share-panel'), true);
  setBannerLoggedIn(state.user.email);
  await db.openOwnTree();
  window.familyRender();
};

window.tdnShowSharedList = async function () {
  setActiveTab('shared');
  show($('family-share-panel'), false);
  show($('shared-list-wrap'), true);
  const list = $('shared-list');
  list.innerHTML = '<p class="shared-list-loading">読み込み中…</p>';
  const trees = await db.listSharedWithMe();
  if (trees.length === 0) {
    list.innerHTML = '<p class="shared-list-empty">あなたに共有された家系図はまだありません。</p>';
    return;
  }
  list.innerHTML = trees.map(t =>
    '<button class="shared-list-item" onclick="tdnOpenShared(\'' + t.id + '\')">' +
    '🌳 ' + escapeText(t.title || '家系図') + '<span class="shared-list-arrow">→</span></button>'
  ).join('');
};

window.tdnOpenShared = async function (treeId) {
  await db.openSharedTree(treeId);
  show($('shared-list-wrap'), false);
  window.familyRender();
};

// ============================================================
// 共有（招待・一覧・解除）
// ============================================================
window.tdnInvite = async function () {
  const email = $('share-email').value;
  $('share-status').textContent = '招待中…';
  const res = await db.inviteToShare(email);
  if (res.error) { $('share-status').textContent = '⚠ ' + res.error; return; }
  $('share-status').textContent = '✓ 招待しました。相手が同じメールでログインすると閲覧できます。';
  $('share-email').value = '';
  await refreshShareList();
};

window.tdnRemoveShare = async function (shareId) {
  await db.removeShare(shareId);
  await refreshShareList();
};

async function refreshShareList() {
  const wrap = $('share-list');
  if (!wrap) return;
  const shares = await db.listShares();
  if (shares.length === 0) {
    wrap.innerHTML = '<p class="share-list-empty">まだ誰にも共有していません。</p>';
    return;
  }
  wrap.innerHTML = shares.map(s =>
    '<div class="share-list-item"><span>' + escapeText(s.shared_email) + '</span>' +
    '<button class="share-remove" onclick="tdnRemoveShare(\'' + s.id + '\')">解除</button></div>'
  ).join('');
}

async function refreshSharedCount() {
  const trees = await db.listSharedWithMe();
  const tab = $('tab-shared');
  if (tab) tab.textContent = '共有された家系図' + (trees.length ? '（' + trees.length + '）' : '');
}

// ---------- ユーティリティ ----------
function escapeText(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
