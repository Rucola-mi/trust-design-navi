// =====================================================================
// network.js — 関係性マップ（ハブ＆ブランチ）
// ---------------------------------------------------------------------
// 設計方針（docs/BOOTH_SPRINT_0716.md §2）：
// ・家系図（family.js / family_trees）は法定相続に直結する「法的レイヤー」
//   として単独完結を維持し、一切変更しない。
// ・関係性マップは「意思を託す実務レイヤー」。中心=本人＋6ブランチ構成で、
//   「親族関係」ブランチのみ既存の家系図ビューへ遷移する。
// ・家族以外の人物データは family_trees に混ぜず、localStorage に別管理。
//   （将来 user_records type='network' へ移行予定。Phase 2）
// ・依存ゼロ（バニラJS）。family.js / app.js の後に読み込む。
// =====================================================================

const NETWORK_STORAGE_KEY = 'tdn_network_v1';

// ---------- デモリセット（ブース運用用） ----------
// index.html?reset=1 で開くと、お試しデータを全消去して初期状態に戻す。
(function demoReset() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') {
      ['tdn_family_v1', 'tdn_network_v1', 'tdn_diagnosis_history_v1', 'tdn_migrated_v1']
        .forEach(k => localStorage.removeItem(k));
      window.location.replace(window.location.pathname);
    }
  } catch (e) { /* no-op */ }
})();

// ---------- カテゴリ定義 ----------
// kin（親族関係）は特別扱い：人物を持たず、家系図ビューへの入口になる。
const NETWORK_CATEGORIES = [
  { id: 'kin',       label: '親族関係',   icon: '🌳', hint: '家系図で管理（相続の法的レイヤー）', isKin: true },
  { id: 'friend',    label: '友人',       icon: '☕', hint: '見守り・緊急連絡・日々のつながり' },
  { id: 'lawyer',    label: '士業',       icon: '⚖️', hint: '行政書士・FP・弁護士・司法書士など' },
  { id: 'medical',   label: '医療・介護', icon: '🩺', hint: 'かかりつけ医・ケアマネジャーなど' },
  { id: 'community', label: '地域・行政', icon: '🏘️', hint: '地域包括支援センター・社協・民生委員など' },
  { id: 'service',   label: 'サービス',   icon: '🤝', hint: '終身サポート事業者・見守りサービスなど' }
];

// ---------- State ----------
const networkState = {
  people: [],        // { id, name, category, role }
  editingId: null,   // 編集中の id（新規なら null）
  pendingCategory: null
};

// ---------- 保存・読込（localStorage） ----------
function networkLoad() {
  try {
    const raw = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    networkState.people = Array.isArray(data.people) ? data.people : [];
  } catch (e) {
    networkState.people = [];
  }
}

function networkSave() {
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, JSON.stringify({ people: networkState.people }));
  } catch (e) { /* no-op */ }
}

function networkUid() {
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- 家系図（法的レイヤー）のサマリー取得 ----------
// family.js には触らず、公開済みの familyState / localStorage から読むだけ。
function networkKinSummary() {
  let persons = [];
  if (window.familyState && Array.isArray(window.familyState.persons) && window.familyState.persons.length) {
    persons = window.familyState.persons;
  } else {
    try {
      const raw = localStorage.getItem('tdn_family_v1');
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.persons)) persons = data.persons;
      }
    } catch (e) { /* no-op */ }
  }
  const rootId = (window.familyState && window.familyState.rootId) || null;
  const root = persons.find(p => p.id === rootId) || persons[0] || null;
  return { count: persons.length, rootName: root ? root.name : null };
}

// ---------- ビュー表示 ----------
function showNetworkView() {
  networkLoad();
  networkRender();
  showView('network');
}

// ---------- 描画 ----------
function networkRender() {
  const hubName = document.getElementById('network-hub-name');
  const branches = document.getElementById('network-branches');
  if (!hubName || !branches) return;

  const kin = networkKinSummary();
  hubName.textContent = kin.rootName ? kin.rootName : '本人';

  branches.innerHTML = NETWORK_CATEGORIES.map(cat => {
    if (cat.isKin) {
      const countText = kin.count > 0
        ? `${kin.count}人を家系図で管理中`
        : 'まだ登録がありません';
      return `
        <div class="network-branch network-branch-kin" data-category="kin">
          <div class="network-branch-head">
            <span class="network-branch-icon">${cat.icon}</span>
            <span class="network-branch-label">${cat.label}</span>
            <span class="network-cat-dot cat-${cat.id}"></span>
          </div>
          <p class="network-branch-hint">${cat.hint}</p>
          <p class="network-kin-count">${countText}</p>
          <button class="btn btn-primary btn-sm" onclick="showView('family')">
            家系図を開く <span class="btn-arrow">→</span>
          </button>
          <p class="network-kin-note">相続に関わる親族関係は、家系図として単独で切り出せます。</p>
        </div>`;
    }
    const people = networkState.people.filter(p => p.category === cat.id);
    const chips = people.map(p => `
      <button class="network-chip cat-border-${cat.id}" onclick="networkOpenModal('${cat.id}', '${p.id}')" title="クリックで編集">
        <span class="network-chip-name">${networkEscape(p.name)}</span>
        ${p.role ? `<span class="network-chip-role">${networkEscape(p.role)}</span>` : ''}
      </button>`).join('');
    return `
      <div class="network-branch" data-category="${cat.id}">
        <div class="network-branch-head">
          <span class="network-branch-icon">${cat.icon}</span>
          <span class="network-branch-label">${cat.label}</span>
          <span class="network-cat-dot cat-${cat.id}"></span>
        </div>
        <p class="network-branch-hint">${cat.hint}</p>
        <div class="network-chip-list">${chips}</div>
        <button class="network-add-btn" onclick="networkOpenModal('${cat.id}')">＋ 追加する</button>
      </div>`;
  }).join('');
}

function networkEscape(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------- モーダル ----------
function networkOpenModal(categoryId, personId) {
  const modal = document.getElementById('network-modal');
  if (!modal) return;
  const cat = NETWORK_CATEGORIES.find(c => c.id === categoryId);
  networkState.pendingCategory = categoryId;
  networkState.editingId = personId || null;

  const person = personId ? networkState.people.find(p => p.id === personId) : null;
  document.getElementById('network-modal-title').textContent =
    (person ? '編集：' : '追加：') + (cat ? cat.label : '');
  document.getElementById('nf-name').value = person ? person.name : '';
  document.getElementById('nf-role').value = person ? (person.role || '') : '';
  document.getElementById('nf-delete').style.display = person ? '' : 'none';

  modal.style.display = 'block';
  document.getElementById('nf-name').focus();
}

function networkCloseModal() {
  const modal = document.getElementById('network-modal');
  if (modal) modal.style.display = 'none';
  networkState.editingId = null;
  networkState.pendingCategory = null;
}

function networkSavePerson() {
  const name = document.getElementById('nf-name').value.trim();
  const role = document.getElementById('nf-role').value.trim();
  if (!name) {
    document.getElementById('nf-name').focus();
    return;
  }
  if (networkState.editingId) {
    const p = networkState.people.find(x => x.id === networkState.editingId);
    if (p) { p.name = name; p.role = role; }
  } else {
    networkState.people.push({
      id: networkUid(),
      name,
      role,
      category: networkState.pendingCategory || 'friend'
    });
  }
  networkSave();
  networkCloseModal();
  networkRender();
}

function networkDeletePerson() {
  if (!networkState.editingId) return;
  networkState.people = networkState.people.filter(p => p.id !== networkState.editingId);
  networkSave();
  networkCloseModal();
  networkRender();
}

// ---------- グローバル公開 ----------
window.showNetworkView = showNetworkView;
window.networkOpenModal = networkOpenModal;
window.networkCloseModal = networkCloseModal;
window.networkSavePerson = networkSavePerson;
window.networkDeletePerson = networkDeletePerson;
