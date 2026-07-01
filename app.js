// ============================================================
// Trust Design Navi — Prototype Logic
// ============================================================

// ---------- データ：6テーマ（v7.5） ----------
// 各テーマに「最初に知るとよいこと」「調べる入口」「話す前に考えておくこと」を持つ。
// v7 までの旧 10 テーマを 6 テーマに統合し、`beforeFamily` を `beforeTalking` に改名。
// 詳細は docs/THEMES_DRAFT.md を参照。
const THEMES = [
  {
    id: 1,
    name: '医療と判断力の備え',
    desc: '突然の入院や手術、人生の最終段階の医療、判断力が衰えた時の備えについて、今の状態に近いものを選んでください。',
    priorityHint: '医療の意思決定は、判断力があるうちに考えておくほど、ご自身の希望が尊重されやすくなります。',
    whatToKnow: '入院・手術や延命治療、認知症などで判断力が低下すると、契約や治療方針の決定が難しくなります。「ACP（人生会議）」「事前指示書」「医療代理人」などのしくみを使えば、判断力があるうちに、希望や代わって話す人を決めておけます。代理人は家族でなくてもかまいません。',
    whereToLearn: '厚生労働省「人生会議（ACP）」サイト／日本臨床倫理学会の事前指示書サンプル／お住まいの自治体の終末期医療パンフレット／医療機関に「ACP相談」窓口があるか確認。',
    beforeTalking: '「もしも自分で言葉にできない時」に、誰に・どんな価値観で代わって話してほしいか。譲れない大切なことを3つだけ挙げてみる。家族・友人・医療職、誰でも代理人にできます。'
  },
  {
    id: 2,
    name: '介護・住まい・見守り',
    desc: '介護が必要になった時の住まい方や、ふだんの見守り体制について、今の状態に近いものを選んでください。',
    priorityHint: '介護保険・住まいの段階・見守りサービスを知ると、家族に頼り切らない選択肢が見えてきます。',
    whatToKnow: '介護保険は65歳から（条件によって40歳から）利用できます。要介護認定を受けると、訪問介護や施設サービスを1〜3割負担で使えます。住まいは在宅・サ高住・有料老人ホーム・特養と段階があり、見守りも「家族中心」「センサー型」「訪問サービス」など、複数を組み合わせて選べます。',
    whereToLearn: '地域包括支援センター（無料相談）／自治体の介護保険パンフレット／民間の見守りサービス比較サイト／施設の見学・体験。ケアマネジャーとの早めの面談が、判断の質を上げます。',
    beforeTalking: 'どこで・どんな暮らしを続けたいか。誰と・どのくらいの距離感で関わってほしいか。家族の生活と両立できるか、難しければ誰のサポートを使うか。希望の方向性を3つに整理してみる。'
  },
  {
    id: 3,
    name: '資産とお金',
    desc: '預貯金・年金・保険など、お金まわりの整理について、今の状態に近いものを選んでください。',
    priorityHint: '「何が・どこに・いくらあるか」の見える化が、判断と託しの土台になります。',
    whatToKnow: '資産には預貯金・年金・保険・不動産・有価証券・デジタル資産があります。それぞれ「ありか」が分からないと、もしもの時に取り出せない／継承できないことが多いです。FP（ファイナンシャル・プランナー）に有料相談すると、家計と老後設計を中立的に見てもらえます。複数の専門家の話を比較するのがおすすめです。',
    whereToLearn: '金融機関の「エンディングノート」／日本FP協会の無料相談会／自治体の「くらしとお金」相談／信託銀行の遺言信託無料セミナー。',
    beforeTalking: '通帳・証券・保険証券の「ありか」を、自分自身が把握できているか確認。詳細を共有する前に、まずは存在のリストアップから。誰に何を伝えるか、伝える相手は家族とは限りません。'
  },
  {
    id: 4,
    name: '家族以外の支援',
    desc: '入院・施設入所時の身元保証、判断力が衰えた時の支援、死後の事務など、家族以外も含めた支援の備えについて、今の状態に近いものを選んでください。',
    priorityHint: '家族の有無に関わらず、自分の意思を支えてくれる仕組みがあります。任意後見・死後事務委任・終身サポート事業など、選択肢を知ることから。',
    whatToKnow: '任意後見契約、死後事務委任契約などをワンストップで引き受ける「高齢者等終身サポート事業者」が、特に子のいない世帯や単身世帯にとって現実的な選択肢になりつつあります。現時点では参入障壁が低いことで、悪質業者によるトラブルの増加が懸念されており、2024年に国（法務省）がガイドラインを示し、2025年8月には日本初の業界団体「全国高齢者等終身サポート事業者協会（全終協）」が設立されるなど、健全化の動きがいま本格化しています。',
    whereToLearn: '公証役場の任意後見契約案内／法務省の高齢者等終身サポート事業者ガイドライン（2024年）／日本初の業界団体「全国高齢者等終身サポート事業者協会（全終協）」の優良事業者認定・通報窓口（zenshukyo.org）／日本弁護士連合会の任意後見・死後事務相談／お住まいの社会福祉協議会／消費生活センター。',
    beforeTalking: '家族・親族・友人・専門家・サービス事業者、それぞれを「頼める／頼めない」「頼みたい／頼みたくない」で整理してみる。終身サポート事業者を選ぶ際は、料金体系の透明性、第三者監督の有無、契約解除のしやすさが見極めポイント。なお、利用者からの財産寄付（遺贈）を受け付けている事業者は、支援者が受益者を兼ねる構造的な利益相反になりえます。善意の事業者であっても、この構造があることは認識した上で選びましょう。'
  },
  {
    id: 5,
    name: '死後の手続きと相続',
    desc: '葬儀・お墓・死後の各種手続き、そして財産の引き継ぎや遺言・寄付について、今の状態に近いものを選んでください。',
    priorityHint: '死後の手続きは想像以上に多いです。引き継ぎたい人・残したい想いを、自分の言葉で残せる方法があります。',
    whatToKnow: '死後には葬儀・火葬・年金停止・健康保険返却・公共料金解約・各種SNS停止など多くの事務があります。遺言書がない場合、財産は法定相続人に法定割合で分けられます。遺言（自筆／公正証書）で希望を反映でき、相続人以外への遺贈や、社会への寄付（遺贈寄付）も可能です。家族に手続きを背負わせない方法として死後事務委任契約もあり、終身サポート事業者がこれを引き受けるケースが増えています（テーマ4参照）。',
    whereToLearn: '法務局の自筆証書遺言保管制度（手数料3,900円で安全に保管）／公証役場の公正証書遺言相談／法テラスの無料法律相談／日本承継寄付協会など寄付の専門窓口／自治体の「おくやみハンドブック」。',
    beforeTalking: '葬儀の形・お墓の方向性・連絡してほしい人。「誰に何を残したいか」「残さないものは何か」「社会に還したい想いはあるか」。なお、死後事務を引き受ける事業者が遺贈寄付の受取先を兼ねる場合は、支援者と受益者が同一になる利益相反構造があります。寄付の意思があるなら、寄付先と死後事務の依頼先は分けて考えるのが原則です。'
  },
  {
    id: 6,
    name: 'デジタル資産・SNS・暗号資産',
    desc: 'スマホ・パソコン・SNSアカウント・暗号資産など、デジタル領域の備えについて、今の状態に近いものを選んでください。',
    priorityHint: '紙の遺言や従来の終活では扱いきれない領域です。元気なうちの棚卸しが、大きな違いを生みます。',
    whatToKnow: 'デジタル資産には、スマホ・PCのロック、各種オンラインサービスのログイン情報、SNSアカウント、サブスクリプション、デジタル写真・動画、ネット銀行・証券、そして暗号資産（仮想通貨）が含まれます。本人以外がアクセスできないと、解約も継承もできず「デジタル遺品」として残ります。SNSは死後に「追悼アカウント化」「削除依頼」など各社対応が異なります。暗号資産は秘密鍵・シードフレーズを失うと、永久に取り戻せません。',
    whereToLearn: 'デジタル庁「デジタル遺品」ガイド／総務省「デジタル遺品に関する周知資料」／各SNSのヘルプセンターで死後対応ページ（X・Meta・Google・LINE）／行政書士・司法書士の「デジタル遺品整理」サービス比較。暗号資産は信頼できる専門家（まだ少ない）に有料相談を推奨。',
    beforeTalking: '自分が使っているデジタルサービスを書き出してみる（驚くほど多いはずです）。「本人以外にアクセスできないと困るもの」「死後に削除してほしいもの」「家族に見られたくないもの」を3つに分けてみる。秘密鍵やシードフレーズは、紙のメモやハードウェアウォレットで本体を別保管するのが原則。「ありかのメモ」と「本体」は分けて伝えます。'
  },
];

// ---------- データ：親をサポートする視点 ----------
// 各テーマと対応する、親世代の終活サポート視点のヒント。
// Phase 2 で Task 11（診断前提ヒアリング）と連動し、親サポート世代と回答したユーザーのみ表示する想定。
const PARENT_SUPPORT_HINTS = {
  1: '親のACPは、元気なうちに「もしもの時の希望」を3つだけでも聞いておく。意思を文字に残すきっかけは本人からは出にくいので、こちらから機会を作る。',
  2: '親の住まいや見守りは、まず地域包括支援センターに親本人と一緒に行ってみる。要介護認定の前から相談できる。早めに「顔の見える関係」を作っておくと、緊急時に動きやすい。',
  3: '親の資産は、いきなり全体を聞き出そうとしない。「どこの銀行を使っているか」「主治医は誰か」など、ありかの情報から少しずつ。金額の話は最後で十分。',
  4: '親が一人暮らしや高齢夫婦のみ世帯なら、入院・施設入所時の身元保証をどうするか、判断力があるうちに一緒に考える。任意後見契約は元気なうちにしか結べない。終身サポート事業者の検討も、悪質業者リスクを理解した上で、複数を比較する。',
  5: '親が遺言書を書いていないことが大半。重い話に聞こえないように、「法務局で安全に保管できる制度ができたよ」のような中立的な情報共有から始める。葬儀の希望も、形式ばらず「あなたは静かなお別れがいい？にぎやかなのがいい？」程度から。',
  6: '親のスマホ・PCのロック解除方法、利用しているサービス、サブスクは、本人が把握できなくなる前にメモを残してもらう。デジタル遺品整理は本人不在では極めて困難。「スマホの暗証番号、メモしてある？」の一言から始められる。'
};

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
      最初に知るとよいこと・調べる入口・話す前に考えておくことを、AIナビゲーターと整理してみませんか？
    `;
  }

  // v7.5: 診断結果を保存（ログイン時はSupabase、未ログイン時はlocalStorage）
  // 履歴からの再表示時（_skipSave=true）は保存しない
  if (!state._skipSave && window.TDN && window.TDN.db && window.TDN.db.saveDiagnosis) {
    window.TDN.db.saveDiagnosis({
      answers: [...state.answers],
      priorityThemeId: state.priorityTheme ? state.priorityTheme.id : null,
      priorityThemeIds: (state.priorityThemes || []).map(t => t.id)
    }).catch(err => console.warn('診断結果の保存でエラー:', err));
  }

  showView('result');
}

function restartDiagnosis() {
  startDiagnosis();
}

// ---------- AIナビゲーター（学ぶ入口の整理） ----------
// シナリオ：3つの問いかけ → 最初に知るとよいこと／調べる入口／話す前に考えておくこと
const CHAT_SCENARIOS = {
  1: {
    intro: '「医療と判断力の備え」について、最初に知るとよいことを一緒に整理しましょう。',
    steps: [
      { bot: 'もしも自分で治療方針を判断できない状態になった時、まず気になることはどれですか？',
        options: ['誰に代わって話してほしいか', 'どんな治療を望むか（延命の是非など）', '自分の意思をどう伝え残すか', 'まだイメージが湧かない'] },
      { bot: '医療の意思決定を「誰に託すか」と考えた時、いま思い浮かぶ相手はどれに近いですか？',
        options: ['親族（配偶者・子・きょうだい・甥姪など）', '士業の専門家（弁護士・司法書士・行政書士など）', '知人・友人', '専業事業者（高齢者等終身サポート事業者・社会福祉協議会など）'] },
      { bot: '「ACP（人生会議）」や「事前指示書」というしくみを、ご存じでしたか？',
        options: ['知っていて、書いたことがある', '名前は知っているが、まだ書いていない', '名前は聞いたことがある', '初めて知った'] }
    ]
  },
  2: {
    intro: '「介護・住まい・見守り」について、これからの暮らし方のヒントを一緒に整理しましょう。',
    steps: [
      { bot: 'これからも、できれば暮らしたい場所はどこですか？',
        options: ['今の自宅', '家族の近く', '高齢者向けの住まい（サ高住・有料老人ホームなど）', 'まだ決めていない'] },
      { bot: '介護が必要になった時、支えてほしい相手として思い浮かぶのは？',
        options: ['家族が中心', 'プロの介護者・サービスが中心', '家族とプロのバランスで', '家族に頼るのは難しい／決めていない'] },
      { bot: '介護保険制度や地域包括支援センターについて、どのくらいご存じですか？',
        options: ['よく知っていて活用している', '名前を聞いたことがある', 'ほとんど知らない', '親のことで少し関わったことがある'] }
    ]
  },
  3: {
    intro: '「資産とお金」について、まずは見える化のヒントを一緒に整理しましょう。',
    steps: [
      { bot: 'ご自身の資産（預貯金・保険・年金など）、全体像は見えていますか？',
        options: ['だいたい把握している', '主要なものは分かる', 'あいまいな部分がある', '整理できていない'] },
      { bot: 'もしもの時、あなたの資産の「ありか」を知る人はいますか？',
        options: ['伝えている人がいる', '一部の情報を伝えている', 'まだ伝えていない', '伝える相手を決めかねている'] },
      { bot: 'これからの暮らしで、お金まわりで一番気になることは？',
        options: ['老後の生活費', '医療・介護への備え', '誰に何を残すか（または残さない選択）', '社会への寄付・還元'] }
    ]
  },
  4: {
    intro: '「家族以外の支援」、選択肢を知るところから一緒に整理しましょう。',
    steps: [
      { bot: 'もし入院や施設入所で身元保証人が必要になった時、誰に頼むことをイメージしますか？',
        options: ['親族（配偶者・子・きょうだい・甥姪など）', '士業の専門家（弁護士・司法書士・行政書士など）', '知人・友人', '専業事業者（高齢者等終身サポート事業者・社会福祉協議会など）'] },
      { bot: '「任意後見契約」や「死後事務委任契約」というしくみを、ご存じですか？',
        options: ['知っていて、検討中または契約済み', '名前を聞いたことがある', '初めて聞いた', '内容が難しくてよく分からない'] },
      { bot: '「高齢者等終身サポート事業者」の存在は、ご存じでしたか？国が2024年にガイドラインを示すなど、業界整備がいま進んでいる領域です。',
        options: ['検討したい／検討している', '名前を聞いたことがある', '初めて知った', '内容が難しくてまだ判断できない'] }
    ]
  },
  5: {
    intro: '「死後の手続きと相続」、基本のしくみを一緒に整理しましょう。',
    steps: [
      { bot: 'ご自身が亡くなった後の手続き（葬儀・解約・連絡など）、どのくらいイメージできていますか？',
        options: ['具体的にイメージできている', 'ぼんやりとイメージがある', '全体像がまだ見えていない', '手続きを頼める人が思い浮かばない'] },
      { bot: 'ご自身の財産を、どう引き継ぎたいか考えたことはありますか？',
        options: ['引き継ぎ先を決めている', 'なんとなく方向性がある', 'まだ考えていない', '引き継ぎたい家族が少ない／いない'] },
      { bot: '遺言書や遺贈寄付について、どう感じますか？',
        options: ['書いてみたい／興味がある', '少し抵抗がある', 'まだ早いと思う', '社会への寄付にも関心がある'] }
    ]
  },
  6: {
    intro: '「デジタル資産・SNS・暗号資産」の備え、いまの状況を一緒に整理しましょう。',
    steps: [
      { bot: 'ご自身のスマホやPCのロック、いざという時に誰かが解除できる仕組みはありますか？',
        options: ['信頼できる人に解除方法を伝えている', 'メモを残しているが、保管場所は本人のみ知る', 'まだ何もしていない', '家族に見られたくない気持ちが強い'] },
      { bot: 'SNSアカウントの死後対応（追悼アカウント化・削除依頼など）について、考えたことはありますか？',
        options: ['各サービスの対応を調べたことがある', '気になっているが調べていない', '考えたことがなかった', 'SNSはほとんど使っていない'] },
      { bot: '暗号資産（仮想通貨）をお持ちですか？また、託し方について考えたことは？',
        options: ['持っていて、託し方も考えている', '持っているが、託し方は未検討', '持っていない', '持っているかどうか不明（相続時など）'] }
    ]
  },
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
              <p class="chat-final-item-label">話す前に考えておくこと</p>
              <p class="chat-final-item-text">${theme.beforeTalking}</p>
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

// ---------- 診断履歴（v7.5 追加） ----------
async function showHistoryView() {
  showView('history');
  const listEl = document.getElementById('history-list');
  if (!listEl) return;
  listEl.innerHTML = '<p class="history-loading">読み込み中…</p>';

  if (!window.TDN || !window.TDN.db || !window.TDN.db.listMyDiagnoses) {
    renderHistoryEmpty(listEl, '診断履歴機能がまだ読み込まれていません。少し待ってから再度お試しください。');
    return;
  }

  let records = [];
  try {
    records = await window.TDN.db.listMyDiagnoses();
  } catch (e) {
    console.error('診断履歴の取得エラー:', e);
    renderHistoryEmpty(listEl, '診断履歴の取得に失敗しました。時間をおいて再度お試しください。');
    return;
  }

  if (!records || records.length === 0) {
    listEl.innerHTML = `
      <div class="history-empty">
        <p class="history-empty-icon">🌱</p>
        <p class="history-empty-title">まだ診断履歴がありません</p>
        <p class="history-empty-desc">
          診断を受けると、ここに履歴が保存されます。<br>
          ログインしている場合はクラウドに、そうでない場合はこの端末に保存されます。
        </p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = records.map(renderHistoryItem).join('');
}

function renderHistoryEmpty(el, message) {
  el.innerHTML = `<p class="history-empty">${escapeHtmlForHistory(message)}</p>`;
}

function renderHistoryItem(record) {
  const date = new Date(record.created_at);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  const data = record.data || {};
  const priorityId = data.priorityThemeId;
  const priorityTheme = priorityId ? THEMES.find(t => t.id === priorityId) : null;
  const priorityName = priorityTheme ? priorityTheme.name : '（優先テーマなし）';
  const isLocal = typeof record.id === 'string' && record.id.startsWith('local_');
  const badgeHtml = isLocal
    ? '<span class="history-item-badge">この端末に保存</span>'
    : '<span class="history-item-badge history-item-badge-cloud">クラウド</span>';
  const escId = String(record.id).replace(/'/g, "\\'").replace(/"/g, '&quot;');

  return `
    <button class="history-item" onclick="viewDiagnosisFromHistory('${escId}')">
      <div class="history-item-main">
        <div class="history-item-header">
          <span class="history-item-date">${dateStr}</span>
          ${badgeHtml}
        </div>
        <p class="history-item-priority">
          <span class="history-item-label">優先テーマ：</span>${escapeHtmlForHistory(priorityName)}
        </p>
      </div>
      <span class="history-item-arrow">→</span>
    </button>
  `;
}

async function viewDiagnosisFromHistory(recordId) {
  if (!window.TDN || !window.TDN.db || !window.TDN.db.getDiagnosis) return;

  let record = null;
  try {
    record = await window.TDN.db.getDiagnosis(recordId);
  } catch (e) {
    console.error('診断の取得エラー:', e);
  }

  if (!record || !record.data) {
    alert('この診断結果を読み込めませんでした。');
    return;
  }

  const stored = record.data;

  // テーマ構成のバージョンチェック（将来の互換性のため）
  if (stored.themeVersion && stored.themeVersion !== 'v7.5') {
    alert('この診断は古いテーマ構成で作成されているため、現在の画面では表示できません。');
    return;
  }

  // 保存された回答を state に復元し、結果画面を再表示（保存はしない）
  if (!Array.isArray(stored.answers) || stored.answers.length !== THEMES.length) {
    alert('この診断結果のデータが不完全です。');
    return;
  }

  state.answers = [...stored.answers];
  state._skipSave = true;
  try {
    finishDiagnosis();
  } finally {
    state._skipSave = false;
  }
}

function escapeHtmlForHistory(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------- 初期化 ----------
document.addEventListener('DOMContentLoaded', () => {
  showView('lp');
});
