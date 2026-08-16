const STORAGE_KEY = "absurd-hypothesis-launchpad";

const axisPairs = [
  ["小さい", "大きい"],
  ["自由な", "縛られた"],
  ["初心者向け", "上級者向け"],
  ["高級な", "激安の"],
  ["硬い", "柔らかい"],
  ["速い", "遅い"],
  ["短い", "長い"],
  ["軽い", "重い"],
  ["静かな", "騒がしい"],
  ["一人用", "大勢用"],
  ["透明な", "見えない"],
  ["古い", "未来の"],
  ["手作りの", "完全自動の"],
  ["朝専用", "深夜専用"],
  ["屋内用", "屋外用"],
  ["無料の", "会員制の"],
  ["失敗前提の", "完璧主義の"],
  ["ローカルな", "世界同時の"],
  ["持ち運べる", "据え置きの"],
  ["秘密の", "公開された"],
  ["即席の", "熟成された"],
  ["地味な", "派手な"],
  ["親向け", "子ども向け"],
  ["匿名の", "実名の"],
  ["一瞬の", "一生続く"],
  ["無音の", "爆音の"],
  ["体内用", "街中用"],
  ["紙の", "AI化された"],
  ["低解像度の", "高解像度の"],
  ["やさしい", "スパルタな"],
  ["乾いた", "濡れた"],
  ["冷たい", "熱い"],
  ["触れる", "触れない"],
  ["借りる", "所有する"],
  ["減らす", "増やす"],
  ["眠い", "覚醒する"],
  ["見せびらかす", "隠す"],
  ["予約制の", "飛び入りの"],
  ["月額制の", "投げ銭制の"],
  ["修行用", "ご褒美用"],
];

const jumpPrompts = [
  "女子高生の間で流行するとしたら？",
  "海底に置かれたら？",
  "1秒でできるとしたら？",
  "100倍大きくなったら？",
  "完全無料になったら？",
  "100万人が同時に使うとしたら？",
  "総理大臣が使ったら？",
  "宇宙ステーションで必要になったら？",
  "駅前で配るとしたら？",
  "お守りとして売るとしたら？",
  "ゲーム化したら？",
  "音だけで成立するとしたら？",
  "匂いになったら？",
  "禁止されたら？",
  "親子で奪い合うとしたら？",
  "朝5時にだけ使えるとしたら？",
  "災害時に役立つとしたら？",
  "全部レンタル制だったら？",
  "推し活の道具になったら？",
  "海外観光客が買って帰るとしたら？",
  "社長室に必ず置くものになったら？",
  "コンビニのレジ横に並ぶとしたら？",
  "履歴書に書ける資格になったら？",
  "一度使うと二度と元に戻れないとしたら？",
];

const ideaTemplates = [
  "{base}プール",
  "{base}ガチャ",
  "{base}年パス",
  "{base}テイスティング",
  "{base}スタンプ",
  "{base}保険",
  "{base}神社",
  "{base}キット",
  "{base}試着室",
  "{base}検定",
  "{base}ホテル",
  "{base}交換所",
  "{base}クラブ",
  "{base}研究所",
  "{base}のサブスク",
  "{base}の通信講座",
  "{base}の自販機",
  "{base}の秘密基地",
  "{base}の卒業式",
  "{base}フェス",
  "{base}の救急箱",
  "{base}トレーニング",
  "{base}の福袋",
  "{base}カウンセリング",
];

const state = {
  theme: "",
  base: "",
  horizontal: axisPairs[0],
  vertical: axisPairs[1],
  axisHistory: [],
  ideas: [],
  view: "board",
  activeJumpId: null,
  activeJumpPrompt: "",
};

const els = {
  startScreen: document.querySelector("#startScreen"),
  workspace: document.querySelector("#workspace"),
  themeForm: document.querySelector("#themeForm"),
  themeInput: document.querySelector("#themeInput"),
  themeLabel: document.querySelector("#themeLabel"),
  backButton: document.querySelector("#backButton"),
  listMode: document.querySelector("#listMode"),
  undoAxisButton: document.querySelector("#undoAxisButton"),
  shuffleBothButton: document.querySelector("#shuffleBothButton"),
  shuffleHorizontalButton: document.querySelector("#shuffleHorizontalButton"),
  shuffleVerticalButton: document.querySelector("#shuffleVerticalButton"),
  boardView: document.querySelector("#boardView"),
  listView: document.querySelector("#listView"),
  axisTop: document.querySelector("#axisTop"),
  axisBottom: document.querySelector("#axisBottom"),
  axisLeft: document.querySelector("#axisLeft"),
  axisRight: document.querySelector("#axisRight"),
  matrix: document.querySelector("#matrix"),
  ideaList: document.querySelector("#ideaList"),
  emptyMessage: document.querySelector("#emptyMessage"),
  copyButton: document.querySelector("#copyButton"),
  clearButton: document.querySelector("#clearButton"),
  jumpDialog: document.querySelector("#jumpDialog"),
  jumpForm: document.querySelector("#jumpForm"),
  jumpSource: document.querySelector("#jumpSource"),
  jumpPrompt: document.querySelector("#jumpPrompt"),
  jumpInput: document.querySelector("#jumpInput"),
};

function boot() {
  clearSavedState();
  showStartScreen();
  bindEvents();
  render();
}

function bindEvents() {
  setMobileBoardHeight();
  window.addEventListener("resize", setMobileBoardHeight);
  window.visualViewport?.addEventListener("resize", setMobileBoardHeight);

  els.themeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const rawTheme = els.themeInput.value.trim() || "新しい豆腐の開発";
    state.theme = rawTheme;
    state.base = extractBase(rawTheme);
    state.axisHistory = [];
    randomizeHorizontalAxis();
    randomizeVerticalAxis();
    clearBoardInputs();
    showWorkspace();
    persist();
    render();
    resetScrollPosition();
  });

  els.backButton.addEventListener("click", () => {
    els.workspace.classList.add("is-hidden");
    els.startScreen.classList.remove("is-hidden");
    els.themeInput.value = state.theme;
    window.setTimeout(() => els.themeInput.focus(), 0);
  });

  els.undoAxisButton.addEventListener("click", () => {
    undoAxisChange();
  });

  els.shuffleBothButton.addEventListener("click", () => {
    rememberAxes();
    randomizeHorizontalAxis();
    randomizeVerticalAxis();
    persist();
    renderBoard();
  });

  els.shuffleHorizontalButton.addEventListener("click", () => {
    rememberAxes();
    randomizeHorizontalAxis();
    persist();
    renderBoard();
  });

  els.shuffleVerticalButton.addEventListener("click", () => {
    rememberAxes();
    randomizeVerticalAxis();
    persist();
    renderBoard();
  });

  els.listMode.addEventListener("click", () => {
    switchMode(state.view === "list" ? "board" : "list");
  });

  els.matrix.addEventListener("click", (event) => {
    const save = event.target.closest(".save-button");
    if (save) {
      const cell = save.closest(".cell");
      saveIdeaFromCell(cell);
    }
  });

  els.ideaList.addEventListener("click", (event) => {
    const deepen = event.target.closest("[data-deepen]");
    if (deepen) {
      openJump(deepen.dataset.deepen);
      return;
    }

    const remove = event.target.closest("[data-delete]");
    if (remove) {
      state.ideas = state.ideas.filter((idea) => idea.id !== remove.dataset.delete);
      persist();
      renderList();
    }
  });

  els.copyButton.addEventListener("click", async () => {
    const text = state.ideas.map(formatIdeaForCopy).join("\n");
    if (!text) return;
    await copyText(text);
    pulseButton(els.copyButton, "コピー済み");
  });

  els.clearButton.addEventListener("click", () => {
    if (!state.ideas.length) return;
    state.ideas = [];
    persist();
    renderList();
  });

  els.jumpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    if (submitter?.value !== "ok") {
      els.jumpDialog.close();
      return;
    }

    const text = els.jumpInput.value.trim();
    if (!text) {
      els.jumpInput.focus();
      return;
    }

    const source = state.ideas.find((idea) => idea.id === state.activeJumpId);
    addIdea({
      text,
      hypothesis: source?.hypothesis || "",
      prompt: state.activeJumpPrompt,
      parent: source?.text || "",
    });
    els.jumpDialog.close();
    switchMode("list");
  });
}

function showWorkspace() {
  els.startScreen.classList.add("is-hidden");
  els.workspace.classList.remove("is-hidden");
  setMobileBoardHeight();
  resetScrollPosition();
}

function showStartScreen() {
  els.workspace.classList.add("is-hidden");
  els.startScreen.classList.remove("is-hidden");
  els.themeInput.value = "";
}

function switchMode(mode) {
  const isBoard = mode === "board";
  state.view = mode;
  els.boardView.classList.toggle("is-hidden", !isBoard);
  els.listView.classList.toggle("is-hidden", isBoard);
  els.listMode.textContent = isBoard ? "リスト" : "発射台";
  setAxisControlsEnabled(isBoard);
  persist();
  if (isBoard) renderBoard();
  if (!isBoard) renderList();
  if (isBoard) {
    setMobileBoardHeight();
    resetScrollPosition();
  }
}

function resetScrollPosition() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
  window.setTimeout(() => window.scrollTo(0, 0), 80);
}

function setMobileBoardHeight() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const topbarHeight = els.workspace.classList.contains("is-hidden")
    ? 38
    : Math.ceil(document.querySelector(".topbar")?.getBoundingClientRect().height || 38);
  const boardHeight = Math.max(420, Math.min(viewportHeight - topbarHeight, 560));
  document.documentElement.style.setProperty("--mobile-board-height", `${boardHeight}px`);
}

function setAxisControlsEnabled(enabled) {
  els.shuffleBothButton.disabled = !enabled;
  els.shuffleHorizontalButton.disabled = !enabled;
  els.shuffleVerticalButton.disabled = !enabled;
  updateUndoAxisButton();
}

function render() {
  els.themeInput.value = state.theme;
  els.themeLabel.textContent = state.theme || "新しい○○の開発";
  switchMode("board");
  renderBoard();
  renderList();
}

function renderBoard() {
  els.themeLabel.textContent = state.theme;
  updateUndoAxisButton();
  els.axisLeft.textContent = state.horizontal[0];
  els.axisRight.textContent = state.horizontal[1];
  els.axisBottom.textContent = state.vertical[0];
  els.axisTop.textContent = state.vertical[1];

  const combos = [
    [state.horizontal[0], state.vertical[1]],
    [state.horizontal[1], state.vertical[1]],
    [state.horizontal[0], state.vertical[0]],
    [state.horizontal[1], state.vertical[0]],
  ];

  document.querySelectorAll(".cell").forEach((cell, index) => {
    const [x, y] = combos[index];
    const hypothesis = buildHypothesis(x, y, state.base);
    cell.dataset.hypothesis = hypothesis;
    cell.querySelector(".hypothesis-pill").textContent = hypothesis;
  });
}

function clearBoardInputs() {
  document.querySelectorAll(".idea-input").forEach((input) => {
    input.value = "";
    input.placeholder = "";
  });
}

function renderList() {
  els.ideaList.innerHTML = "";
  els.emptyMessage.classList.toggle("is-hidden", state.ideas.length > 0);

  state.ideas.forEach((idea) => {
    const item = document.createElement("li");
    item.className = "idea-item";
    item.innerHTML = `
      <div class="idea-text">
        <p class="idea-main"></p>
        <p class="idea-meta"></p>
      </div>
      <button class="primary-button small" type="button" data-deepen="${idea.id}">深める</button>
      <button class="delete-button" type="button" data-delete="${idea.id}" aria-label="削除">×</button>
    `;
    item.querySelector(".idea-main").textContent = idea.text;
    item.querySelector(".idea-meta").textContent = idea.prompt
      ? `${idea.parent} → ${idea.prompt}`
      : idea.hypothesis;
    els.ideaList.append(item);
  });
}

function saveIdeaFromCell(cell) {
  if (!cell) return;
  const input = cell.querySelector(".idea-input");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  addIdea({
    text,
    hypothesis: cell.dataset.hypothesis,
    prompt: "",
    parent: "",
  });
  input.value = "";
  renderBoard();
  pulseButton(cell.querySelector(".save-button"), "保存済み");
}

function addIdea(idea) {
  state.ideas.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...idea,
  });
  persist();
  renderList();
}

function openJump(id) {
  const idea = state.ideas.find((entry) => entry.id === id);
  if (!idea) return;
  state.activeJumpId = id;
  state.activeJumpPrompt = pick(jumpPrompts);
  els.jumpSource.textContent = `『${idea.text}』`;
  els.jumpPrompt.textContent = state.activeJumpPrompt;
  els.jumpInput.value = "";
  els.jumpDialog.showModal();
  window.setTimeout(() => els.jumpInput.focus(), 0);
}

function randomizeHorizontalAxis() {
  let next = pick(axisPairs);
  while (sameAxis(next, state.vertical) || sameAxis(next, state.horizontal)) {
    next = pick(axisPairs);
  }
  state.horizontal = randomOrientation(next);
}

function randomizeVerticalAxis() {
  let next = pick(axisPairs);
  while (sameAxis(next, state.horizontal) || sameAxis(next, state.vertical)) {
    next = pick(axisPairs);
  }
  state.vertical = randomOrientation(next);
}

function rememberAxes() {
  state.axisHistory.push({
    horizontal: [...state.horizontal],
    vertical: [...state.vertical],
  });
}

function undoAxisChange() {
  const previous = state.axisHistory.pop();
  if (!previous) return;

  state.horizontal = previous.horizontal;
  state.vertical = previous.vertical;
  persist();
  renderBoard();
}

function updateUndoAxisButton() {
  els.undoAxisButton.disabled = state.view !== "board" || state.axisHistory.length === 0;
}

function sameAxis(a, b) {
  return a.includes(b[0]) && a.includes(b[1]);
}

function randomOrientation(pair) {
  return Math.random() > 0.5 ? [pair[1], pair[0]] : [...pair];
}

function buildHypothesis(x, y, base) {
  return `${x}＆${y}　${base}`;
}

function modifierPhrase(modifier, base) {
  const needsNoJoin = /[いなのたるす]$/.test(modifier);
  const join = needsNoJoin ? "" : "の";
  return `${modifier}${join}${base}`;
}

function suggestIdea(index, x, y) {
  const seed =
    x.length * 17 +
    y.length * 31 +
    state.base.length * 13 +
    index * 7 +
    state.ideas.length;
  const template = ideaTemplates[seed % ideaTemplates.length];
  return template.replaceAll("{base}", state.base);
}

function extractBase(theme) {
  let base = theme
    .replace(/[「」『』]/g, "")
    .replace(/^全く/, "")
    .replace(/^まったく/, "")
    .replace(/^新しい/, "")
    .replace(/^新たな/, "")
    .replace(/について$/, "")
    .replace(/を考える$/, "")
    .replace(/をつくる$/, "")
    .replace(/を作る$/, "")
    .replace(/の開発$/, "")
    .replace(/開発$/, "")
    .replace(/企画$/, "")
    .replace(/サービス$/, "サービス")
    .trim();

  base = base.replace(/^の/, "").trim();
  return base || "○○";
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function pulseButton(button, label) {
  if (!button) return;
  const original = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, 900);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the local-file friendly fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function formatIdeaForCopy(idea, index) {
  const lines = [`${index + 1}. ${idea.text}`];
  if (idea.hypothesis) lines.push(`   仮説: ${idea.hypothesis}`);
  if (idea.prompt) lines.push(`   深める: ${idea.prompt}`);
  if (idea.parent) lines.push(`   元案: ${idea.parent}`);
  return lines.join("\n");
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      theme: state.theme,
      base: state.base,
      horizontal: state.horizontal,
      vertical: state.vertical,
      axisHistory: state.axisHistory,
      ideas: state.ideas,
      view: state.view,
    }),
  );
}

function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors so the tool can still run in strict browsers.
  }
}

boot();
