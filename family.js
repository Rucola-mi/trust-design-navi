// ============================================================
// Trust Design Navi — 家系図（Family Chart）MVP
// ・依存ゼロ（バニラJS）。データはブラウザ localStorage に保存。
// ・person のデータ構造は family-chart 互換の形にしてあり、
//   将来 Supabase の persons テーブルへそのまま移行できる。
// ============================================================

const FAMILY_STORAGE_KEY = 'tdn_family_v1';

// ---------- レイアウト定数 ----------
const CARD_W = 168;
const CARD_H = 96;
const H_GAP  = 44;   // 横の間隔
const V_GAP  = 96;   // 世代（行）の間隔
const PAD    = 32;   // キャンバス余白

// ---------- State ----------
const familyState = {
  persons: [],          // person の配列
  rootId: null,         // 中心人物（本人）の id
  editingId: null,      // 編集中の person id（新規なら null）
  pendingRelation: null,// {type:'spouse'|'child'|'father'|'mother', baseId} 親族追加時にセット
  readOnly: false       // 共有された家系図を閲覧中は true（編集不可）
};

// ログイン中か（クラウド保存を使うか）。auth.js が window.TDN を用意する。
function isCloudActive() {
  return !!(window.TDN && window.TDN.state && window.TDN.state.user);
}

// ---------- person ファクトリ ----------
function newPerson(over = {}) {
  return {
    id: 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
    name: '',
    gender: 'other',     // 'M' | 'F' | 'other'
    birthYear: null,
    deathYear: null,
    isDeceased: false,
    medicalNotes: '',
    adopted: false,              // 養子・養女として迎えられた人（親子線を縦二重線で表示）
    rels: { spouses: [], father: null, mother: null, children: [] },
    formerSpouses: [],           // 前妻・前夫の id（spouses とは別管理。線を点線で表示）
    ...over
  };
}

// ---------- 保存・読込 ----------
// localStorage からの読込（未ログイン時の「お試しモード」用）
function familyLoadLocal() {
  try {
    const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    familyState.persons = Array.isArray(data.persons) ? data.persons : [];
    familyState.rootId = data.rootId || (familyState.persons[0] && familyState.persons[0].id) || null;
    familyState.readOnly = false;
    normalizePersons();
  } catch (e) {
    console.warn('家系図データの読込に失敗:', e);
  }
}

// クラウドから渡されたデータを画面へ反映する（auth.js / db.js から呼ばれる）
function familyApplyData(persons, rootId, opts) {
  familyState.persons = Array.isArray(persons) ? persons : [];
  familyState.rootId = rootId || (familyState.persons[0] && familyState.persons[0].id) || null;
  familyState.readOnly = !!(opts && opts.readOnly);
  normalizePersons();
  familyRender();
}

function familySave() {
  // 共有された家系図を閲覧中は保存しない
  if (familyState.readOnly) return;

  // ログイン中はクラウドへ（auth.js / db.js が担当）
  if (isCloudActive()) {
    window.TDN.db.saveCurrentTree();
    return;
  }

  // 未ログインは従来通り localStorage に保存
  try {
    localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify({
      persons: familyState.persons,
      rootId: familyState.rootId,
      savedAt: new Date().toISOString()
    }));
    setSaveState('この端末に保存 ✓');
  } catch (e) {
    console.warn('家系図データの保存に失敗:', e);
    setSaveState('保存に失敗');
  }
}

function setSaveState(text) {
  const el = document.getElementById('family-save-state');
  if (el) el.textContent = text;
}

function getPerson(id) {
  return familyState.persons.find(p => p.id === id) || null;
}

// 旧データ（v4以前）には adopted / formerSpouses が無いので、読込時に補完する。
// これで描画・編集コードは常にフィールドが存在する前提で書ける（後方互換）。
function normalizePersons() {
  familyState.persons.forEach(p => {
    if (typeof p.adopted !== 'boolean') p.adopted = false;
    if (!Array.isArray(p.formerSpouses)) p.formerSpouses = [];
    if (!p.rels) p.rels = { spouses: [], father: null, mother: null, children: [] };
  });
}

// 代襲相続の見た目マーカー（描画のたびに再計算する一時データ）
let _daishuu = { ids: new Set(), edges: new Set() };

// 本人（被相続人）の相続人候補が先に亡くなっている場合、その子を「代襲」として拾う。
// ・第1順位：本人の子 → 亡くなっていれば その子（孫）が代襲
// ・第3順位：本人の兄弟姉妹 → 亡くなっていれば その子（甥姪）が代襲
// ※ あくまで構造上のマーカー。実際の相続人・割合を判定するものではない。
function computeDaishuu() {
  const ids = new Set();    // 代襲相続人になりうる人の id
  const edges = new Set();  // "親id>子id" … 代襲ラインを引く辺
  const root = getPerson(familyState.rootId);
  if (!root) return { ids, edges };

  const heirs = new Set();
  // 子
  root.rels.children.forEach(cid => heirs.add(cid));
  // 兄弟姉妹（本人の親の子のうち、本人以外）
  [root.rels.father, root.rels.mother].forEach(pid => {
    const par = getPerson(pid);
    if (par) par.rels.children.forEach(cid => { if (cid !== root.id) heirs.add(cid); });
  });

  heirs.forEach(hid => {
    const h = getPerson(hid);
    if (!h || !h.isDeceased) return;       // 相続人候補が存命なら代襲は起きない
    h.rels.children.forEach(cid => {
      if (!getPerson(cid)) return;
      ids.add(cid);
      edges.add(hid + '>' + cid);
    });
  });
  return { ids, edges };
}

// 続柄ラベル（本人から見た関係）。描画のたびに再計算する一時データ。
let _relations = {};

// 本人を基準に、各人物の続柄を算出する。
// 血族（祖先・子孫・兄弟姉妹・甥姪・おじおば・いとこ）＋配偶者＋一部の姻族をカバー。
// 不明・遠縁はラベルなし（誤ったラベルを出さない方針）。
function computeRelations() {
  const labels = {};
  const root = getPerson(familyState.rootId);
  if (!root) return labels;
  const RID = root.id;
  const byId = {};
  familyState.persons.forEach(p => (byId[p.id] = p));

  const parentsOf  = id => [byId[id].rels.father, byId[id].rels.mother].filter(x => x && byId[x]);
  const childrenOf = id => byId[id].rels.children.filter(x => byId[x]);
  const spousesOf  = id => byId[id].rels.spouses.filter(x => byId[x]);
  const g = (id, male, female, other) => byId[id].gender === 'M' ? male : byId[id].gender === 'F' ? female : other;

  // 先に呼ばれた続柄を優先（近い関係から確定させる）
  const set = (id, label) => {
    if (id && id !== RID && byId[id] && label && labels[id] === undefined) labels[id] = label;
  };

  // 配偶者（前妻・前夫は区別してラベルする）
  const formerOfRoot = new Set(root.formerSpouses || []);
  spousesOf(RID).forEach(s => set(s,
    formerOfRoot.has(s) ? g(s, '前夫', '前妻', '元配偶者') : g(s, '夫', '妻', '配偶者')));

  // 祖先（父母→祖父母→曽祖父母…）
  let level = [RID], depth = 0; const anc = {};
  while (level.length && depth < 5) {
    const next = [];
    level.forEach(id => parentsOf(id).forEach(pid => {
      if (pid !== RID && anc[pid] === undefined) { anc[pid] = depth + 1; next.push(pid); }
    }));
    level = next; depth++;
  }
  Object.entries(anc).forEach(([id, d]) => {
    set(id, d === 1 ? g(id, '父', '母', '親')
         : d === 2 ? g(id, '祖父', '祖母', '祖父母')
         : d === 3 ? g(id, '曽祖父', '曽祖母', '曽祖父母') : '先祖');
  });

  // 子孫（子→孫→曽孫…）
  let lev = [RID], dd = 0; const desc = {};
  while (lev.length && dd < 5) {
    const next = [];
    lev.forEach(id => childrenOf(id).forEach(cid => {
      if (cid !== RID && desc[cid] === undefined) { desc[cid] = dd + 1; next.push(cid); }
    }));
    lev = next; dd++;
  }
  Object.entries(desc).forEach(([id, d]) => {
    set(id, d === 1 ? g(id, '息子', '娘', '子') : d === 2 ? '孫' : d === 3 ? '曽孫' : '子孫');
  });

  // 兄弟姉妹（本人と親を共有）— 生年で年上／年下を判定
  const sibSet = new Set();
  parentsOf(RID).forEach(pid => childrenOf(pid).forEach(cid => { if (cid !== RID) sibSet.add(cid); }));
  sibSet.forEach(id => {
    const by = byId[id].birthYear, ry = root.birthYear;
    const elder = (by && ry) ? (by < ry ? true : by > ry ? false : null) : null;
    set(id, elder === true ? g(id, '兄', '姉', '兄姉')
          : elder === false ? g(id, '弟', '妹', '弟妹')
          : g(id, '兄弟', '姉妹', '兄弟姉妹'));
  });

  // 甥姪（兄弟姉妹の子）と、その子
  sibSet.forEach(sib => childrenOf(sib).forEach(cid => {
    set(cid, g(cid, '甥', '姪', '甥・姪'));
    childrenOf(cid).forEach(gid => set(gid, '甥孫・姪孫'));
  }));

  // おじ・おば（親の兄弟姉妹）と、いとこ
  const pibSet = new Set();
  parentsOf(RID).forEach(par => parentsOf(par).forEach(gp => childrenOf(gp).forEach(cid => {
    if (cid !== par && !parentsOf(RID).includes(cid)) pibSet.add(cid);
  })));
  pibSet.forEach(id => {
    set(id, g(id, 'おじ', 'おば', 'おじ・おば'));
    childrenOf(id).forEach(cid => set(cid, 'いとこ'));
  });

  // 姻族（配偶者の親＝義父母、子の配偶者＝婿・嫁）
  spousesOf(RID).forEach(sp => parentsOf(sp).forEach(pid => set(pid, g(pid, '義父', '義母', '義父母'))));
  childrenOf(RID).forEach(ch => spousesOf(ch).forEach(sid => set(sid, g(sid, '婿', '嫁', '子の配偶者'))));

  return labels;
}

// ============================================================
// レンダリング
// ============================================================
function familyRender() {
  const empty = document.getElementById('family-empty');
  const canvasWrap = document.getElementById('family-canvas-wrap');
  const toolbar = document.getElementById('family-toolbar');

  applyReadOnlyUI();

  if (familyState.persons.length === 0) {
    empty.style.display = '';
    canvasWrap.style.display = 'none';
    toolbar.style.visibility = 'hidden';
    return;
  }

  empty.style.display = 'none';
  canvasWrap.style.display = '';
  toolbar.style.visibility = 'visible';

  _daishuu = computeDaishuu();
  _relations = computeRelations();
  const layout = computeLayout();
  const canvas = document.getElementById('family-canvas');

  // 既存カード削除（SVGは残す）
  canvas.querySelectorAll('.fc-card').forEach(el => el.remove());

  // キャンバスサイズ確定
  canvas.style.width = layout.width + 'px';
  canvas.style.height = layout.height + 'px';

  // 線を描く
  drawLines(layout);

  // カードを置く
  familyState.persons.forEach(p => {
    const pos = layout.positions[p.id];
    if (!pos) return;
    const card = buildCard(p, pos);
    canvas.appendChild(card);
  });

  // 代襲相続の注記（該当者がいるときだけ表示）
  const note = document.getElementById('family-daishuu-note');
  if (note) {
    if (_daishuu.ids.size > 0) {
      note.style.display = '';
    } else {
      note.style.display = 'none';
    }
  }
}

// 読み取り専用（共有された家系図の閲覧）時に編集系UIを抑止する
function applyReadOnlyUI() {
  const ro = familyState.readOnly;
  const clearBtn = document.getElementById('btn-family-clear');
  if (clearBtn) clearBtn.style.display = ro ? 'none' : '';
  const addRoot = document.getElementById('btn-family-addroot');
  if (addRoot) addRoot.style.display = ro ? 'none' : '';
  const note = document.getElementById('family-readonly-note');
  if (note) note.style.display = ro ? '' : 'none';
}

function buildCard(p, pos) {
  const card = document.createElement('div');
  card.className = 'fc-card gender-' + p.gender + (p.isDeceased ? ' is-deceased' : '') +
    (p.id === familyState.rootId ? ' is-root' : '') + (familyState.readOnly ? ' is-readonly' : '');
  card.style.left = pos.x + 'px';
  card.style.top = pos.y + 'px';
  // 閲覧専用のときはクリックで編集モーダルを開かない
  if (!familyState.readOnly) card.onclick = () => familyOpenModal(p.id);

  const genderMark = p.gender === 'M' ? '♂' : p.gender === 'F' ? '♀' : '◇';
  const name = p.name ? escapeHtml(p.name) : '（名前未入力）';

  // 年表示
  let years = '';
  const b = p.birthYear ? p.birthYear : '';
  const d = p.deathYear ? p.deathYear : '';
  if (b || d) years = `${b}${(b || d) ? '–' : ''}${d}`;

  const badges = [];
  if (p.id === familyState.rootId) badges.push('<span class="fc-badge fc-badge-root">本人</span>');
  if (p.isDeceased) badges.push('<span class="fc-badge fc-badge-dead">故</span>');
  if (_daishuu.ids.has(p.id)) badges.push('<span class="fc-badge fc-badge-daishuu" title="代襲相続人になりうる">代襲</span>');
  if (p.medicalNotes) badges.push('<span class="fc-badge fc-badge-med" title="医療メモあり">📋</span>');

  const rel = _relations[p.id];
  card.innerHTML = `
    <div class="fc-card-top">
      <span class="fc-gender">${genderMark}</span>
      ${rel ? `<span class="fc-relation">${rel}</span>` : ''}
      <span class="fc-badges">${badges.join('')}</span>
    </div>
    <p class="fc-name">${name}</p>
    ${years ? `<p class="fc-years">${years}</p>` : '<p class="fc-years fc-years-empty">　</p>'}
  `;
  return card;
}

// ---------- レイアウト計算 ----------
// 方針：縦（世代）はBFSで決め、横は「家族ユニット（夫婦＋子）」単位で整列する。
// 子のかたまりを左右に詰め、親（夫婦）をその真上・中央に置く（tidy treeの考え方）。
// これで「子が親の真下」「兄弟は隣接」「配偶者は連れ合いの隣」が自然に揃う。
function computeLayout() {
  const persons = familyState.persons;
  const byId = {};
  persons.forEach(p => (byId[p.id] = p));

  const rootId = (familyState.rootId && byId[familyState.rootId])
    ? familyState.rootId : persons[0].id;

  // --- 縦：世代をBFSで決める（本人=0／親=-1／子=+1／配偶者=同じ）---
  const gen = { [rootId]: 0 };
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift();
    const p = byId[id];
    const g = gen[id];
    p.rels.spouses.forEach(s => { if (byId[s] && gen[s] === undefined) { gen[s] = g; queue.push(s); } });
    [p.rels.father, p.rels.mother].forEach(pr => {
      if (pr && byId[pr] && gen[pr] === undefined) { gen[pr] = g - 1; queue.push(pr); }
    });
    p.rels.children.forEach(c => { if (byId[c] && gen[c] === undefined) { gen[c] = g + 1; queue.push(c); } });
  }
  persons.forEach(p => { if (gen[p.id] === undefined) gen[p.id] = 0; });

  // --- 横：家族ユニット単位で整列 ---
  const x = {};                 // id -> 左x(px)
  const placed = new Set();
  let cursor = 0;               // 葉（末端）を詰めていく位置
  const STEP = CARD_W + H_GAP;

  const existSpouses = id => byId[id].rels.spouses.filter(s => byId[s]);
  const primaryParent = id => {                 // 子のx位置を決める「主たる親」（父優先）
    const p = byId[id];
    if (p.rels.father && byId[p.rels.father]) return p.rels.father;
    if (p.rels.mother && byId[p.rels.mother]) return p.rels.mother;
    return null;
  };
  const placeMembersAt = (members, centerX) => {
    const totalW = members.length * CARD_W + (members.length - 1) * H_GAP;
    let sx = centerX - totalW / 2;
    members.forEach(m => { x[m] = sx; sx += STEP; });
  };

  // 1) 夫婦＋子のツリーを組み立てつつ、各部分木の幅を求める
  //    width = max(夫婦の幅, 子たちの合計幅)。これで兄弟の部分木が重ならない。
  function buildNode(primaryId) {
    if (placed.has(primaryId)) return null;
    placed.add(primaryId);
    // 配偶者を本人の左右に振り分ける。
    // ・前妻・前夫 … 本人の「左」／現在の配偶者 … 本人の「右」。
    // 本人を中央に置くことで、各配偶者への線が必ず隣のカードへ直接引かれ、
    // 間の配偶者カードを線が跨いで「別の二人が結ばれて見える」誤解を防ぐ。
    const sps = existSpouses(primaryId).filter(s => !placed.has(s));
    sps.forEach(s => placed.add(s));
    const formers = sps.filter(s => isFormerCouple(primaryId, s));
    const currents = sps.filter(s => !isFormerCouple(primaryId, s));
    const members = [...formers, primaryId, ...currents];

    const childIds = [];
    const seen = new Set();
    members.forEach(m => {
      byId[m].rels.children.forEach(c => {
        if (byId[c] && !seen.has(c) && !placed.has(c) && members.includes(primaryParent(c))) {
          seen.add(c); childIds.push(c);
        }
      });
    });
    // 兄弟姉妹は「年長者を右側」に並べる（行政書士の家系図記入ルール）。
    // x は右ほど大きいので、左→右で「年下→年長」になるよう生年で並べ替える。
    // ・両者に生年がある場合のみ比較（年長＝生年が小さい＝右）。
    // ・片方でも生年が無ければ 0 を返し、既存の登録順を保つ（安定ソート）。
    // TODO(v6): 生年月日（月日）や明示的な表示順フィールドを持たせ、
    //           生まれ年が同じ／未入力の兄弟も正しく整列できるようにする。
    childIds.sort((a, b) => {
      const ya = byId[a].birthYear, yb = byId[b].birthYear;
      if (!ya || !yb) return 0;
      return yb - ya;   // 年下(生年大)を左、年長(生年小)を右へ
    });
    const children = childIds.map(buildNode).filter(Boolean);

    const uw = members.length * CARD_W + (members.length - 1) * H_GAP;
    const cw = children.length
      ? children.reduce((s, n) => s + n.width, 0) + (children.length - 1) * H_GAP : 0;
    return { members, children, uw, width: Math.max(uw, cw), cw };
  }

  // 2) 左から幅ぶんを割り当てて配置。子は範囲内に詰め、親はその中央へ。
  function assignNode(node, left) {
    if (!node.children.length) {
      let sx = left;
      node.members.forEach(m => { x[m] = sx; sx += STEP; });
      node.center = left + node.uw / 2;
      return;
    }
    const childrenLeft = left + Math.max(0, (node.uw - node.cw) / 2);
    let run = childrenLeft;
    node.children.forEach(ch => { assignNode(ch, run); run += ch.width + H_GAP; });
    const first = node.children[0].center;
    const last = node.children[node.children.length - 1].center;
    node.center = (first + last) / 2;
    placeMembersAt(node.members, node.center);
  }

  // 本人の祖先の頂点（父優先で遡る）から配置を開始 → 本人・兄弟・子・甥姪まで一気に整う
  let apex = rootId;
  const guard = new Set();
  while (primaryParent(apex) && !guard.has(apex)) { guard.add(apex); apex = primaryParent(apex); }
  const apexNode = buildNode(apex);
  if (apexNode) assignNode(apexNode, 0);

  // 婚入した配偶者の親など、未配置の人を補完する
  let changed = true;
  while (changed) {
    changed = false;
    persons.forEach(p => {
      if (placed.has(p.id)) return;
      // 配置済みの子がいる → その子の真上（親として中央寄せ）
      const placedChild = p.rels.children.find(c => placed.has(c));
      if (placedChild) {
        const members = [p.id]; placed.add(p.id);
        existSpouses(p.id).forEach(s => { if (!placed.has(s)) { placed.add(s); members.push(s); } });
        placeMembersAt(members, x[placedChild] + CARD_W / 2);
        changed = true; return;
      }
      // 配置済みの配偶者がいる → その隣
      const placedSpouse = existSpouses(p.id).find(s => placed.has(s));
      if (placedSpouse) { x[p.id] = x[placedSpouse] + STEP; placed.add(p.id); changed = true; return; }
      // 配置済みの親がいる → その下
      const pp = primaryParent(p.id);
      if (pp && placed.has(pp)) { x[p.id] = x[pp]; placed.add(p.id); changed = true; return; }
    });
  }
  // 完全に孤立した人は末尾に並べる
  persons.forEach(p => { if (!placed.has(p.id)) { x[p.id] = cursor; cursor += STEP; placed.add(p.id); } });

  // 3) 重なり解消パス（最終調整）
  //    tidy tree 本体は重ならないが、補完配置（婚入した配偶者の親など）は
  //    既存カードとの衝突を見ずに中央寄せするため、同じ世代で横に重なることがある。
  //    ここで世代ごとに「夫婦＝1ユニット」を保ったまま左→右に詰め直し、重なりを除く。
  //    既に十分離れているユニットは動かさない（正しく整列済みの配置を壊さない）。
  {
    const byGen = {};
    persons.forEach(p => {
      if (x[p.id] === undefined) return;
      (byGen[gen[p.id]] = byGen[gen[p.id]] || []).push(p.id);
    });

    Object.values(byGen).forEach(ids => {
      const idSet = new Set(ids);
      const seen = new Set();
      const units = [];

      // 同世代で配偶者どうしを1つのユニットにまとめる
      ids.forEach(id => {
        if (seen.has(id)) return;
        const members = [];
        const stack = [id];
        while (stack.length) {
          const cur = stack.pop();
          if (seen.has(cur)) continue;
          seen.add(cur);
          members.push(cur);
          byId[cur].rels.spouses.forEach(s => { if (idSet.has(s) && !seen.has(s)) stack.push(s); });
        }
        members.sort((a, b) => x[a] - x[b]);  // ユニット内は現在の並び順を維持
        units.push(members);
      });

      // ユニットを左端の位置順に並べ、左から重ならないように詰め直す
      units.sort((a, b) => x[a[0]] - x[b[0]]);
      let minLeft = -Infinity;  // 次のユニットが取れる最小の左x
      units.forEach(members => {
        let left = Math.max(x[members[0]], minLeft);  // 余裕があれば元の位置を尊重
        let sx = left;
        members.forEach(m => { x[m] = sx; sx += STEP; });
        // このユニット末尾カードの右端 + H_GAP が、次ユニットの最小左x
        minLeft = left + (members.length - 1) * STEP + CARD_W + H_GAP;
      });
    });
  }

  // --- 座標を確定（左上を基準に正規化）---
  const minGen = Math.min(...persons.map(p => gen[p.id]));
  const maxGen = Math.max(...persons.map(p => gen[p.id]));
  const minX = Math.min(...persons.map(p => x[p.id]));

  const positions = {};
  persons.forEach(p => {
    positions[p.id] = {
      x: PAD + (x[p.id] - minX),
      y: PAD + (gen[p.id] - minGen) * (CARD_H + V_GAP)
    };
  });
  const maxX = Math.max(...persons.map(p => positions[p.id].x));

  return {
    positions,
    width: maxX + CARD_W + PAD,
    height: PAD + (maxGen - minGen + 1) * CARD_H + (maxGen - minGen) * V_GAP + PAD
  };
}

// ---------- 線の描画 ----------
function drawLines(layout) {
  const svg = document.getElementById('family-lines');
  svg.setAttribute('width', layout.width);
  svg.setAttribute('height', layout.height);
  svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
  svg.innerHTML = '';

  const pos = layout.positions;
  const center = id => ({ x: pos[id].x + CARD_W / 2, y: pos[id].y + CARD_H / 2 });

  // 夫婦線（横）— 重複を避けるためペアを記録
  // ・現在の配偶者：二重線（行政書士ルール①）
  // ・前妻・前夫：点線（同ルール⑤）。formerSpouses で判定する。
  const drawnCouples = new Set();
  familyState.persons.forEach(p => {
    if (!pos[p.id]) return;
    p.rels.spouses.forEach(sid => {
      if (!pos[sid]) return;
      const key = [p.id, sid].sort().join('|');
      if (drawnCouples.has(key)) return;
      drawnCouples.add(key);
      const a = center(p.id), b = center(sid);
      if (isFormerCouple(p.id, sid)) {
        // 前妻・前夫：一本の点線で区別する
        addLine(svg, a.x, a.y, b.x, b.y, 'fc-line-former');
      } else {
        // 現在の配偶者：横の二重線（中心線の上下に2px寄せた2本）
        addLine(svg, a.x, a.y - 2.5, b.x, b.y - 2.5, 'fc-line-spouse');
        addLine(svg, a.x, a.y + 2.5, b.x, b.y + 2.5, 'fc-line-spouse');
      }
    });
  });

  // 親子線（直交コネクタ）
  familyState.persons.forEach(child => {
    if (!pos[child.id]) return;
    const parents = [child.rels.father, child.rels.mother].filter(pid => pid && pos[pid]);
    if (parents.length === 0) return;

    // 親の接続点：2人なら中点、1人ならその親の下端中央
    let px, py;
    if (parents.length === 2) {
      const a = center(parents[0]), b = center(parents[1]);
      px = (a.x + b.x) / 2;
      py = Math.max(pos[parents[0]].y, pos[parents[1]].y) + CARD_H;
    } else {
      px = pos[parents[0]].x + CARD_W / 2;
      py = pos[parents[0]].y + CARD_H;
    }
    const cx = pos[child.id].x + CARD_W / 2;
    const cy = pos[child.id].y;
    const midY = (py + cy) / 2;
    const d = `M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`;
    // 親のいずれかが「先に亡くなった相続人」なら、この線は代襲ライン
    const isDaishuu = parents.some(pid => _daishuu.edges.has(pid + '>' + child.id));
    if (isDaishuu) {
      addPath(svg, d, 'fc-line-daishuu');
    } else if (child.adopted) {
      // 養子・養女：縦の二重線（行政書士ルール③）。
      // 子側の縦線が二重に見えるよう、子寄りの縦区間を左右±2.5pxにずらした2本を引く。
      addPath(svg, `M ${px} ${py} L ${px} ${midY} L ${cx - 2.5} ${midY} L ${cx - 2.5} ${cy}`, 'fc-line-parent');
      addPath(svg, `M ${px} ${py} L ${px} ${midY} L ${cx + 2.5} ${midY} L ${cx + 2.5} ${cy}`, 'fc-line-parent');
    } else {
      // 実子：縦の一本線（同ルール②）
      addPath(svg, d, 'fc-line-parent');
    }
  });
}

// この2人が「前妻・前夫」の関係か（どちらかが相手を formerSpouses に持てば前配偶者）
function isFormerCouple(aId, bId) {
  const a = getPerson(aId), b = getPerson(bId);
  return !!((a && (a.formerSpouses || []).includes(bId)) ||
            (b && (b.formerSpouses || []).includes(aId)));
}

function addLine(svg, x1, y1, x2, y2, cls) {
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1); l.setAttribute('y1', y1);
  l.setAttribute('x2', x2); l.setAttribute('y2', y2);
  l.setAttribute('class', cls);
  svg.appendChild(l);
}

function addPath(svg, d, cls) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  p.setAttribute('class', cls);
  p.setAttribute('fill', 'none');
  svg.appendChild(p);
}

// ============================================================
// モーダル（追加・編集）
// ============================================================
function familyAddRoot() {
  if (familyState.readOnly) return;
  familyState.editingId = null;
  familyState.pendingRelation = null;
  openModalForm({ title: 'ご本人', eyebrow: '人物の登録', person: null, showRelatives: false, showDelete: false });
}

function familyOpenModal(personId) {
  const p = getPerson(personId);
  if (!p) return;
  familyState.editingId = personId;
  familyState.pendingRelation = null;
  openModalForm({
    title: p.name || '（名前未入力）',
    eyebrow: '人物の編集',
    person: p,
    showRelatives: true,
    showDelete: p.id !== familyState.rootId  // 本人は削除不可（誤操作防止）
  });
}

function familyAddRelative(type) {
  if (familyState.readOnly) return;
  // いま編集中の人物を base にして、新規人物フォームへ切り替える
  const baseId = familyState.editingId;
  if (!baseId) return;
  const base = getPerson(baseId);
  const labelMap = {
    spouse:  `${base.name || '本人'} の配偶者`,
    child:   `${base.name || '本人'} の子ども`,
    father:  `${base.name || '本人'} の父`,
    mother:  `${base.name || '本人'} の母`,
    sibling: `${base.name || '本人'} の兄弟姉妹`
  };
  familyState.editingId = null;
  familyState.pendingRelation = { type, baseId };

  // 続柄から性別を初期推定
  const preset = {};
  if (type === 'father') preset.gender = 'M';
  if (type === 'mother') preset.gender = 'F';

  openModalForm({
    title: labelMap[type],
    eyebrow: '親族の追加',
    person: preset.gender ? { ...newPerson(), gender: preset.gender } : null,
    showRelatives: false,
    showDelete: false,
    showFormer: type === 'spouse'   // 配偶者追加のときだけ「前妻・前夫」選択を出す
  });
}

function openModalForm({ title, eyebrow, person, showRelatives, showDelete, showFormer }) {
  document.getElementById('family-modal-title').textContent = title;
  document.getElementById('family-modal-eyebrow').textContent = eyebrow;

  document.getElementById('ff-name').value = person ? (person.name || '') : '';
  document.getElementById('ff-birth').value = person && person.birthYear ? person.birthYear : '';
  document.getElementById('ff-death').value = person && person.deathYear ? person.deathYear : '';
  document.getElementById('ff-deceased').checked = person ? !!person.isDeceased : false;
  document.getElementById('ff-medical').value = person ? (person.medicalNotes || '') : '';
  document.getElementById('ff-adopted').checked = person ? !!person.adopted : false;

  // 前妻・前夫チェックは「配偶者を追加」する時だけ表示し、毎回オフから始める
  const formerWrap = document.getElementById('ff-former-wrap');
  if (formerWrap) formerWrap.style.display = showFormer ? '' : 'none';
  document.getElementById('ff-former').checked = false;

  // 性別ラジオ
  const g = person ? person.gender : 'other';
  document.querySelectorAll('#ff-gender .family-radio').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.gender === g);
  });

  toggleMedicalField();
  document.getElementById('family-relatives').style.display = showRelatives ? '' : 'none';
  document.getElementById('ff-delete').style.display = showDelete ? '' : 'none';

  document.getElementById('family-modal').style.display = '';
}

function familyCloseModal() {
  document.getElementById('family-modal').style.display = 'none';
  familyState.editingId = null;
  familyState.pendingRelation = null;
}

function toggleMedicalField() {
  const deceased = document.getElementById('ff-deceased').checked;
  // 故人 or 病歴入力済みのときに医療メモ欄を表示
  const hasNotes = document.getElementById('ff-medical').value.trim().length > 0;
  document.getElementById('ff-medical-wrap').style.display = (deceased || hasNotes) ? '' : 'none';
}

function readForm() {
  const name = document.getElementById('ff-name').value.trim();
  const birthYear = parseInt(document.getElementById('ff-birth').value, 10);
  const deathYear = parseInt(document.getElementById('ff-death').value, 10);
  const isDeceased = document.getElementById('ff-deceased').checked || !!deathYear;
  const medicalNotes = document.getElementById('ff-medical').value.trim();
  const adopted = document.getElementById('ff-adopted').checked;
  const genderBtn = document.querySelector('#ff-gender .family-radio.selected');
  const gender = genderBtn ? genderBtn.dataset.gender : 'other';
  return {
    name,
    gender,
    birthYear: isNaN(birthYear) ? null : birthYear,
    deathYear: isNaN(deathYear) ? null : deathYear,
    isDeceased,
    medicalNotes,
    adopted
  };
}

function familySavePerson() {
  if (familyState.readOnly) return;
  const data = readForm();

  if (familyState.editingId) {
    // --- 既存を更新 ---
    const p = getPerson(familyState.editingId);
    Object.assign(p, data);
  } else {
    // --- 新規作成 ---
    const p = newPerson(data);
    familyState.persons.push(p);

    if (!familyState.rootId) {
      familyState.rootId = p.id;  // 最初の1人は本人
    }

    if (familyState.pendingRelation) {
      // 配偶者追加時の「前妻・前夫」チェックを関係付けに渡す
      const former = document.getElementById('ff-former').checked;
      linkRelative(familyState.pendingRelation, p, { former });
    }
  }

  familySave();
  familyCloseModal();
  familyRender();
}

// 親族の関係付け
function linkRelative(rel, person, opts = {}) {
  const base = getPerson(rel.baseId);
  if (!base) return;

  if (rel.type === 'spouse') {
    // レイアウト・続柄・子の親判定のため spouses には常に入れる。
    // 前妻・前夫のときは formerSpouses にも記録し、線を点線で描き分ける。
    base.rels.spouses.push(person.id);
    person.rels.spouses.push(base.id);
    if (opts.former) {
      base.formerSpouses.push(person.id);
      person.formerSpouses.push(base.id);
    }

  } else if (rel.type === 'child') {
    // base を親に。性別で父母スロットを決める
    if (base.gender === 'F') person.rels.mother = base.id;
    else person.rels.father = base.id;
    base.rels.children.push(person.id);

    // base に配偶者がいれば、その人ももう一方の親に
    const spouseId = base.rels.spouses[0];
    if (spouseId) {
      const sp = getPerson(spouseId);
      if (sp) {
        if (sp.gender === 'F' && !person.rels.mother) person.rels.mother = sp.id;
        else if (!person.rels.father) person.rels.father = sp.id;
        else if (!person.rels.mother) person.rels.mother = sp.id;
        sp.rels.children.push(person.id);
      }
    }

  } else if (rel.type === 'father') {
    base.rels.father = person.id;
    person.rels.children.push(base.id);
    linkParentsAsCouple(base);

  } else if (rel.type === 'mother') {
    base.rels.mother = person.id;
    person.rels.children.push(base.id);
    linkParentsAsCouple(base);

  } else if (rel.type === 'sibling') {
    // 兄弟姉妹は「親を共有する」関係。base の親と同じ親に person を繋ぐ。
    let f = base.rels.father, m = base.rels.mother;

    // base にまだ親が一人もいなければ、共通の親（仮）を1人作って繋ぐ
    if (!f && !m) {
      const parent = newPerson({ name: '' });
      familyState.persons.push(parent);
      base.rels.father = parent.id;
      parent.rels.children.push(base.id);
      f = parent.id;
    }

    if (f) { person.rels.father = f; getPerson(f).rels.children.push(person.id); }
    if (m) { person.rels.mother = m; getPerson(m).rels.children.push(person.id); }
  }
}

// 父と母が揃ったら夫婦として結ぶ（レイアウトで隣に並ぶ）
function linkParentsAsCouple(child) {
  const f = child.rels.father, m = child.rels.mother;
  if (!f || !m) return;
  const fp = getPerson(f), mp = getPerson(m);
  if (!fp || !mp) return;
  if (!fp.rels.spouses.includes(m)) fp.rels.spouses.push(m);
  if (!mp.rels.spouses.includes(f)) mp.rels.spouses.push(f);
}

function familyDeletePerson() {
  if (familyState.readOnly) return;
  const id = familyState.editingId;
  if (!id || id === familyState.rootId) return;
  const p = getPerson(id);
  if (!p) return;
  if (!confirm(`「${p.name || '名前未入力の人物'}」を家系図から削除しますか？`)) return;

  // この人物への参照をすべて掃除
  familyState.persons.forEach(other => {
    other.rels.spouses = other.rels.spouses.filter(x => x !== id);
    other.rels.children = other.rels.children.filter(x => x !== id);
    if (Array.isArray(other.formerSpouses)) other.formerSpouses = other.formerSpouses.filter(x => x !== id);
    if (other.rels.father === id) other.rels.father = null;
    if (other.rels.mother === id) other.rels.mother = null;
  });
  familyState.persons = familyState.persons.filter(x => x.id !== id);

  familySave();
  familyCloseModal();
  familyRender();
}

// ============================================================
// ツールバー操作
// ============================================================
function familyClearAll() {
  if (familyState.readOnly) return;
  if (familyState.persons.length === 0) return;
  if (!confirm('家系図のすべての人物を削除します。よろしいですか？')) return;
  familyState.persons = [];
  familyState.rootId = null;
  familySave();
  familyRender();
}

function familyExportJson() {
  const blob = new Blob([JSON.stringify({
    persons: familyState.persons,
    rootId: familyState.rootId,
    exportedAt: new Date().toISOString()
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'family-chart.json';
  a.click();
  URL.revokeObjectURL(url);
}

function familyPrint() {
  if (familyState.persons.length === 0) { window.print(); return; }

  const canvas = document.getElementById('family-canvas');
  const wrap = document.getElementById('family-canvas-wrap');
  const w = parseFloat(canvas.style.width) || canvas.offsetWidth;
  const h = parseFloat(canvas.style.height) || canvas.offsetHeight;

  // A4横（余白10mm）の印刷可能領域を px(96dpi) で見積もり、収まる縮尺を出す
  const PXMM = 96 / 25.4;
  const pageW = (297 - 20) * PXMM;          // ≒1047px
  const pageH = (210 - 20) * PXMM - 80;     // ヘッダー分を差し引く
  const scale = Math.min(pageW / w, pageH / h, 1);

  // 印刷用ヘッダー（タイトル・中心人物・作成日）
  const head = document.getElementById('family-print-head');
  const rootP = getPerson(familyState.rootId);
  const d = new Date();
  head.innerHTML = `
    <h2 class="family-print-title">家系図（親族関係図）</h2>
    <p class="family-print-meta">
      ${rootP && rootP.name ? '中心：' + escapeHtml(rootP.name) + '　／　' : ''}作成日：${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日
    </p>`;

  // 縮尺を当てて印刷 → 終わったら元に戻す
  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${scale})`;
  wrap.style.width = (w * scale) + 'px';
  wrap.style.height = (h * scale) + 'px';
  wrap.style.margin = '0 auto';
  document.body.classList.add('is-printing');

  const cleanup = () => {
    document.body.classList.remove('is-printing');
    canvas.style.transform = '';
    canvas.style.transformOrigin = '';
    wrap.style.width = '';
    wrap.style.height = '';
    wrap.style.margin = '';
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  setTimeout(cleanup, 2000); // afterprintが発火しない環境向けの保険

  window.print();
}

// ---------- ユーティリティ ----------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------- クラウド連携（auth.js / db.js）から使う関数を公開 ----------
window.familyState = familyState;
window.familyLoadLocal = familyLoadLocal;
window.familyApplyData = familyApplyData;
// familyRender / setSaveState は関数宣言なので既に window に乗っている

// ---------- 初期化 ----------
document.addEventListener('DOMContentLoaded', () => {
  // クラウド連携が読み込まれていれば、ログイン状態に応じて読込・描画を任せる。
  // 未読込（Supabase未設定など）なら従来通り localStorage から。
  if (window.TDN && typeof window.TDN.boot === 'function') {
    window.TDN.boot();
  } else {
    familyLoadLocal();
    familyRender();
  }

  // 性別ラジオの選択
  document.querySelectorAll('#ff-gender .family-radio').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ff-gender .family-radio').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // 故人チェック → 医療メモ欄の出し入れ
  document.getElementById('ff-deceased').addEventListener('change', toggleMedicalField);
  document.getElementById('ff-medical').addEventListener('input', () => {});
});
