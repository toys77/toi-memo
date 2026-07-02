"use strict";

const STORAGE_KEYS = {
  notes: "toiMemo.notes",
  theme: "toiMemo.theme",
  seeded: "toiMemo.seeded"
};

const CATEGORIES = ["全部", "アイデア", "就活", "授業", "バンド", "創作", "ゲーム", "日記", "その他"];
const EDIT_CATEGORIES = CATEGORIES.filter((category) => category !== "全部");
const PRIORITIES = ["低", "中", "高"];
const PRIORITY_SCORE = { "高": 3, "中": 2, "低": 1 };

const state = {
  notes: [],
  selectedId: null,
  activeCategory: "全部",
  searchQuery: "",
  sortMode: "pinned",
  isEditorOpen: true,
  autoSaveTimer: null,
  isDirty: false,
  toastTimer: null
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

// 起動時にDOM取得、保存データ読み込み、初回サンプル投入をまとめて行います。
function init() {
  cacheDom();
  setupCategoryOptions();
  bindEvents();
  applyTheme(loadTheme());
  loadNotes();
  state.isEditorOpen = !isSmallScreen();
  renderCategoryFilters();
  selectInitialNote();
  renderAll();
}

// DOM参照を1か所に集めると、HTML側のid変更にも対応しやすくなります。
function cacheDom() {
  dom.body = document.body;
  dom.themeToggle = document.getElementById("themeToggle");
  dom.exportButton = document.getElementById("exportButton");
  dom.importInput = document.getElementById("importInput");
  dom.newNoteButton = document.getElementById("newNoteButton");
  dom.searchInput = document.getElementById("searchInput");
  dom.sortSelect = document.getElementById("sortSelect");
  dom.categoryFilters = document.getElementById("categoryFilters");
  dom.notesGrid = document.getElementById("notesGrid");
  dom.emptyState = document.getElementById("emptyState");
  dom.noteCount = document.getElementById("noteCount");
  dom.editorPanel = document.getElementById("editorPanel");
  dom.editorClosedState = document.getElementById("editorClosedState");
  dom.noteForm = document.getElementById("noteForm");
  dom.editorHeading = document.getElementById("editorHeading");
  dom.saveState = document.getElementById("saveState");
  dom.closeEditorButton = document.getElementById("closeEditorButton");
  dom.titleInput = document.getElementById("titleInput");
  dom.bodyInput = document.getElementById("bodyInput");
  dom.categorySelect = document.getElementById("categorySelect");
  dom.prioritySelect = document.getElementById("prioritySelect");
  dom.tagsInput = document.getElementById("tagsInput");
  dom.pinnedInput = document.getElementById("pinnedInput");
  dom.favoriteInput = document.getElementById("favoriteInput");
  dom.createdAtText = document.getElementById("createdAtText");
  dom.updatedAtText = document.getElementById("updatedAtText");
  dom.charCount = document.getElementById("charCount");
  dom.deleteButton = document.getElementById("deleteButton");
  dom.toast = document.getElementById("toast");
}

function setupCategoryOptions() {
  dom.categorySelect.innerHTML = EDIT_CATEGORIES.map((category) => (
    `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
  )).join("");
}

// 入力欄は自動保存、一覧やカテゴリはクリックで状態更新する構成です。
function bindEvents() {
  dom.newNoteButton.addEventListener("click", createNote);
  dom.themeToggle.addEventListener("click", toggleTheme);
  dom.exportButton.addEventListener("click", exportNotes);
  dom.importInput.addEventListener("change", importNotes);

  dom.searchInput.addEventListener("input", () => {
    state.searchQuery = dom.searchInput.value.trim().toLowerCase();
    renderNotes();
  });

  dom.sortSelect.addEventListener("change", () => {
    state.sortMode = dom.sortSelect.value;
    renderNotes();
  });

  dom.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.activeCategory = button.dataset.category;
    renderCategoryFilters();
    renderNotes();
  });

  dom.notesGrid.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleCardAction(actionButton);
      return;
    }

    const card = event.target.closest("[data-note-id]");
    if (card) {
      selectNote(card.dataset.noteId);
    }
  });

  dom.noteForm.addEventListener("submit", (event) => event.preventDefault());
  dom.closeEditorButton.addEventListener("click", closeEditor);
  dom.deleteButton.addEventListener("click", deleteSelectedNote);
  window.addEventListener("resize", updateEditorShell);

  const autoSaveTargets = [
    dom.titleInput,
    dom.bodyInput,
    dom.categorySelect,
    dom.prioritySelect,
    dom.tagsInput,
    dom.pinnedInput,
    dom.favoriteInput
  ];

  autoSaveTargets.forEach((element) => {
    element.addEventListener("input", scheduleAutoSave);
    element.addEventListener("change", scheduleAutoSave);
  });
}

// localStorageにデータがなければ、初回だけサンプルメモを入れます。
function loadNotes() {
  const stored = localStorage.getItem(STORAGE_KEYS.notes);
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded) === "true";

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state.notes = normalizeImportedNotes(parsed);
      return;
    } catch (error) {
      console.warn("TOI MEMO: 保存データを読み込めませんでした。", error);
    }
  }

  if (!seeded) {
    state.notes = createSampleNotes();
    saveNotes(false);
    localStorage.setItem(STORAGE_KEYS.seeded, "true");
  } else {
    state.notes = [];
  }
}

function saveNotes(showMessage = true) {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notes));
  localStorage.setItem(STORAGE_KEYS.seeded, "true");

  if (showMessage) {
    showToast("保存しました");
  }
}

// サンプルはここを書き換えるだけで差し替えられます。
function createSampleNotes() {
  const now = Date.now();
  const sampleData = [
    {
      title: "就活メモ：SIer企業研究で見るポイント",
      body: "事業領域、主要顧客、上流工程の比率、研修制度、配属の決まり方を見る。面接ではなぜSIerか、なぜその会社かを分けて話せるようにする。",
      category: "就活",
      tags: ["SIer", "企業研究", "面接"],
      priority: "高",
      pinned: true,
      favorite: true
    },
    {
      title: "バンドメモ：ライブ前PA確認リスト",
      body: "リハで返しの音量、クリック有無、ギターの音作り、同期音源の出力、曲間MCの流れを確認。終演後の物販導線も忘れない。",
      category: "バンド",
      tags: ["ライブ", "PA", "確認"],
      priority: "中",
      pinned: false,
      favorite: true
    },
    {
      title: "創作メモ：新作ノベルゲームの設定案",
      body: "舞台は雨が止まない地方都市。主人公は記憶の一部を失っていて、選択肢によって街の記録そのものが書き換わる。",
      category: "創作",
      tags: ["ノベルゲーム", "設定", "世界観"],
      priority: "高",
      pinned: false,
      favorite: false
    },
    {
      title: "授業メモ：レポート提出前チェック",
      body: "引用形式、参考文献、提出ファイル名、字数、図表番号、誤字を確認。提出後にスクリーンショットを残す。",
      category: "授業",
      tags: ["レポート", "提出", "チェック"],
      priority: "中",
      pinned: false,
      favorite: false
    },
    {
      title: "ゲーム案：カードローグライクのシステム案",
      body: "カードは戦闘後に選ぶだけでなく、休憩地点で合成できる。デッキ枚数が少ないほど強いが、状態異常カードを受けやすくする。",
      category: "ゲーム",
      tags: ["カード", "ローグライク", "システム"],
      priority: "低",
      pinned: false,
      favorite: true
    }
  ];

  return sampleData.map((note, index) => ({
    id: createId(),
    title: note.title,
    body: note.body,
    category: note.category,
    tags: note.tags,
    priority: note.priority,
    pinned: note.pinned,
    favorite: note.favorite,
    createdAt: new Date(now - index * 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(now - index * 1000 * 60 * 30).toISOString()
  }));
}

function renderAll() {
  renderNotes();
  renderEditor();
}

function renderCategoryFilters() {
  dom.categoryFilters.innerHTML = CATEGORIES.map((category) => {
    const activeClass = category === state.activeCategory ? " is-active" : "";
    return `<button class="category-button${activeClass}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
  }).join("");
}

function renderNotes() {
  const visibleNotes = getVisibleNotes();
  dom.noteCount.textContent = `${visibleNotes.length}件`;
  dom.emptyState.hidden = visibleNotes.length !== 0;
  dom.notesGrid.innerHTML = visibleNotes.map(renderNoteCard).join("");
}

function renderNoteCard(note) {
  const selectedClass = note.id === state.selectedId ? " is-selected" : "";
  const pinnedClass = note.pinned ? " is-pinned" : "";
  const favoriteClass = note.favorite ? " is-favorite" : "";
  const title = note.title.trim() || "無題メモ";
  const preview = note.body.trim() || "本文なし";
  const tags = note.tags.length
    ? note.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")
    : `<span class="tag">タグなし</span>`;
  const priorityClass = getPriorityClass(note.priority);

  return `
    <article class="note-card${selectedClass}${pinnedClass}${favoriteClass}" data-note-id="${escapeHtml(note.id)}">
      <div class="card-top">
        <div class="card-badges">
          <span class="badge">${escapeHtml(note.category)}</span>
          <span class="badge ${priorityClass}">${escapeHtml(note.priority)}</span>
        </div>
        <div class="card-actions">
          <button class="icon-button${note.pinned ? " is-on" : ""}" type="button" data-action="pin" data-note-id="${escapeHtml(note.id)}" aria-label="ピン留め切り替え">${note.pinned ? "▲" : "△"}</button>
          <button class="icon-button${note.favorite ? " is-on" : ""}" type="button" data-action="favorite" data-note-id="${escapeHtml(note.id)}" aria-label="お気に入り切り替え">${note.favorite ? "★" : "☆"}</button>
        </div>
      </div>
      <h3 class="note-title">${escapeHtml(title)}</h3>
      <p class="note-preview">${escapeHtml(preview)}</p>
      <div class="tag-row">${tags}</div>
      <div class="meta-row">
        <span>作成 <time>${formatDate(note.createdAt)}</time></span>
        <span>更新 <time>${formatDate(note.updatedAt)}</time></span>
      </div>
      <div class="meta-row">
        <span>${note.body.length}文字</span>
      </div>
    </article>
  `;
}

function renderEditor() {
  const note = getSelectedNote();
  const hasNote = Boolean(note);
  updateEditorShell();

  if (!state.isEditorOpen) {
    return;
  }

  [
    dom.titleInput,
    dom.bodyInput,
    dom.categorySelect,
    dom.prioritySelect,
    dom.tagsInput,
    dom.pinnedInput,
    dom.favoriteInput,
    dom.deleteButton
  ].forEach((element) => {
    element.disabled = !hasNote;
  });

  if (!note) {
    dom.editorHeading.textContent = "メモを選択";
    dom.saveState.textContent = "Ready";
    dom.titleInput.value = "";
    dom.bodyInput.value = "";
    dom.categorySelect.value = "その他";
    dom.prioritySelect.value = "中";
    dom.tagsInput.value = "";
    dom.pinnedInput.checked = false;
    dom.favoriteInput.checked = false;
    dom.createdAtText.textContent = "-";
    dom.updatedAtText.textContent = "-";
    dom.charCount.textContent = "0文字";
    return;
  }

  dom.editorHeading.textContent = note.title.trim() || "無題メモ";
  dom.saveState.textContent = "Saved";
  dom.titleInput.value = note.title;
  dom.bodyInput.value = note.body;
  dom.categorySelect.value = note.category;
  dom.prioritySelect.value = note.priority;
  dom.tagsInput.value = note.tags.join(", ");
  dom.pinnedInput.checked = note.pinned;
  dom.favoriteInput.checked = note.favorite;
  renderEditorMeta(note);
  updateCharCount();
}

function renderEditorMeta(note) {
  dom.createdAtText.textContent = formatDateTime(note.createdAt);
  dom.updatedAtText.textContent = formatDateTime(note.updatedAt);
}

function selectInitialNote() {
  const firstVisible = getVisibleNotes()[0];
  state.selectedId = firstVisible ? firstVisible.id : null;
}

function selectNote(id) {
  flushAutoSave(false);
  state.selectedId = id;
  openEditor();
  renderAll();
  resetEditorScrollOnSmallScreen();
}

function createNote() {
  flushAutoSave(false);

  const now = new Date().toISOString();
  const note = {
    id: createId(),
    title: "",
    body: "",
    category: "その他",
    tags: [],
    priority: "中",
    pinned: false,
    favorite: false,
    createdAt: now,
    updatedAt: now
  };

  state.notes.unshift(note);
  state.selectedId = note.id;
  openEditor();
  saveNotes(false);
  renderAll();
  dom.titleInput.focus();
  showToast("新規メモを作成しました");
  resetEditorScrollOnSmallScreen();
}

function deleteSelectedNote() {
  const note = getSelectedNote();
  if (!note) return;

  const title = note.title.trim() || "無題メモ";
  const ok = window.confirm(`「${title}」を削除しますか？`);
  if (!ok) return;

  state.notes = state.notes.filter((item) => item.id !== note.id);
  const next = getVisibleNotes()[0] || state.notes[0] || null;
  state.selectedId = next ? next.id : null;
  state.isEditorOpen = Boolean(next) || !isSmallScreen();
  state.isDirty = false;
  clearTimeout(state.autoSaveTimer);
  saveNotes(false);
  renderAll();
  showToast("削除しました");
}

// 入力のたびに即localStorageへ書かず、少し待ってから保存します。
function scheduleAutoSave() {
  const note = getSelectedNote();
  if (!note) return;

  applyFormToNote(note, false);
  updateCharCount();
  dom.editorHeading.textContent = note.title.trim() || "無題メモ";
  dom.saveState.textContent = "Saving";
  state.isDirty = true;

  clearTimeout(state.autoSaveTimer);
  state.autoSaveTimer = setTimeout(() => {
    flushAutoSave(true);
  }, 500);
}

function flushAutoSave(showMessage) {
  if (!state.isDirty) return;

  const note = getSelectedNote();
  if (!note) return;

  applyFormToNote(note, true);
  state.isDirty = false;
  clearTimeout(state.autoSaveTimer);
  saveNotes(showMessage);
  renderEditorMeta(note);
  dom.saveState.textContent = "Saved";
  renderNotes();
}

// フォームの値をメモオブジェクトへ反映します。
function applyFormToNote(note, touchUpdatedAt) {
  note.title = dom.titleInput.value;
  note.body = dom.bodyInput.value;
  note.category = EDIT_CATEGORIES.includes(dom.categorySelect.value) ? dom.categorySelect.value : "その他";
  note.tags = parseTags(dom.tagsInput.value);
  note.priority = PRIORITIES.includes(dom.prioritySelect.value) ? dom.prioritySelect.value : "中";
  note.pinned = dom.pinnedInput.checked;
  note.favorite = dom.favoriteInput.checked;

  if (touchUpdatedAt) {
    note.updatedAt = new Date().toISOString();
  }
}

function handleCardAction(button) {
  flushAutoSave(false);

  const note = state.notes.find((item) => item.id === button.dataset.noteId);
  if (!note) return;

  if (button.dataset.action === "pin") {
    note.pinned = !note.pinned;
  }

  if (button.dataset.action === "favorite") {
    note.favorite = !note.favorite;
  }

  note.updatedAt = new Date().toISOString();
  state.selectedId = note.id;
  saveNotes(false);
  renderAll();
}

function openEditor() {
  state.isEditorOpen = true;
}

function closeEditor() {
  flushAutoSave(true);
  state.isEditorOpen = false;
  renderAll();
}

function updateEditorShell() {
  const isOpen = state.isEditorOpen;
  dom.editorPanel.classList.toggle("is-closed", !isOpen);
  dom.noteForm.hidden = !isOpen;
  dom.editorClosedState.hidden = isOpen;
  dom.body.classList.toggle("editor-open", isOpen && isSmallScreen());
}

function getVisibleNotes() {
  const query = state.searchQuery;

  return [...state.notes]
    .filter((note) => {
      const matchesCategory = state.activeCategory === "全部" || note.category === state.activeCategory;
      const searchableText = [
        note.title,
        note.body,
        note.category,
        note.tags.join(" ")
      ].join(" ").toLowerCase();

      return matchesCategory && searchableText.includes(query);
    })
    .sort(sortNotes);
}

function sortNotes(a, b) {
  const updatedDiff = toTime(b.updatedAt) - toTime(a.updatedAt);

  if (state.sortMode === "created") {
    return toTime(b.createdAt) - toTime(a.createdAt) || updatedDiff;
  }

  if (state.sortMode === "priority") {
    return PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority] || updatedDiff;
  }

  if (state.sortMode === "favorite") {
    return Number(b.favorite) - Number(a.favorite) || updatedDiff;
  }

  if (state.sortMode === "pinned") {
    return Number(b.pinned) - Number(a.pinned) || updatedDiff;
  }

  return updatedDiff;
}

function exportNotes() {
  flushAutoSave(false);

  const payload = {
    app: "TOI MEMO",
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: state.notes
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `toi-memo-${formatFileDate(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSONを書き出しました");
}

function importNotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const notes = normalizeImportedNotes(parsed);

      if (notes.length === 0) {
        window.alert("取り込めるメモがありません。");
        return;
      }

      const ok = window.confirm("現在のメモを置き換えてインポートします。よろしいですか？");
      if (!ok) return;

      state.notes = notes;
      state.selectedId = getVisibleNotes()[0]?.id || state.notes[0]?.id || null;
      saveNotes(false);
      renderAll();
      showToast("JSONをインポートしました");
    } catch (error) {
      console.error(error);
      window.alert("JSONファイルを読み込めませんでした。");
    } finally {
      dom.importInput.value = "";
    }
  };
  reader.readAsText(file);
}

// インポートJSONは最低限の形に整えてからアプリ内データにします。
function normalizeImportedNotes(input) {
  const rawNotes = Array.isArray(input) ? input : Array.isArray(input?.notes) ? input.notes : [];
  const usedIds = new Set();

  return rawNotes.map((raw) => {
    const now = new Date().toISOString();
    const id = makeUniqueId(String(raw?.id || createId()), usedIds);
    const category = EDIT_CATEGORIES.includes(raw?.category) ? raw.category : "その他";
    const priority = PRIORITIES.includes(raw?.priority) ? raw.priority : "中";

    return {
      id,
      title: toStringValue(raw?.title),
      body: toStringValue(raw?.body),
      category,
      tags: normalizeTags(raw?.tags),
      priority,
      pinned: Boolean(raw?.pinned),
      favorite: Boolean(raw?.favorite),
      createdAt: isValidDate(raw?.createdAt) ? raw.createdAt : now,
      updatedAt: isValidDate(raw?.updatedAt) ? raw.updatedAt : now
    };
  });
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return uniqueTags(value.map(toStringValue));
  }

  return parseTags(toStringValue(value));
}

function parseTags(value) {
  return uniqueTags(value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean));
}

function uniqueTags(tags) {
  const seen = new Set();
  const result = [];

  tags.forEach((tag) => {
    const clean = tag.trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) return;
    seen.add(key);
    result.push(clean);
  });

  return result;
}

function toggleTheme() {
  const nextTheme = dom.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
}

function applyTheme(theme) {
  const safeTheme = theme === "light" ? "light" : "dark";
  dom.body.dataset.theme = safeTheme;
  dom.themeToggle.textContent = safeTheme === "dark" ? "Light" : "Dark";
}

function loadTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || "dark";
}

function getSelectedNote() {
  return state.notes.find((note) => note.id === state.selectedId) || null;
}

function getPriorityClass(priority) {
  if (priority === "高") return "priority-high";
  if (priority === "低") return "priority-low";
  return "priority-medium";
}

function updateCharCount() {
  dom.charCount.textContent = `${dom.bodyInput.value.length}文字`;
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");

  state.toastTimer = setTimeout(() => {
    dom.toast.classList.remove("is-visible");
  }, 1700);
}

function resetEditorScrollOnSmallScreen() {
  if (isSmallScreen()) {
    dom.editorPanel.scrollTop = 0;
  }
}

function isSmallScreen() {
  return window.matchMedia("(max-width: 820px)").matches;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `memo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeUniqueId(baseId, usedIds) {
  let id = baseId.trim() || createId();

  while (usedIds.has(id)) {
    id = createId();
  }

  usedIds.add(id);
  return id;
}

function toStringValue(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function isValidDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function toTime(value) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatFileDate(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
