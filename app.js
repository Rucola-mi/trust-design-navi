// ============================================================
// Trust Design Navi — Prototype Logic
// ============================================================

// ---------- データ：10テーマ ----------
// 各テーマに「最初に知るとよいこと」「調べる入口」「家族と話す前に考えておくこと」を持つ
const THEMES = [
  {
    id: 1,
    name: '見守りと安否確認',
    desc: '日々の暮らしの見守りや、いざという時の安否確認について、今の状態に近いものを選んでください。',
    priorityHint: '見守りには「人が訪ねるタイプ」「センサー型」「電話・メール型」など複数の選択肢があります。まずは形を知るところから。',
    whatToKnow: '見守りには大きく「人による見守り」「機器・センサー」「電話・郵便・通報サービス」の3タイプがあります。それぞれ、関わり方の濃さや費用感がちがいます。',
    whereToLearn: 'お住まいの自治体の「高齢者見守り」「地域包括支援センター」を検索／民生委員制度の概要を確認。無料相談から始められます。',
    beforeFamily: '日々どこまでを自分で続けたいか、どこからを誰かに頼みたいか。「日常」と「もしもの時」をわけて、希望を言葉にしてみましょう。'
  },
  {
    id: 2,
    name: '入院・手術のこと',
    desc: '突然の入院や手術が必要になった時の、希望や手続きについて、今の状態に近いものを選んでください。',
    priorityHint: '入院時に必要なものや、本人が動けない時に困る手続きを、先に知っておくと安心です。',
    whatToKnow: '入院時には保険証・印鑑・連絡先・常備薬リストなどが必要です。手術の同意や治療方針は、原則ご本人の判断ですが、判断できない時に頼める人が必要になります。',
    whereToLearn: '通院されている病院の「入院案内」を読む／自治体の「医療相談窓口」を調べる。市販のエンディングノートの「医療」欄を眺めるのも入口です。',
    beforeFamily: '「もしもの入院」のとき、まず誰に連絡してほしいか。治療方針は誰と相談したいか。それを一覧で書けるかを試してみましょう。'
  },
  {
    id: 3,
    name: '人生の最終段階の医療のこと',
    desc: '人生の終盤に受けたい医療や、延命治療への考え方について、今の状態に近いものを選んでください。',
    priorityHint: '「人生会議（ACP）」という考え方を知ると、ご自身の希望が整理しやすくなります。',
    whatToKnow: '人生の最終段階の医療には「延命治療を望むか」「どこで過ごしたいか」「誰に判断を委ねるか」などの論点があります。一度に決める必要はありません。',
    whereToLearn: '厚生労働省「人生会議（ACP）」のサイトや、自治体の終末期医療パンフレットを検索／お住まいの医療機関に「ACP相談」があるか確認。',
    beforeFamily: '「もしも自分で言葉にできない時」に、誰に・どんな価値観で代わって話してほしいか。譲れない大切なことを、3つだけ挙げてみましょう。'
  },
  {
    id: 4,
    name: '資産とお金のこと',
    desc: '預貯金・年金・保険など、お金まわりの整理について、今の状態に近いものを選んでください。',
    priorityHint: 'まずは「何が・どこに・いくらあるか」の見える化から。決めることは、その後でゆっくり考えれば大丈夫です。',
    whatToKnow: '資産には預貯金・年金・保険・不動産・有価証券・デジタル資産があります。それぞれ、本人以外が場所を知らないと取り出せないことが多いです。',
    whereToLearn: '金融機関の「エンディングノート」やFP（ファイナンシャル・プランナー）の無料相談、自治体の「くらしとお金」相談を活用できます。',
    beforeFamily: '通帳・証券・保険証券の「ありか」を、自分自身が把握できているか確認。詳細を共有する前に、まずは存在のリストアップから始めてみましょう。'
  },
  {
    id: 5,
    name: '介護と住まいのこと',
    desc: '介護が必要になった時の希望や、住まい方について、今の状態に近いものを選んでください。',
    priorityHint: '介護保険制度の基本と、住まいの選択肢を知ると、未来の選択肢がぐっと広がります。',
    whatToKnow: '介護保険は65歳から（一定の条件で40歳から）利用可。要介護認定を受けると、訪問介護や施設サービスなどを1〜3割負担で使えます。住まいは在宅・サ高住・有料老人ホーム・特養など段階があります。',
    whereToLearn: 'お住まいの地域包括支援センター（無料相談）／自治体の介護保険パンフレット／民間の見学・体験を実施している施設のホームページ。',
    beforeFamily: '「できる限り今の家で」「子の近く」「施設」など、希望の方向性を3つに整理してみる。家族の生活との両立も意識してみましょう。'
  },
  {
    id: 6,
    name: '身元保証のこと',
    desc: '入院・施設入所時の身元保証や、保証人について、今の状態に近いものを選んでください。',
    priorityHint: '身近に頼める人がいない場合でも、選択肢があることを知るだけで安心感が変わります。',
    whatToKnow: '入院・施設入所時には、緊急連絡・支払い保証・退院支援などを担う「身元保証人」が求められます。家族以外に頼む方法（民間サービス・NPO・社会福祉協議会など）もあります。',
    whereToLearn: '「身元保証 民間サービス」「身元保証 NPO」で検索／お住まいの社会福祉協議会に相談／消費生活センターで信頼できる事業者を確認。',
    beforeFamily: '誰に頼める可能性があるか、頼みにくいことは何か、自分の中で先に整理。複数の選択肢を持っておくと、家族との会話も冷静になれます。'
  },
  {
    id: 7,
    name: '判断力の衰えと認知症のこと',
    desc: '将来、判断力が衰えた時にどう備えるかについて、今の状態に近いものを選んでください。',
    priorityHint: '判断力が衰える前に「希望を言葉にしておく」ことが、未来のあなたを支えます。',
    whatToKnow: '認知症は誰にでも起こりうるもの。判断力が低下すると、契約・手続き・医療同意などが難しくなります。準備しておけば、本人の希望が尊重されやすくなります。',
    whereToLearn: '地域包括支援センター／認知症サポーター養成講座（無料・90分）／自治体の「認知症ガイド」資料を確認。',
    beforeFamily: '判断力が衰えた時、何を最も大切にしてほしいか（暮らしの場所・人間関係・お金の使い方）。譲れない価値観を書き出してみましょう。'
  },
  {
    id: 8,
    name: '後見人のこと',
    desc: '後見人や任意後見契約について、今の状態に近いものを選んでください。',
    priorityHint: '「法定後見」と「任意後見」の違いを知るだけで、選択肢が明確になります。',
    whatToKnow: '後見制度には「法定後見（判断力が衰えてから家庭裁判所が選任）」と「任意後見（判断力があるうちに自分で選ぶ）」があります。任意後見は元気なうちに準備する制度です。',
    whereToLearn: '法務省・最高裁の後見制度ガイド／公証役場の任意後見案内／お住まいの社会福祉協議会・成年後見センター。',
    beforeFamily: '判断力が衰えた時、誰に何を任せたいか。家族・専門家・第三者、それぞれの選択肢にどんな安心とためらいがあるか整理してみましょう。'
  },
  {
    id: 9,
    name: '死後の事務のこと',
    desc: '葬儀・お墓・各種解約手続きなど、死後の事務について、今の状態に近いものを選んでください。',
    priorityHint: 'ご自身が亡くなった後に必要な手続きは、想像以上に多くあります。まず全体像を知っておきましょう。',
    whatToKnow: '死後には葬儀・火葬・年金停止・健康保険返却・公共料金解約・SNS削除など、多くの事務があります。家族がいない／頼みにくい場合は「死後事務委任契約」という方法もあります。',
    whereToLearn: '自治体の「おくやみハンドブック」／市販のエンディングノート／葬儀社・行政書士の無料相談会。',
    beforeFamily: '葬儀の形・お墓・連絡してほしい人など、希望の輪郭を書いてみる。完璧でなくて大丈夫。「嫌なこと」だけでも整理しておくと家族が助かります。'
  },
  {
    id: 10,
    name: '相続・遺言・寄付のこと',
    desc: '財産の引き継ぎや、遺言・寄付の希望について、今の状態に近いものを選んでください。',
    priorityHint: '相続の基本ルールを知ると、「決める」ことが具体的にイメージできるようになります。',
    whatToKnow: '遺言書がない場合、財産は法定相続人に法定割合で分けられます。遺言（自筆／公正証書）があれば希望を反映できます。寄付（遺贈）も意思があれば可能です。',
    whereToLearn: '法務局の自筆証書遺言保管制度／公証役場の公正証書遺言相談／自治体や法テラスの無料法律相談／日本承継寄付協会など寄付の専門窓口。',
    beforeFamily: '「誰に何を残したいか」「残さないものは何か」「社会に還したい想いはあるか」。気持ちの整理から始めてみましょう。'
  }
];

// ---------- データ：選択肢 ----------
const CHOICES = [
  { letter: 'A', text: 'まだほとんど知らない',                          stateLabel: '知識が少ない' },
  { letter: 'B', text: '気にはなっているが、何をすればいいか分からない',   stateLabel: '入口が見えにくい' },
  { letter: 'C', text: '少し調べたことがある',                          stateLabel: '少し調べた' },
  { letter: 'D', text: '自分の希望を考え始めている',                     stateLabel: '考え始めている' },
  { letter: 'E', text: '家族や信頼できる人、専門家に共有・相談している',   stateLabel: '共有・相談している' }
];

// ---------- データ：4つの状態グループ ----------
const GROUPS = [
  {
    key: 'a',
    title: 'まだ知識が少ないテーマ',
    desc: 'まずは「どんなテーマか」を知るところから。基礎の言葉に触れるだけでも、安心の種が生まれます。',
    letters: ['A']
  },
  {
    key: 'b',
    title: '気になっているけれど、入口が見えにくいテーマ',
    desc: '関心や不安があるからこそ、優先して学ぶ価値があります。最初の一歩を、一緒に見つけましょう。',
    letters: ['B']
  },
  {
    key: 'cd',
    title: 'すでに考え始めているテーマ',
    desc: '知識を得て、自分なりの考えが芽生え始めている段階。少しずつ言葉にしていきましょう。',
    letters: ['C', 'D']
  },
  {
    key: 'e',
    title: '家族や信頼できる人と、共有・相談しているテーマ',
    desc: '対話が始まっているテーマ。定期的に見直しながら、希望を更新していきましょう。',
    letters: ['E']
  }
];

// ---------- State ----------
const state = {
  currentIndex: 0,
  answers: new Array(THEMES.length).fill(null),
  priorityTheme: null,
  priorityThemes: [],
  chatStep: 0
};

// ---------- View切り替え ----------
function showView(name) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const headerOffset = 72;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ---------- 診断 ----------
function startDiagnosis() {
  state.currentIndex = 0;
  state.answers = new Array(THEMES.length).fill(null);
  renderQuestion();
  showView('diagnosis');
}

function renderQuestion() {
  const idx = state.currentIndex;
  const theme = THEMES[idx];

  document.getElementById('diagnosis-step-label').textContent = `テーマ ${idx + 1} / ${THEMES.length}`;
  document.getElementById('diagnosis-theme-name').textContent = theme.name;
  document.getElementById('diagnosis-theme-desc').textContent = theme.desc;
  document.getElementById('progress-bar').style.width = `${((idx + 1) / THEMES.length) * 100}%`;

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  CHOICES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice' + (state.answers[idx] === c.letter ? ' selected' : '');
    btn.innerHTML = `
      <span class="choice-letter">${c.letter}</span>
      <span class="choice-text">${c.text}</span>
    `;
    btn.onclick = () => selectChoice(c.letter);
    choicesEl.appendChild(btn);
  });

  const prevBtn = document.getElementById('btn-prev');
  if (idx === 0) prevBtn.classList.add('btn-prev-hidden');
  else prevBtn.classList.remove('btn-prev-hidden');
}

let _selecting = false;
function selectChoice(letter) {
  if (_selecting) return;
  _selecting = true;

  // 回答を確実に保存
  state.answers[state.currentIndex] = letter;

  document.querySelectorAll('.choice').forEach((btn, i) => {
    btn.classList.toggle('selected', CHOICES[i].letter === letter);
  });

  setTimeout(() => {
    _selecting = false;
    if (state.currentIndex < THEMES.length - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      // 最後の質問：回答が確実に入っていることを再確認してから遷移
      if (state.answers[state.currentIndex]) {
        finishDiagnosis();
      } else {
        // 念のためのフォールバック（通常は発生しない）
        state.answers[state.currentIndex] = letter;
        finishDiagnosis();
      }
    }
  }, 300);
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion();
  }
}

// ---------- 結果 ----------
function finishDiagnosis() {
  // 1. 未回答チェック：最初の未回答テーマへ戻す
  const unansweredIdx = state.answers.findIndex(a => !a);
  if (unansweredIdx !== -1) {
    state.currentIndex = unansweredIdx;
    renderQuestion();
    showView('diagnosis');
    const descEl = document.getElementById('diagnosis-theme-desc');
    const themeName = THEMES[unansweredIdx].name;
    descEl.innerHTML = `<span style="color: var(--state-a); font-weight: 500;">⚠ 未回答のテーマがあります。「${themeName}」から回答を続けてください。</span>`;
    return;
  }

  // 2. 全テーマに有効な回答がある状態
  const themeStates = THEMES.map((theme, i) => {
    const letter = state.answers[i];
    const choice = CHOICES.find(c => c.letter === letter);
    if (!choice || !letter) {
      // 念のためのnull-safeフォールバック（通常は到達しない）
      return {
        theme,
        letter: 'A',
        stateLabel: CHOICES[0].stateLabel,
        stateClass: 'state-a'
      };
    }
    return {
      theme,
      letter,
      stateLabel: choice.stateLabel,
      stateClass: 'state-' + letter.toLowerCase()
    };
  });

  // 3. 優先テーマの判定（A/B → C → all-progressing の3段フォールバック）
  const bThemes = themeStates.filter(t => t.letter === 'B');
  const aThemes = themeStates.filter(t => t.letter === 'A');
  const cThemes = themeStates.filter(t => t.letter === 'C');

  let priorityList = [];
  let priorityMode = '';
  if (bThemes.length > 0) {
    priorityList = [...bThemes, ...aThemes].slice(0, 3);
    priorityMode = 'b-led';
  } else if (aThemes.length > 0) {
    priorityList = aThemes.slice(0, 3);
    priorityMode = 'a-only';
  } else if (cThemes.length > 0) {
    priorityList = cThemes.slice(0, 3);
    priorityMode = 'deepen';
  } else {
    priorityMode = 'all-progressing';
  }

  state.priorityThemes = priorityList.map(p => p.theme);
  state.priorityTheme = priorityList[0]
    ? priorityList[0].theme
    : (themeStates.find(t => t.letter === 'D') || themeStates[0]).theme;

  const priorityIds = new Set(priorityList.map(p => p.theme.id));

  // --- リテラシーマップ描画 ---
  const mapEl = document.getElementById('literacy-map-grid');
  mapEl.innerHTML = '';
  themeStates.forEach(ts => {
    const cell = document.createElement('div');
    const isPriority = priorityIds.has(ts.theme.id);
    cell.className = `map-cell ${ts.stateClass}` + (isPriority ? ' priority' : '');
    cell.innerHTML = `
      <p class="map-cell-num">${String(ts.theme.id).padStart(2, '0')}</p>
      <p class="map-cell-name">${ts.theme.name}</p>
      <span class="map-cell-state">${ts.stateLabel}</span>
    `;
    mapEl.appendChild(cell);
  });

  // --- 優先テーマ描画（モード別に見出し・リード・本文を切替） ---
  const priorityTitleEl = document.getElementById('priority-title');
  const priorityLeadEl = document.getElementById('priority-lead');
  const priorityListEl = document.getElementById('priority-list');
  priorityListEl.innerHTML = '';

  if (priorityMode === 'b-led') {
    priorityTitleEl.textContent = '今、優先して学ぶとよさそうなテーマ';
    priorityLeadEl.textContent = '「気になっているけれど入口が見えにくい」テーマは、関心がある分、最初に学ぶ価値があります。';
  } else if (priorityMode === 'a-only') {
    priorityTitleEl.textContent = '今、優先して学ぶとよさそうなテーマ';
    priorityLeadEl.textContent = 'まずは「知識が少ない」テーマから、ゆっくり言葉に触れるところから始めてみませんか？';
  } else if (priorityMode === 'deepen') {
    priorityTitleEl.textContent = 'さらに理解を深めるとよさそうなテーマ';
    priorityLeadEl.textContent = '少し調べたことのあるテーマを、もう一歩深めてみませんか？知識を整理して、自分ごととしてつなげていくタイミングです。';
  } else {
    priorityTitleEl.textContent = 'これからの一歩';
    priorityLeadEl.textContent = '';
  }

  if (priorityMode === 'all-progressing') {
    const div = document.createElement('div');
    div.className = 'priority-item';
    div.innerHTML = `
      <span class="priority-icon">✨</span>
      <div class="priority-body">
        <p class="priority-name">すばらしい歩みです。</p>
        <p class="priority-desc">すでに多くのテーマについて考え始めています。<br>次は、気になるテーマを1つ選んで、信頼できる人と話してみましょう。</p>
      </div>
    `;
    priorityListEl.appendChild(div);
  } else {
    priorityList.forEach((p, i) => {
      const icons = ['🌱', '🌿', '✨'];
      const tagColor = p.letter === 'B' ? 'var(--state-b)'
                     : p.letter === 'A' ? 'var(--state-a)'
                     : 'var(--state-c)';
      const div = document.createElement('div');
      div.className = 'priority-item';
      div.innerHTML = `
        <span class="priority-icon">${icons[i] || '🌱'}</span>
        <div class="priority-body">
          <p class="priority-name">
            ${p.theme.name}
            <span class="priority-state-tag" style="margin-left: 10px; font-size: 11px; padding: 3px 10px; border-radius: 999px; color: #fff; background: ${tagColor};">${p.stateLabel}</span>
          </p>
          <p class="priority-desc">${p.theme.priorityHint}</p>
        </div>
      `;
      priorityListEl.appendChild(div);
    });
  }

  // --- グループ別表示 ---
  const groupsEl = document.getElementById('group-sections');
  groupsEl.innerHTML = '';
  GROUPS.forEach(g => {
    const inGroup = themeStates.filter(ts => g.letters.includes(ts.letter));
    const card = document.createElement('div');
    const isPriorityGroup = (g.key === 'a' || g.key === 'b') && inGroup.length > 0;
    card.className = 'group-card' + (isPriorityGroup ? ' is-priority' : '');

    const dotColor = {
      a: 'var(--state-a)',
      b: 'var(--state-b)',
      cd: 'linear-gradient(135deg, var(--state-c), var(--state-d))',
      e: 'var(--state-e)'
    }[g.key];

    card.innerHTML = `
      <div class="group-card-header">
        <span class="group-card-dot" style="background: ${dotColor};"></span>
        <h4 class="group-card-title">${g.title}（${inGroup.length}）</h4>
      </div>
      <p class="group-card-desc">${g.desc}</p>
      <div class="group-themes">
        ${inGroup.length === 0
          ? '<span class="group-empty">該当するテーマはありません</span>'
          : inGroup.map(ts => `
              <span class="group-theme-chip">
                <span class="chip-num">${String(ts.theme.id).padStart(2, '0')}</span>
                ${ts.theme.name}
              </span>
            `).join('')
        }
      </div>
    `;
    groupsEl.appendChild(card);
  });

  // --- 次の一歩 ---
  const nextStepBody = document.getElementById('next-step-body');
  if (priorityMode === 'all-progressing') {
    nextStepBody.innerHTML = `
      気になるテーマを1つ選んで、信頼できる人と話してみませんか？<br>
      AIナビゲーターと、話す前の整理もできます。
    `;
  } else {
    nextStepBody.innerHTML = `
      まずは「<strong>${state.priorityTheme.name}</strong>」について、<br>
      最初に知るとよいこと・調べる入口・家族と話す前に考えておくことを、AIナビゲーターと整理してみませんか？
    `;
  }

  showView('result');
}

function restartDiagnosis() {
  startDiagnosis();
}

// ---------- AIナビゲーター（学ぶ入口の整理） ----------
// シナリオ：3つの問いかけ → 最初に知るとよいこと/調べる入口/家族と話す前に考えておくこと
const CHAT_SCENARIOS = {
  1: {
    intro: '「見守りと安否確認」について、最初に知るとよいことを一緒に整理しましょう。',
    steps: [
      { bot: 'まずお伺いします。「見守り」と聞いて、思い浮かぶイメージはどれに近いですか？',
        options: ['家族からの定期連絡', '機器・センサーによる見守り', '訪問してくれる人やサービス', 'まだイメージがわかない'] },
      { bot: 'ふだん一人で過ごす時間に、不安を感じる場面はありますか？',
        options: ['ある', 'たまにある', 'あまりない', '考えたことがなかった'] },
      { bot: 'もし誰かに見守ってもらうとしたら、どんな関わり方が心地よさそうですか？',
        options: ['日常的なやりとりがあるとよい', '機器中心で気軽な距離感がよい', '困った時だけ駆けつけてほしい', 'まだ分からない'] }
    ]
  },
  2: {
    intro: '「入院・手術のこと」について、最初に知るとよいことを一緒に整理しましょう。',
    steps: [
      { bot: '突然の入院、と聞いて、まず気になることは何ですか？',
        options: ['家族への連絡', '持ち物や日常の続き', '治療内容の決定', '費用のこと'] },
      { bot: '入院時に必要な保険証や常備薬リストの場所は、ご自身で把握できていますか？',
        options: ['しっかり把握している', 'だいたい分かる', 'あいまいかもしれない'] },
      { bot: 'もし治療方針の判断が必要な時、誰に相談したいですか？',
        options: ['配偶者・パートナー', '子ども・きょうだい', '信頼できる友人', 'まだ決めていない'] }
    ]
  },
  3: {
    intro: '「人生の最終段階の医療のこと」は、繊細なテーマですね。ゆっくり整理しましょう。',
    steps: [
      { bot: '人生の終盤の医療について、ご家族と話したことはありますか？',
        options: ['少し話したことがある', 'まだ話せていない', '話したいがきっかけがない'] },
      { bot: 'もしもの時、どこで・どんな過ごし方を望みますか？',
        options: ['住み慣れた場所で穏やかに', '病院で十分なケアを受けながら', '家族のそばで', '今は決められない'] },
      { bot: '延命治療について、いまの率直なお気持ちは？',
        options: ['できる限りの治療を望む', '自然なかたちで過ごしたい', '状況によって変わる', 'まだ考えていない'] }
    ]
  },
  4: {
    intro: '「資産とお金のこと」、まずは見える化のヒントを一緒に整理しましょう。',
    steps: [
      { bot: 'ご自身の資産（預貯金・保険・年金など）、全体像は見えていますか？',
        options: ['だいたい把握している', '一部だけ分かる', 'あまり整理できていない'] },
      { bot: 'もしもの時、ご家族はあなたの資産の場所をご存じですか？',
        options: ['伝えてある', 'たぶん分からない', '考えたことがなかった'] },
      { bot: 'これからの暮らしで、お金まわりで一番気になることは？',
        options: ['老後の生活費', '医療・介護への備え', '家族に残すこと', '寄付など社会への還元'] }
    ]
  },
  5: {
    intro: '「介護と住まいのこと」、これからの暮らし方のヒントを一緒に整理しましょう。',
    steps: [
      { bot: 'これからも、できれば暮らしたい場所はどこですか？',
        options: ['今の自宅', '子の近く', '高齢者向けの住まい', 'まだ決めていない'] },
      { bot: '介護が必要になった時、どんな方に支えてほしいですか？',
        options: ['家族中心で', 'プロの介護者中心で', '両方のバランスで', '考えたことがない'] },
      { bot: '介護保険のサービスについて、どのくらいご存じですか？',
        options: ['よく知っている', '名前は聞いたことがある', 'ほとんど知らない'] }
    ]
  },
  6: {
    intro: '「身元保証のこと」、選択肢を知るところから一緒に整理しましょう。',
    steps: [
      { bot: '入院や施設利用時の「身元保証人」について、考えたことはありますか？',
        options: ['ある', 'なんとなく気になっていた', '初めて考える'] },
      { bot: '頼めそうな身近な方はいらっしゃいますか？',
        options: ['家族にお願いできる', '親族・友人に相談したい', 'プロのサービスを検討したい'] },
      { bot: '身元保証サービス（民間・NPOなど）の存在は、ご存じでしたか？',
        options: ['知っていた', '聞いたことはある', '初めて知った'] }
    ]
  },
  7: {
    intro: '「判断力の衰えと認知症のこと」、やさしく、ゆっくり整理していきましょう。',
    steps: [
      { bot: '将来、判断力が衰えた時のことを、考えたことはありますか？',
        options: ['少し気になっている', 'できれば考えたくない', 'まだ実感がない'] },
      { bot: 'もしその時が来たら、誰にあなたの希望を伝えてほしいですか？',
        options: ['家族', '信頼できる友人・専門家', '事前に書き残した言葉', 'まだ決まっていない'] },
      { bot: 'ご自身の希望や好みを「書き残しておく」ことについては、どう感じますか？',
        options: ['やってみたい', 'なんとなく抵抗がある', '何を書けばいいか分からない'] }
    ]
  },
  8: {
    intro: '「後見人のこと」、制度の輪郭を知るところから一緒に整理しましょう。',
    steps: [
      { bot: '「後見人」という言葉に、どんな印象をお持ちですか？',
        options: ['頼れる存在', '少し堅いイメージ', 'よく知らない'] },
      { bot: 'もし任せるなら、どんな相手が安心ですか？',
        options: ['家族', '専門家（弁護士・司法書士）', '法人・団体', 'まだ分からない'] },
      { bot: '「任意後見契約」というしくみを、ご存じですか？',
        options: ['知っている', '聞いたことはある', '初めて知った'] }
    ]
  },
  9: {
    intro: '「死後の事務のこと」、全体像を知るところから一緒に整理しましょう。',
    steps: [
      { bot: '葬儀やお別れの形について、希望はありますか？',
        options: ['ある', 'なんとなくのイメージ', 'まだない'] },
      { bot: '死後の各種手続き（解約・連絡など）を頼める人は決まっていますか？',
        options: ['決まっている', '相談したい人はいる', 'まだ考えていない'] },
      { bot: 'もしものとき、最も大切にしたいことは？',
        options: ['家族の負担を減らす', '自分らしいお別れ', '社会への感謝を残す'] }
    ]
  },
  10: {
    intro: '「相続・遺言・寄付のこと」、基本のしくみを一緒に整理しましょう。',
    steps: [
      { bot: 'ご自身の財産を、どう引き継ぎたいか考えたことはありますか？',
        options: ['ある程度ある', 'なんとなくある', 'まだない'] },
      { bot: '残したい相手や、応援したい活動はありますか？',
        options: ['家族・親族', '友人・お世話になった方', '社会・団体への寄付', 'まだ決まっていない'] },
      { bot: '「遺言書」を書くことについては、どう感じますか？',
        options: ['書いてみたい', '少し抵抗がある', 'まだ早いと思う'] }
    ]
  }
};

function startChat() {
  state.chatStep = 0;
  // null-safe: priorityTheme が未設定なら最初のテーマにフォールバック
  if (!state.priorityTheme) {
    state.priorityTheme = THEMES[0];
  }
  const theme = state.priorityTheme;
  document.getElementById('chat-theme-title').textContent = `「${theme.name}」の学ぶ入口を、整理しましょう`;
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = '';
  document.getElementById('chat-input-area').innerHTML = '';

  showView('chat');

  const scenario = CHAT_SCENARIOS[theme.id];
  appendBotMessage(scenario.intro, () => {
    appendBotMessage('まずはいくつかの問いかけを通して、ご自身の現在地を見つけてみましょう。', () => {
      askNextQuestion();
    });
  });
}

function appendBotMessage(text, callback) {
  const win = document.getElementById('chat-window');

  const typing = document.createElement('div');
  typing.className = 'chat-message bot';
  typing.innerHTML = `
    <div class="chat-avatar">◐</div>
    <div class="chat-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>
  `;
  win.appendChild(typing);
  win.scrollTop = win.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const msg = document.createElement('div');
    msg.className = 'chat-message bot';
    msg.innerHTML = `
      <div class="chat-avatar">◐</div>
      <div class="chat-bubble">${text}</div>
    `;
    win.appendChild(msg);
    win.scrollTop = win.scrollHeight;
    if (callback) setTimeout(callback, 400);
  }, 700);
}

function appendUserMessage(text) {
  const win = document.getElementById('chat-window');
  const msg = document.createElement('div');
  msg.className = 'chat-message user';
  msg.innerHTML = `
    <div class="chat-avatar">🙂</div>
    <div class="chat-bubble">${text}</div>
  `;
  win.appendChild(msg);
  win.scrollTop = win.scrollHeight;
}

function askNextQuestion() {
  const theme = state.priorityTheme;
  const scenario = CHAT_SCENARIOS[theme.id];
  const step = scenario.steps[state.chatStep];

  if (!step) {
    showChatFinal();
    return;
  }

  appendBotMessage(step.bot, () => {
    const inputArea = document.getElementById('chat-input-area');
    inputArea.innerHTML = '';
    step.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option';
      btn.textContent = opt;
      btn.onclick = () => onChatOption(opt);
      inputArea.appendChild(btn);
    });
  });
}

function onChatOption(text) {
  appendUserMessage(text);
  document.getElementById('chat-input-area').innerHTML = '';

  const responses = [
    'お話しくださって、ありがとうございます。',
    '率直なお気持ち、大切にしてください。',
    'なるほど、教えていただきありがとうございます。',
    'そのお気持ち、よく分かります。'
  ];
  const response = responses[state.chatStep % responses.length];

  appendBotMessage(response, () => {
    state.chatStep++;
    askNextQuestion();
  });
}

function showChatFinal() {
  const theme = state.priorityTheme;

  appendBotMessage('お話しくださって、ありがとうございました。', () => {
    appendBotMessage(`それでは「${theme.name}」を学び始めるためのヒントを、3つの視点で整理しますね。`, () => {
      const win = document.getElementById('chat-window');
      const card = document.createElement('div');
      card.className = 'chat-final-card';
      card.innerHTML = `
        <p class="chat-final-label">LEARNING ENTRY POINTS</p>
        <h3 class="chat-final-title">「${theme.name}」を学ぶための、3つのヒント</h3>
        <div class="chat-final-items">
          <div class="chat-final-item">
            <span class="chat-final-icon">📖</span>
            <div class="chat-final-item-body">
              <p class="chat-final-item-label">最初に知るとよいこと</p>
              <p class="chat-final-item-text">${theme.whatToKnow}</p>
            </div>
          </div>
          <div class="chat-final-item">
            <span class="chat-final-icon">🔍</span>
            <div class="chat-final-item-body">
              <p class="chat-final-item-label">調べる入口</p>
              <p class="chat-final-item-text">${theme.whereToLearn}</p>
            </div>
          </div>
          <div class="chat-final-item">
            <span class="chat-final-icon">💭</span>
            <div class="chat-final-item-body">
              <p class="chat-final-item-label">家族と話す前に考えておくこと</p>
              <p class="chat-final-item-text">${theme.beforeFamily}</p>
            </div>
          </div>
        </div>
      `;
      win.appendChild(card);
      win.scrollTop = win.scrollHeight;

      // 別の優先テーマも提示する場合
      const others = state.priorityThemes.filter(t => t.id !== theme.id);
      const inputArea = document.getElementById('chat-input-area');
      let otherButtons = '';
      others.slice(0, 2).forEach(t => {
        otherButtons += `
          <button class="chat-option" onclick="switchPriorityTheme(${t.id})" style="text-align:center;">
            ${t.name} も整理する
          </button>
        `;
      });
      inputArea.innerHTML = `
        ${otherButtons}
        <button class="chat-option" onclick="showView('result')" style="text-align:center; font-weight:500; color: var(--sage-d);">
          結果画面に戻る
        </button>
        <button class="chat-option" onclick="showView('lp')" style="text-align:center;">
          トップへ戻る
        </button>
      `;
    });
  });
}

function switchPriorityTheme(themeId) {
  const t = THEMES.find(x => x.id === themeId);
  if (!t) return;
  state.priorityTheme = t;
  startChat();
}

// ---------- 初期化 ----------
document.addEventListener('DOMContentLoaded', () => {
  showView('lp');
});
