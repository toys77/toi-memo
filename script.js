"use strict";

const APP_VERSION = "2.0.3";
const BACKUP_RECOMMEND_DAYS = 7;

const STORAGE_KEYS = {
  notes: "toiMemo.notes",
  theme: "toiMemo.theme",
  seeded: "toiMemo.seeded",
  lastExportAt: "toiMemo.lastExportAt",
  categories: "toiMemo.categories",
  sortMode: "toiMemo.sortMode",
  viewMode: "toiMemo.viewMode",
  colorFilter: "toiMemo.colorFilter",
  favoriteOnly: "toiMemo.favoriteOnly",
  pinnedOnly: "toiMemo.pinnedOnly",
  showDashboard: "toiMemo.showDashboard",
  dashboardCollapsed: "toiMemo.dashboardCollapsed"
};

const DEFAULT_CATEGORIES = ["全部", "アイデア", "就活", "授業", "料理", "サッカー", "ゲーム", "日記", "その他"];
const PROTECTED_CATEGORIES = ["全部", "その他"];
const PRIORITIES = ["低", "中", "高"];
const PRIORITY_SCORE = { "高": 3, "中": 2, "低": 1 };
const SORT_MODES = ["pinned", "updated", "created", "priority", "favorite"];
const VIEW_MODES = ["card", "list", "compact"];
const LONG_PRESS_MS = 460;

const NOTE_COLORS = [
  { id: "default", label: "デフォルト", swatch: "var(--swatch-default)" },
  { id: "blue-gray", label: "ブルーグレー", swatch: "var(--swatch-blue-gray)" },
  { id: "dark-green", label: "ダークグリーン", swatch: "var(--swatch-dark-green)" },
  { id: "deep-blue", label: "ディープブルー", swatch: "var(--swatch-deep-blue)" },
  { id: "bordeaux", label: "ボルドー", swatch: "var(--swatch-bordeaux)" },
  { id: "brown", label: "ブラウン", swatch: "var(--swatch-brown)" },
  { id: "purple-gray", label: "パープルグレー", swatch: "var(--swatch-purple-gray)" }
];

// 新規作成時のテンプレートです。ここに追加すると選択画面にも反映されます。
const NOTE_TEMPLATES = [
  {
    id: "blank",
    name: "通常メモ",
    description: "短い思いつきや一時メモに。",
    title: "新規メモ",
    category: "その他",
    tags: [],
    body: "自由にメモを書く。"
  },
  {
    id: "job-company",
    name: "就活企業メモ",
    description: "企業研究、ES、面接準備をまとめる。",
    title: "就活メモ：企業名",
    category: "就活",
    tags: ["就活", "企業研究", "面接"],
    body: [
      "## 企業名",
      "## 事業内容",
      "## 興味を持った理由",
      "## 自分の経験とつながる点",
      "## ESで使えそうな要素",
      "## 面接で聞きたいこと",
      "## 締切・次にやること"
    ].join("\n\n")
  },
  {
    id: "class-report",
    name: "授業レポートメモ",
    description: "課題条件と提出前チェックを整理する。",
    title: "授業メモ：課題名",
    category: "授業",
    tags: ["授業", "レポート", "提出"],
    body: [
      "## 授業名",
      "## 課題内容",
      "## 必要な条件",
      "## 使えそうな資料",
      "## 構成案",
      "## 提出前チェック\n- [ ] 字数\n- [ ] 形式\n- [ ] 誤字脱字\n- [ ] 参考文献\n- [ ] 提出ファイル名"
    ].join("\n\n")
  },
  {
    id: "cooking-prep",
    name: "料理作り置きメモ",
    description: "作るもの、買うもの、保存の目安をまとめる。",
    title: "料理メモ：作り置き案",
    category: "料理",
    tags: ["料理", "作り置き", "買い物"],
    body: [
      "## 作りたいもの",
      "## 材料",
      "## 買うもの",
      "## 下準備\n- [ ] 食材を切る\n- [ ] 調味料を確認する\n- [ ] 保存容器を用意する",
      "## 保存方法",
      "## 次に作るときのメモ"
    ].join("\n\n")
  },
  {
    id: "soccer-watch",
    name: "サッカー観戦メモ",
    description: "試合を見ながら気づいたことを記録する。",
    title: "サッカーメモ：試合メモ",
    category: "サッカー",
    tags: ["サッカー", "観戦", "戦術"],
    body: [
      "## 試合",
      "## 注目した選手",
      "## 攻撃で気づいたこと",
      "## 守備で気づいたこと",
      "## 印象に残った場面",
      "## 次に見るポイント"
    ].join("\n\n")
  },
  {
    id: "game-idea",
    name: "ゲーム案",
    description: "企画の核と最小機能をすばやく固める。",
    title: "ゲーム案：タイトル未定",
    category: "ゲーム",
    tags: ["ゲーム案", "企画", "システム"],
    body: [
      "## タイトル案",
      "## ジャンル",
      "## コンセプト",
      "## 何が面白いか",
      "## 基本ルール",
      "## プレイヤーの目的",
      "## 主要システム",
      "## 参考作品",
      "## 最初に作る最小機能"
    ].join("\n\n")
  },
  {
    id: "diary",
    name: "日記",
    description: "今日の出来事と気持ちを短く記録する。",
    title: "日記：今日の記録",
    category: "日記",
    tags: ["日記"],
    body: [
      "## 今日あったこと",
      "## 感情",
      "## よかったこと",
      "## 反省",
      "## 明日やること"
    ].join("\n\n")
  }
];

const SAMPLE_NOTE_DATA = [
  {
    title: "就活メモ：企業研究で見るポイント",
    body: "事業内容、主要顧客、強み、働き方、研修制度、選考フローを確認する。\n面接では「なぜその会社なのか」を自分の経験とつなげて話せるようにする。",
    category: "就活",
    tags: ["就活", "企業研究", "面接"],
    priority: "高",
    pinned: true,
    favorite: true
  },
  {
    title: "料理メモ：作り置きの候補",
    body: "鶏むね肉、卵、野菜を使って、数日分の作り置きを考える。\n調味料、保存容器、冷蔵保存できる日数もメモしておく。",
    category: "料理",
    tags: ["料理", "作り置き", "買い物"],
    priority: "中",
    pinned: false,
    favorite: true
  },
  {
    title: "サッカーメモ：試合を見るときのポイント",
    body: "ボールを持っていない選手の動き、守備の戻り方、サイドの使い方を見る。\n得点シーンだけでなく、チャンスが生まれる前の動きも記録する。",
    category: "サッカー",
    tags: ["サッカー", "観戦", "戦術"],
    priority: "中",
    pinned: false,
    favorite: false
  },
  {
    title: "授業メモ：レポート提出前チェック",
    body: "提出形式、字数、参考文献、ファイル名、誤字脱字を確認する。\n提出後はスクリーンショットや提出完了画面を残しておく。",
    category: "授業",
    tags: ["授業", "レポート", "チェック"],
    priority: "中",
    pinned: false,
    favorite: false
  },
  {
    title: "買い物メモ：週末に買うもの",
    body: "日用品、食材、消耗品をまとめて確認する。\n買うものを事前に分けておくと、無駄な買い物を減らせる。",
    category: "その他",
    tags: ["買い物", "生活"],
    priority: "低",
    pinned: false,
    favorite: true
  }
];

// 以前の初期サンプルと完全一致するものだけ、公開向けサンプルへ置き換えます。
const LEGACY_SAMPLE_NOTES = [
  {
    title: "就活メモ：SIer企業研究で見るポイント",
    body: "事業領域、主要顧客、上流工程の比率、研修制度、配属の決まり方を見る。面接ではなぜSIerか、なぜその会社かを分けて話せるようにする。",
    category: "就活",
    tags: ["SIer", "企業研究", "面接"]
  },
  {
    title: "バンドメモ：ライブ前PA確認リスト",
    body: "リハで返しの音量、クリック有無、ギターの音作り、同期音源の出力、曲間MCの流れを確認。終演後の物販導線も忘れない。",
    category: "バンド",
    tags: ["ライブ", "PA", "確認"]
  },
  {
    title: "創作メモ：新作ノベルゲームの設定案",
    body: "舞台は雨が止まない地方都市。主人公は記憶の一部を失っていて、選択肢によって街の記録そのものが書き換わる。",
    category: "創作",
    tags: ["ノベルゲーム", "設定", "世界観"]
  },
  {
    title: "授業メモ：レポート提出前チェック",
    body: "引用形式、参考文献、提出ファイル名、字数、図表番号、誤字を確認。提出後にスクリーンショットを残す。",
    category: "授業",
    tags: ["レポート", "提出", "チェック"]
  },
  {
    title: "ゲーム案：カードローグライクのシステム案",
    body: "カードは戦闘後に選ぶだけでなく、休憩地点で合成できる。デッキ枚数が少ないほど強いが、状態異常カードを受けやすくする。",
    category: "ゲーム",
    tags: ["カード", "ローグライク", "システム"]
  }
];

const state = {
  notes: [],
  categories: [...DEFAULT_CATEGORIES],
  selectedId: null,
  activeCategory: "全部",
  searchQuery: "",
  sortMode: "pinned",
  viewMode: "card",
  colorFilter: "all",
  favoriteOnly: false,
  pinnedOnly: false,
  showDashboard: true,
  dashboardCollapsed: true,
  editorMode: "view",
  categoryModalMode: "add",
  editingCategoryName: "",
  categoryMenuTarget: "",
  categoryLongPressTimer: null,
  suppressCategoryClick: false,
  isEditorOpen: true,
  sheetTouchStartY: 0,
  sheetTouchStartX: 0,
  sheetTouchDeltaY: 0,
  isSheetDragging: false,
  waitingWorker: null,
  isUpdateReloading: false,
  autoSaveTimer: null,
  isDirty: false,
  toastTimer: null
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", registerServiceWorker);

// 起動時にDOM取得、保存データ読み込み、初回サンプル投入をまとめて行います。
function init() {
  cacheDom();
  loadCategories();
  setupCategoryOptions();
  bindEvents();
  applyTheme(loadTheme());
  applySortMode(loadSortMode());
  applyViewMode(loadViewMode());
  applyColorFilter(loadColorFilter());
  applyBooleanFilter("favoriteOnly", loadBooleanFilter(STORAGE_KEYS.favoriteOnly));
  applyBooleanFilter("pinnedOnly", loadBooleanFilter(STORAGE_KEYS.pinnedOnly));
  applyShowDashboard(loadShowDashboard());
  applyDashboardCollapsed(loadDashboardCollapsed());
  loadNotes();
  syncCategoriesFromNotes();
  state.isEditorOpen = !isSmallScreen();
  renderCategoryFilters();
  selectInitialNote();
  renderAll();
}

// DOM参照を1か所に集めると、HTML側のid変更にも対応しやすくなります。
function cacheDom() {
  dom.body = document.body;
  dom.themeToggle = document.getElementById("themeToggle");
  dom.settingsButton = document.getElementById("settingsButton");
  dom.exportButton = document.getElementById("exportButton");
  dom.importInput = document.getElementById("importInput");
  dom.newNoteButton = document.getElementById("newNoteButton");
  dom.quickCreateButton = document.getElementById("quickCreateButton");
  dom.searchInput = document.getElementById("searchInput");
  dom.sortSelect = document.getElementById("sortSelect");
  dom.viewModeControls = document.getElementById("viewModeControls");
  dom.addCategoryButton = document.getElementById("addCategoryButton");
  dom.colorFilterList = document.getElementById("colorFilterList");
  dom.favoriteOnlyButton = document.getElementById("favoriteOnlyButton");
  dom.pinnedOnlyButton = document.getElementById("pinnedOnlyButton");
  dom.clearFiltersButton = document.getElementById("clearFiltersButton");
  dom.notesClearFiltersButton = document.getElementById("notesClearFiltersButton");
  dom.categoryFilters = document.getElementById("categoryFilters");
  dom.notesGrid = document.getElementById("notesGrid");
  dom.dashboardPanel = document.getElementById("dashboardPanel");
  dom.dashboardStats = document.getElementById("dashboardStats");
  dom.dashboardPinnedButton = document.getElementById("dashboardPinnedButton");
  dom.dashboardFavoriteButton = document.getElementById("dashboardFavoriteButton");
  dom.dashboardCollapseButton = document.getElementById("dashboardCollapseButton");
  dom.recentNotesList = document.getElementById("recentNotesList");
  dom.categoryStatsTotal = document.getElementById("categoryStatsTotal");
  dom.categoryStatsList = document.getElementById("categoryStatsList");
  dom.emptyState = document.getElementById("emptyState");
  dom.emptyTitle = document.getElementById("emptyTitle");
  dom.emptyMessage = document.getElementById("emptyMessage");
  dom.emptyClearFiltersButton = document.getElementById("emptyClearFiltersButton");
  dom.noteCount = document.getElementById("noteCount");
  dom.editorOverlay = document.getElementById("editorOverlay");
  dom.editorPanel = document.getElementById("editorPanel");
  dom.editorSheetHeader = document.getElementById("editorSheetHeader");
  dom.editorClosedState = document.getElementById("editorClosedState");
  dom.noteViewPanel = document.getElementById("noteViewPanel");
  dom.viewSheetHeader = document.getElementById("viewSheetHeader");
  dom.viewHeading = document.getElementById("viewHeading");
  dom.viewEditButton = document.getElementById("viewEditButton");
  dom.viewCloseEditorButton = document.getElementById("viewCloseEditorButton");
  dom.viewTitle = document.getElementById("viewTitle");
  dom.viewCategory = document.getElementById("viewCategory");
  dom.viewStatusRow = document.getElementById("viewStatusRow");
  dom.viewActionRow = document.getElementById("viewActionRow");
  dom.viewPinButton = document.getElementById("viewPinButton");
  dom.viewFavoriteButton = document.getElementById("viewFavoriteButton");
  dom.viewDeleteButton = document.getElementById("viewDeleteButton");
  dom.viewColorPalette = document.getElementById("viewColorPalette");
  dom.viewTags = document.getElementById("viewTags");
  dom.viewBody = document.getElementById("viewBody");
  dom.viewCreatedAtText = document.getElementById("viewCreatedAtText");
  dom.viewUpdatedAtText = document.getElementById("viewUpdatedAtText");
  dom.noteForm = document.getElementById("noteForm");
  dom.editorHeading = document.getElementById("editorHeading");
  dom.saveState = document.getElementById("saveState");
  dom.backToViewButton = document.getElementById("backToViewButton");
  dom.keyboardDismissButton = document.getElementById("keyboardDismissButton");
  dom.closeEditorButton = document.getElementById("closeEditorButton");
  dom.titleInput = document.getElementById("titleInput");
  dom.bodyInput = document.getElementById("bodyInput");
  dom.categorySelect = document.getElementById("categorySelect");
  dom.prioritySelect = document.getElementById("prioritySelect");
  dom.tagsInput = document.getElementById("tagsInput");
  dom.colorPalette = document.getElementById("colorPalette");
  dom.pinnedInput = document.getElementById("pinnedInput");
  dom.favoriteInput = document.getElementById("favoriteInput");
  dom.createdAtText = document.getElementById("createdAtText");
  dom.updatedAtText = document.getElementById("updatedAtText");
  dom.charCount = document.getElementById("charCount");
  dom.deleteButton = document.getElementById("deleteButton");
  dom.settingsModal = document.getElementById("settingsModal");
  dom.settingsBackdrop = document.getElementById("settingsBackdrop");
  dom.settingsCloseButton = document.getElementById("settingsCloseButton");
  dom.settingsExportButton = document.getElementById("settingsExportButton");
  dom.settingsVersion = document.getElementById("settingsVersion");
  dom.settingsNoteCount = document.getElementById("settingsNoteCount");
  dom.settingsLastBackup = document.getElementById("settingsLastBackup");
  dom.backupAdvice = document.getElementById("backupAdvice");
  dom.showDashboardToggle = document.getElementById("showDashboardToggle");
  dom.categoryModal = document.getElementById("categoryModal");
  dom.categoryBackdrop = document.getElementById("categoryBackdrop");
  dom.categoryModalTitle = document.getElementById("categoryModalTitle");
  dom.categoryNameInput = document.getElementById("categoryNameInput");
  dom.categorySaveButton = document.getElementById("categorySaveButton");
  dom.categoryCancelButton = document.getElementById("categoryCancelButton");
  dom.categoryCloseButton = document.getElementById("categoryCloseButton");
  dom.categoryMenu = document.getElementById("categoryMenu");
  dom.categoryMenuBackdrop = document.getElementById("categoryMenuBackdrop");
  dom.categoryMenuTitle = document.getElementById("categoryMenuTitle");
  dom.categoryMenuEditButton = document.getElementById("categoryMenuEditButton");
  dom.categoryMenuDeleteButton = document.getElementById("categoryMenuDeleteButton");
  dom.categoryMenuCancelButton = document.getElementById("categoryMenuCancelButton");
  dom.templateModal = document.getElementById("templateModal");
  dom.templateBackdrop = document.getElementById("templateBackdrop");
  dom.templatePanel = document.getElementById("templatePanel");
  dom.templateCloseButton = document.getElementById("templateCloseButton");
  dom.templateGrid = document.getElementById("templateGrid");
  dom.templateCancelButton = document.getElementById("templateCancelButton");
  dom.updateBanner = document.getElementById("updateBanner");
  dom.updateReloadButton = document.getElementById("updateReloadButton");
  dom.updateDismissButton = document.getElementById("updateDismissButton");
  dom.toast = document.getElementById("toast");
}

function setupCategoryOptions() {
  renderCategorySelect("その他");
}

function renderCategorySelect(selectedCategory = "その他") {
  const currentCategory = toStringValue(selectedCategory).trim();
  const categories = [...getEditableCategories()];

  if (currentCategory && currentCategory !== "全部" && !categories.includes(currentCategory)) {
    categories.push(currentCategory);
  }

  dom.categorySelect.innerHTML = categories.map((category) => (
    `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
  )).join("");
}

// 入力欄は自動保存、一覧やカテゴリはクリックで状態更新する構成です。
function bindEvents() {
  dom.newNoteButton.addEventListener("click", openTemplatePicker);
  dom.quickCreateButton.addEventListener("click", openTemplatePicker);
  dom.themeToggle.addEventListener("click", toggleTheme);
  dom.settingsButton.addEventListener("click", openSettings);
  dom.exportButton.addEventListener("click", exportNotes);
  dom.importInput.addEventListener("change", importNotes);

  dom.searchInput.addEventListener("input", () => {
    state.searchQuery = dom.searchInput.value.trim().toLowerCase();
    renderNotes();
  });

  dom.sortSelect.addEventListener("change", () => {
    applySortMode(dom.sortSelect.value);
    localStorage.setItem(STORAGE_KEYS.sortMode, state.sortMode);
    renderNotes();
  });

  dom.viewModeControls.addEventListener("click", handleViewModeClick);
  dom.colorFilterList.addEventListener("click", handleColorFilterClick);
  dom.favoriteOnlyButton.addEventListener("click", () => toggleBooleanFilter("favoriteOnly", STORAGE_KEYS.favoriteOnly));
  dom.pinnedOnlyButton.addEventListener("click", () => toggleBooleanFilter("pinnedOnly", STORAGE_KEYS.pinnedOnly));
  dom.clearFiltersButton.addEventListener("click", resetFilters);
  dom.notesClearFiltersButton.addEventListener("click", resetFilters);
  dom.emptyClearFiltersButton.addEventListener("click", resetFilters);
  dom.dashboardPinnedButton.addEventListener("click", () => applyDashboardShortcut("pinned"));
  dom.dashboardFavoriteButton.addEventListener("click", () => applyDashboardShortcut("favorite"));
  dom.dashboardCollapseButton.addEventListener("click", toggleDashboardCollapsed);
  dom.recentNotesList.addEventListener("click", handleRecentNoteClick);

  dom.addCategoryButton.addEventListener("click", () => openCategoryModal("add"));
  dom.categoryFilters.addEventListener("click", handleCategoryClick);
  dom.categoryFilters.addEventListener("pointerdown", handleCategoryPointerDown);
  dom.categoryFilters.addEventListener("pointerup", clearCategoryLongPress);
  dom.categoryFilters.addEventListener("pointercancel", clearCategoryLongPress);
  dom.categoryFilters.addEventListener("pointerleave", clearCategoryLongPress);
  dom.categoryFilters.addEventListener("contextmenu", handleCategoryContextMenu);

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
  dom.noteForm.addEventListener("click", handleEditorBlankTap);
  dom.viewEditButton.addEventListener("click", switchToEditMode);
  dom.viewCloseEditorButton.addEventListener("click", closeEditor);
  dom.viewPinButton.addEventListener("click", () => toggleSelectedFlag("pinned"));
  dom.viewFavoriteButton.addEventListener("click", () => toggleSelectedFlag("favorite"));
  dom.viewDeleteButton.addEventListener("click", deleteSelectedNote);
  dom.viewColorPalette.addEventListener("click", handleColorSelect);
  dom.viewBody.addEventListener("change", handlePreviewChecklistChange);
  dom.editorOverlay.addEventListener("click", closeEditor);
  dom.colorPalette.addEventListener("click", handleColorSelect);
  dom.backToViewButton.addEventListener("click", switchToViewMode);
  dom.keyboardDismissButton.addEventListener("pointerdown", dismissKeyboard);
  dom.keyboardDismissButton.addEventListener("click", dismissKeyboard);
  dom.closeEditorButton.addEventListener("click", closeEditor);
  dom.deleteButton.addEventListener("click", deleteSelectedNote);
  dom.settingsBackdrop.addEventListener("click", closeSettings);
  dom.settingsCloseButton.addEventListener("click", closeSettings);
  dom.settingsExportButton.addEventListener("click", exportNotes);
  dom.showDashboardToggle.addEventListener("change", () => {
    applyShowDashboard(dom.showDashboardToggle.checked);
    localStorage.setItem(STORAGE_KEYS.showDashboard, String(state.showDashboard));
    renderAll();
  });
  dom.categoryBackdrop.addEventListener("click", closeCategoryModal);
  dom.categoryCloseButton.addEventListener("click", closeCategoryModal);
  dom.categoryCancelButton.addEventListener("click", closeCategoryModal);
  dom.categorySaveButton.addEventListener("click", saveCategoryFromModal);
  dom.categoryNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveCategoryFromModal();
    }
  });
  dom.categoryMenuBackdrop.addEventListener("click", closeCategoryMenu);
  dom.categoryMenuCancelButton.addEventListener("click", closeCategoryMenu);
  dom.categoryMenuEditButton.addEventListener("click", editCategoryFromMenu);
  dom.categoryMenuDeleteButton.addEventListener("click", deleteCategoryFromMenu);
  dom.templateBackdrop.addEventListener("click", closeTemplatePicker);
  dom.templateCloseButton.addEventListener("click", closeTemplatePicker);
  dom.templateCancelButton.addEventListener("click", closeTemplatePicker);
  dom.templateGrid.addEventListener("click", handleTemplateSelect);
  dom.updateReloadButton.addEventListener("click", applyServiceWorkerUpdate);
  dom.updateDismissButton.addEventListener("click", hideUpdateNotice);
  window.addEventListener("resize", updateEditorShell);
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (!dom.templateModal.hidden) {
      closeTemplatePicker();
      return;
    }

    if (!dom.categoryMenu.hidden) {
      closeCategoryMenu();
      return;
    }

    if (!dom.categoryModal.hidden) {
      closeCategoryModal();
      return;
    }

    if (!dom.settingsModal.hidden) {
      closeSettings();
    }
  });
  dom.editorSheetHeader.addEventListener("touchstart", handleSheetTouchStart, { passive: true });
  dom.editorSheetHeader.addEventListener("touchmove", handleSheetTouchMove, { passive: false });
  dom.editorSheetHeader.addEventListener("touchend", handleSheetTouchEnd);
  dom.editorSheetHeader.addEventListener("touchcancel", cancelSheetDrag);
  dom.viewSheetHeader.addEventListener("touchstart", handleSheetTouchStart, { passive: true });
  dom.viewSheetHeader.addEventListener("touchmove", handleSheetTouchMove, { passive: false });
  dom.viewSheetHeader.addEventListener("touchend", handleSheetTouchEnd);
  dom.viewSheetHeader.addEventListener("touchcancel", cancelSheetDrag);

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
      const normalizedNotes = normalizeImportedNotes(parsed);
      const migration = replaceLegacySampleNotes(normalizedNotes);
      state.notes = migration.notes;

      if (migration.changed) {
        saveNotes(false);
      }

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

function loadCategories() {
  const stored = localStorage.getItem(STORAGE_KEYS.categories);

  if (stored) {
    try {
      state.categories = normalizeCategories(JSON.parse(stored), false);
      saveCategories();
      return;
    } catch (error) {
      console.warn("TOI MEMO: カテゴリを読み込めませんでした。", error);
    }
  }

  state.categories = normalizeCategories(DEFAULT_CATEGORIES, true);
  saveCategories();
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.categories));
}

function normalizeCategories(input, useDefaultsWhenEmpty = true) {
  const source = Array.isArray(input) && input.length > 0
    ? input
    : useDefaultsWhenEmpty
      ? DEFAULT_CATEGORIES
      : ["全部", "その他"];

  const normalized = uniqueCategoryNames(source.map(toStringValue));

  if (!normalized.includes("全部")) {
    normalized.unshift("全部");
  }

  if (!normalized.includes("その他")) {
    normalized.push("その他");
  }

  return [
    "全部",
    ...normalized.filter((category) => category !== "全部" && category !== "その他"),
    "その他"
  ];
}

function syncCategoriesFromNotes() {
  let changed = false;

  state.notes.forEach((note) => {
    const category = normalizeCategory(note.category);
    if (category === "全部" || state.categories.includes(category)) return;
    insertCategoryBeforeOther(category);
    changed = true;
  });

  if (changed) {
    saveCategories();
  }
}

// サンプルはここを書き換えるだけで差し替えられます。
function createSampleNotes() {
  const now = Date.now();
  return SAMPLE_NOTE_DATA.map((note, index) => ({
    id: createId(),
    title: note.title,
    body: note.body,
    category: note.category,
    tags: note.tags,
    priority: note.priority,
    pinned: note.pinned,
    favorite: note.favorite,
    color: "default",
    createdAt: new Date(now - index * 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(now - index * 1000 * 60 * 30).toISOString()
  }));
}

function replaceLegacySampleNotes(notes) {
  let changed = false;

  const migratedNotes = notes.map((note) => {
    const legacyIndex = findLegacySampleIndex(note);
    if (legacyIndex === -1) return note;

    const replacement = SAMPLE_NOTE_DATA[legacyIndex];
    changed = true;

    return {
      ...note,
      title: replacement.title,
      body: replacement.body,
      category: replacement.category,
      tags: [...replacement.tags],
      priority: replacement.priority,
      pinned: replacement.pinned,
      favorite: replacement.favorite
    };
  });

  return { notes: migratedNotes, changed };
}

function findLegacySampleIndex(note) {
  return LEGACY_SAMPLE_NOTES.findIndex((sample) => (
    note.title === sample.title
    && note.body === sample.body
    && note.category === sample.category
    && areTagsEqual(note.tags, sample.tags)
  ));
}

function areTagsEqual(leftTags, rightTags) {
  if (leftTags.length !== rightTags.length) return false;
  return leftTags.every((tag, index) => tag === rightTags[index]);
}

function renderAll() {
  renderDashboard();
  renderNotes();
  renderEditor();
  renderSettings();
}

function renderDashboard() {
  if (!dom.dashboardPanel) return;

  dom.dashboardPanel.hidden = !state.showDashboard;
  if (!state.showDashboard) return;

  const stats = getDashboardStats();
  const fullStatItems = [
    { label: "総メモ数", value: stats.total },
    { label: "今日作成", value: stats.createdToday },
    { label: "7日以内更新", value: stats.recentlyUpdated },
    { label: "ピン留め", value: stats.pinned },
    { label: "お気に入り", value: stats.favorite }
  ];
  const collapsedStatItems = [
    { label: "メモ", value: stats.total },
    { label: "今日", value: stats.createdToday },
    { label: "ピン", value: stats.pinned },
    { label: "お気に入り", value: stats.favorite }
  ];
  const statItems = state.dashboardCollapsed ? collapsedStatItems : fullStatItems;

  dom.dashboardPanel.classList.toggle("is-collapsed", state.dashboardCollapsed);
  dom.dashboardPanel.setAttribute("aria-expanded", String(!state.dashboardCollapsed));
  dom.dashboardCollapseButton.textContent = state.dashboardCollapsed ? "展開" : "折りたたむ";
  dom.dashboardCollapseButton.setAttribute("aria-expanded", String(!state.dashboardCollapsed));

  dom.dashboardStats.innerHTML = statItems.map((item) => `
    <div class="dashboard-stat-card">
      <span>${escapeHtml(item.label)}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");

  renderRecentNotes();
  renderCategoryStats();
}

function getDashboardStats() {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return {
    total: state.notes.length,
    createdToday: state.notes.filter((note) => isSameLocalDay(note.createdAt, new Date())).length,
    recentlyUpdated: state.notes.filter((note) => now - toTime(note.updatedAt) <= sevenDays).length,
    pinned: state.notes.filter((note) => note.pinned).length,
    favorite: state.notes.filter((note) => note.favorite).length
  };
}

function renderRecentNotes() {
  const recentNotes = [...state.notes]
    .sort((a, b) => toTime(b.updatedAt) - toTime(a.updatedAt))
    .slice(0, 3);

  if (recentNotes.length === 0) {
    dom.recentNotesList.innerHTML = `<p class="dashboard-empty">まだメモがありません。</p>`;
    return;
  }

  dom.recentNotesList.innerHTML = recentNotes.map((note) => {
    const title = note.title.trim() || "無題メモ";
    const colorClass = getNoteColorClass(note.color);

    return `
      <button class="recent-note-button ${colorClass}" type="button" data-recent-note-id="${escapeHtml(note.id)}">
        <span class="recent-note-swatch" aria-hidden="true"></span>
        <span>
          <span class="recent-note-title">${escapeHtml(title)}</span>
          <span class="recent-note-meta">${escapeHtml(note.category)}</span>
        </span>
        <time class="recent-note-time">${formatDate(note.updatedAt)}</time>
      </button>
    `;
  }).join("");
}

function renderCategoryStats() {
  const counts = new Map();
  state.categories
    .filter((category) => category !== "全部")
    .forEach((category) => counts.set(category, 0));

  state.notes.forEach((note) => {
    const category = normalizeCategory(note.category);
    counts.set(category, (counts.get(category) || 0) + 1);
  });

  dom.categoryStatsTotal.textContent = `${state.notes.length}件`;
  dom.categoryStatsList.innerHTML = [...counts.entries()]
    .map(([category, count]) => `
      <span class="category-stat-chip">
        <span>${escapeHtml(category)}</span>
        <strong>${count}</strong>
      </span>
    `)
    .join("");
}

function renderFilterControls() {
  dom.viewModeControls.querySelectorAll("[data-view-mode]").forEach((button) => {
    const isActive = button.dataset.viewMode === state.viewMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  dom.favoriteOnlyButton.classList.toggle("is-active", state.favoriteOnly);
  dom.favoriteOnlyButton.setAttribute("aria-pressed", String(state.favoriteOnly));
  dom.pinnedOnlyButton.classList.toggle("is-active", state.pinnedOnly);
  dom.pinnedOnlyButton.setAttribute("aria-pressed", String(state.pinnedOnly));
  dom.clearFiltersButton.classList.toggle("is-active", hasActiveFilters());

  const colorButtons = [
    { id: "all", label: "すべての色", swatch: "" },
    ...NOTE_COLORS
  ];

  dom.colorFilterList.innerHTML = colorButtons.map((color) => {
    const activeClass = color.id === state.colorFilter ? " is-active" : "";
    const allClass = color.id === "all" ? " is-all" : "";
    const style = color.swatch ? ` style="--swatch-color: ${escapeHtml(color.swatch)}"` : "";

    return `<button class="color-filter-chip${allClass}${activeClass}" type="button" data-color-filter="${escapeHtml(color.id)}"${style} aria-label="${escapeHtml(color.label)}" aria-pressed="${color.id === state.colorFilter}"></button>`;
  }).join("");
}

function renderCategoryFilters() {
  dom.categoryFilters.innerHTML = state.categories.map((category) => {
    const activeClass = category === state.activeCategory ? " is-active" : "";
    const manageable = canManageCategory(category);
    const menuButton = manageable
      ? `<button class="category-menu-button" type="button" data-category-menu="${escapeHtml(category)}" aria-label="${escapeHtml(category)}の操作">…</button>`
      : "";

    return `
      <div class="category-item${activeClass}" data-category-row="${escapeHtml(category)}">
        <button class="category-button${activeClass}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
        ${menuButton}
      </div>
    `;
  }).join("");
}

function handleCategoryClick(event) {
  const menuButton = event.target.closest("[data-category-menu]");
  if (menuButton) {
    openCategoryMenu(menuButton.dataset.categoryMenu);
    return;
  }

  const button = event.target.closest("[data-category]");
  if (!button) return;

  if (state.suppressCategoryClick) {
    state.suppressCategoryClick = false;
    return;
  }

  state.activeCategory = button.dataset.category;
  renderCategoryFilters();
  renderNotes();
}

function handleViewModeClick(event) {
  const button = event.target.closest("[data-view-mode]");
  if (!button) return;

  applyViewMode(button.dataset.viewMode);
  localStorage.setItem(STORAGE_KEYS.viewMode, state.viewMode);
  renderNotes();
}

function handleColorFilterClick(event) {
  const button = event.target.closest("[data-color-filter]");
  if (!button) return;

  applyColorFilter(button.dataset.colorFilter);
  localStorage.setItem(STORAGE_KEYS.colorFilter, state.colorFilter);
  renderNotes();
}

function toggleBooleanFilter(key, storageKey) {
  applyBooleanFilter(key, !state[key]);
  localStorage.setItem(storageKey, String(state[key]));
  renderNotes();
}

function resetFilters() {
  state.searchQuery = "";
  dom.searchInput.value = "";
  state.activeCategory = "全部";
  applyColorFilter("all");
  applyBooleanFilter("favoriteOnly", false);
  applyBooleanFilter("pinnedOnly", false);
  localStorage.setItem(STORAGE_KEYS.colorFilter, state.colorFilter);
  localStorage.setItem(STORAGE_KEYS.favoriteOnly, String(state.favoriteOnly));
  localStorage.setItem(STORAGE_KEYS.pinnedOnly, String(state.pinnedOnly));
  renderCategoryFilters();
  renderNotes();
}

function applyDashboardShortcut(type) {
  state.searchQuery = "";
  dom.searchInput.value = "";
  state.activeCategory = "全部";
  applyColorFilter("all");
  applyBooleanFilter("favoriteOnly", type === "favorite");
  applyBooleanFilter("pinnedOnly", type === "pinned");
  localStorage.setItem(STORAGE_KEYS.colorFilter, state.colorFilter);
  localStorage.setItem(STORAGE_KEYS.favoriteOnly, String(state.favoriteOnly));
  localStorage.setItem(STORAGE_KEYS.pinnedOnly, String(state.pinnedOnly));
  renderCategoryFilters();
  renderAll();
}

function handleRecentNoteClick(event) {
  const button = event.target.closest("[data-recent-note-id]");
  if (!button) return;

  selectNote(button.dataset.recentNoteId);
}

function toggleDashboardCollapsed() {
  state.dashboardCollapsed = !state.dashboardCollapsed;
  localStorage.setItem(STORAGE_KEYS.dashboardCollapsed, String(state.dashboardCollapsed));
  renderDashboard();
}

function handleCategoryPointerDown(event) {
  const button = event.target.closest("[data-category]");
  if (!button || event.target.closest("[data-category-menu]")) return;

  const category = button.dataset.category;
  if (!canManageCategory(category)) return;

  clearCategoryLongPress();
  state.categoryLongPressTimer = setTimeout(() => {
    state.suppressCategoryClick = true;
    openCategoryMenu(category);
    setTimeout(() => {
      state.suppressCategoryClick = false;
    }, 700);
  }, LONG_PRESS_MS);
}

function handleCategoryContextMenu(event) {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  const category = button.dataset.category;
  if (!canManageCategory(category)) return;

  event.preventDefault();
  openCategoryMenu(category);
}

function clearCategoryLongPress() {
  clearTimeout(state.categoryLongPressTimer);
  state.categoryLongPressTimer = null;
}

function openCategoryMenu(category) {
  if (!canManageCategory(category)) return;

  clearCategoryLongPress();
  state.categoryMenuTarget = category;
  dom.categoryMenuTitle.textContent = category;
  dom.categoryMenu.hidden = false;
  dom.categoryMenuEditButton.focus();
}

function closeCategoryMenu() {
  dom.categoryMenu.hidden = true;
  state.categoryMenuTarget = "";
}

function editCategoryFromMenu() {
  const category = state.categoryMenuTarget;
  closeCategoryMenu();
  openCategoryModal("edit", category);
}

function deleteCategoryFromMenu() {
  const category = state.categoryMenuTarget;
  closeCategoryMenu();
  deleteCategory(category);
}

function openCategoryModal(mode, categoryName = "") {
  state.categoryModalMode = mode;
  state.editingCategoryName = categoryName;
  dom.categoryModalTitle.textContent = mode === "edit" ? "カテゴリ編集" : "カテゴリ追加";
  dom.categoryNameInput.value = categoryName;
  dom.categoryModal.hidden = false;
  dom.categoryNameInput.focus();
  dom.categoryNameInput.select();
}

function closeCategoryModal() {
  dom.categoryModal.hidden = true;
  state.categoryModalMode = "add";
  state.editingCategoryName = "";
}

function saveCategoryFromModal() {
  flushAutoSave(false);
  const name = normalizeCategoryName(dom.categoryNameInput.value);
  const oldName = state.editingCategoryName;

  if (!name) {
    showToast("カテゴリ名を入力してください");
    return;
  }

  if (name === "全部") {
    showToast("「全部」は特別カテゴリです");
    return;
  }

  if (!isCategoryNameAvailable(name, oldName)) {
    showToast("同じカテゴリがすでにあります");
    return;
  }

  if (state.categoryModalMode === "edit") {
    renameCategory(oldName, name);
  } else {
    addCategory(name);
  }

  closeCategoryModal();
}

function addCategory(name) {
  insertCategoryBeforeOther(name);
  state.activeCategory = name;
  saveCategories();
  renderCategoryFilters();
  renderAll();
  showToast("カテゴリを追加しました");
}

function renameCategory(oldName, newName) {
  if (!canManageCategory(oldName)) return;

  if (oldName === newName) {
    renderCategoryFilters();
    renderAll();
    return;
  }

  state.categories = state.categories.map((category) => category === oldName ? newName : category);
  state.notes.forEach((note) => {
    if (note.category === oldName) {
      note.category = newName;
      note.updatedAt = new Date().toISOString();
    }
  });

  if (state.activeCategory === oldName) {
    state.activeCategory = newName;
  }

  saveCategories();
  saveNotes(false);
  renderCategoryFilters();
  renderAll();
  showToast("カテゴリ名を変更しました");
}

function deleteCategory(category) {
  if (!canManageCategory(category)) return;
  flushAutoSave(false);

  const ok = window.confirm(`「${category}」を削除しますか？\nこのカテゴリのメモは「その他」に移動します。`);
  if (!ok) return;

  state.categories = state.categories.filter((item) => item !== category);
  state.notes.forEach((note) => {
    if (note.category === category) {
      note.category = "その他";
      note.updatedAt = new Date().toISOString();
    }
  });

  if (state.activeCategory === category) {
    state.activeCategory = "全部";
  }

  saveCategories();
  saveNotes(false);
  renderCategoryFilters();
  renderAll();
  showToast("カテゴリを削除しました");
}

function renderNotes() {
  renderFilterControls();
  const visibleNotes = getVisibleNotes();
  dom.noteCount.textContent = `${visibleNotes.length}件`;
  renderEmptyState(visibleNotes.length);
  dom.notesGrid.classList.remove("is-card-view", "is-list-view", "is-compact-view");
  dom.notesGrid.classList.add(`is-${state.viewMode}-view`);
  dom.notesGrid.innerHTML = visibleNotes.map(renderNoteCard).join("");
}

function renderEmptyState(visibleCount) {
  const isEmpty = visibleCount === 0;
  const hasNotes = state.notes.length > 0;
  const filtered = hasActiveFilters();

  dom.emptyState.hidden = !isEmpty;
  dom.emptyClearFiltersButton.hidden = !filtered;
  dom.notesClearFiltersButton.hidden = !filtered;

  if (!isEmpty) return;

  if (hasNotes && filtered) {
    dom.emptyTitle.textContent = "条件に合うメモがありません";
    dom.emptyMessage.textContent = "検索条件やフィルターを変更してください。";
    return;
  }

  dom.emptyTitle.textContent = "メモがありません";
  dom.emptyMessage.textContent = "思いついたことを、まず1つだけ残しておきましょう。";
}

function renderNoteCard(note, index) {
  const selectedClass = note.id === state.selectedId ? " is-selected" : "";
  const pinnedClass = note.pinned ? " is-pinned" : "";
  const favoriteClass = note.favorite ? " is-favorite" : "";
  const colorClass = getNoteColorClass(note.color);
  const title = note.title.trim() || "無題メモ";
  const preview = note.body.trim() || "本文なし";
  const tags = note.tags.length
    ? note.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")
    : `<span class="tag">タグなし</span>`;
  const priorityClass = getPriorityClass(note.priority);

  return `
    <article class="note-card ${colorClass}${selectedClass}${pinnedClass}${favoriteClass}" style="--card-index: ${Math.min(index, 10)}" data-note-id="${escapeHtml(note.id)}">
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

  dom.noteViewPanel.hidden = !(state.isEditorOpen && hasNote && state.editorMode === "view");
  dom.noteForm.hidden = !(state.isEditorOpen && hasNote && state.editorMode === "edit");

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
    applyNoteColorClass(dom.editorPanel, "default");
    dom.editorHeading.textContent = "メモを選択";
    dom.saveState.textContent = "Ready";
    dom.titleInput.value = "";
    dom.bodyInput.value = "";
    renderCategorySelect("その他");
    dom.categorySelect.value = "その他";
    dom.prioritySelect.value = "中";
    dom.tagsInput.value = "";
    dom.pinnedInput.checked = false;
    dom.favoriteInput.checked = false;
    dom.createdAtText.textContent = "-";
    dom.updatedAtText.textContent = "-";
    dom.charCount.textContent = "0文字";
    renderColorPalette("default", true);
    return;
  }

  applyNoteColorClass(dom.editorPanel, note.color);

  if (state.editorMode === "view") {
    renderViewPanel(note);
  } else {
    renderEditForm(note);
  }
}

function renderEditForm(note) {
  applyNoteColorClass(dom.editorPanel, note.color);
  dom.editorHeading.textContent = note.title.trim() || "無題メモ";
  dom.saveState.textContent = "Saved";
  dom.titleInput.value = note.title;
  dom.bodyInput.value = note.body;
  renderCategorySelect(note.category);
  dom.categorySelect.value = note.category;
  dom.prioritySelect.value = note.priority;
  dom.tagsInput.value = note.tags.join(", ");
  dom.pinnedInput.checked = note.pinned;
  dom.favoriteInput.checked = note.favorite;
  renderColorPalette(note.color, false);
  renderEditorMeta(note);
  updateCharCount();
}

function renderViewPanel(note) {
  const title = note.title.trim() || "無題メモ";
  const priorityClass = getPriorityClass(note.priority);
  const tags = note.tags.length
    ? note.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")
    : `<span class="tag">タグなし</span>`;

  dom.viewHeading.textContent = title;
  dom.viewTitle.textContent = title;
  dom.viewCategory.textContent = note.category;
  dom.viewStatusRow.innerHTML = [
    `<span class="view-status-chip ${priorityClass}">重要度 ${escapeHtml(note.priority)}</span>`,
    note.pinned ? `<span class="view-status-chip">ピン留め</span>` : "",
    note.favorite ? `<span class="view-status-chip">お気に入り</span>` : ""
  ].join("");
  dom.viewTags.innerHTML = tags;
  dom.viewBody.innerHTML = renderMarkdownPreview(note.body);
  dom.viewCreatedAtText.textContent = formatDateTime(note.createdAt);
  dom.viewUpdatedAtText.textContent = formatDateTime(note.updatedAt);
  dom.viewPinButton.textContent = note.pinned ? "ピン解除" : "ピン留め";
  dom.viewPinButton.classList.toggle("is-on", note.pinned);
  dom.viewFavoriteButton.textContent = note.favorite ? "お気に入り解除" : "お気に入り";
  dom.viewFavoriteButton.classList.toggle("is-on", note.favorite);
  renderColorPaletteInto(dom.viewColorPalette, note.color, false);
}

function renderEditorMeta(note) {
  dom.createdAtText.textContent = formatDateTime(note.createdAt);
  dom.updatedAtText.textContent = formatDateTime(note.updatedAt);
}

function renderColorPalette(selectedColor, disabled) {
  renderColorPaletteInto(dom.colorPalette, selectedColor, disabled);
}

function renderColorPaletteInto(container, selectedColor, disabled) {
  const safeColor = normalizeNoteColor(selectedColor);

  container.innerHTML = NOTE_COLORS.map((color) => {
    const activeClass = color.id === safeColor ? " is-active" : "";
    const disabledAttribute = disabled ? " disabled" : "";

    return `
      <button class="color-chip${activeClass}" type="button" data-color-id="${escapeHtml(color.id)}" style="--swatch-color: ${escapeHtml(color.swatch)}" aria-label="${escapeHtml(color.label)}"${disabledAttribute}>
        <span aria-hidden="true"></span>
      </button>
    `;
  }).join("");
}

function handleColorSelect(event) {
  const button = event.target.closest("[data-color-id]");
  if (!button) return;

  const note = getSelectedNote();
  if (!note) return;

  note.color = normalizeNoteColor(button.dataset.colorId);
  note.updatedAt = new Date().toISOString();
  saveNotes(false);
  renderAll();
  showToast("メモカラーを変更しました");
}

function applyNoteColorClass(element, color) {
  NOTE_COLORS.forEach((item) => {
    element.classList.remove(getNoteColorClass(item.id));
  });
  element.classList.add(getNoteColorClass(color));
}

function selectInitialNote() {
  const firstVisible = getVisibleNotes()[0];
  state.selectedId = firstVisible ? firstVisible.id : null;
  state.editorMode = "view";
}

function selectNote(id) {
  flushAutoSave(false);
  state.selectedId = id;
  state.editorMode = "view";
  openEditor();
  renderAll();
  resetEditorScrollOnSmallScreen();
}

function switchToEditMode() {
  const note = getSelectedNote();
  if (!note) return;

  state.editorMode = "edit";
  renderAll();
  resetEditorScrollOnSmallScreen();
}

function switchToViewMode() {
  const note = getSelectedNote();
  if (!note) return;

  flushAutoSave(true);
  state.editorMode = "view";
  renderAll();
  resetEditorScrollOnSmallScreen();
}

function openTemplatePicker() {
  flushAutoSave(false);
  renderTemplatePicker();
  dom.templateModal.hidden = false;
  dom.templatePanel.scrollTop = 0;
  dom.templateCloseButton.focus();
}

function closeTemplatePicker() {
  dom.templateModal.hidden = true;
}

function renderTemplatePicker() {
  dom.templateGrid.innerHTML = NOTE_TEMPLATES.map((template) => {
    const chips = [template.category, ...template.tags.slice(0, 3)]
      .map((tag) => `<span class="template-chip">${escapeHtml(tag)}</span>`)
      .join("");

    return `
      <button class="template-card" type="button" data-template-id="${escapeHtml(template.id)}">
        <span class="template-name">${escapeHtml(template.name)}</span>
        <span class="template-meta">${chips}</span>
        <span class="template-preview">${escapeHtml(template.description)}</span>
      </button>
    `;
  }).join("");
}

function handleTemplateSelect(event) {
  const card = event.target.closest("[data-template-id]");
  if (!card) return;

  const template = NOTE_TEMPLATES.find((item) => item.id === card.dataset.templateId);
  if (!template) return;

  closeTemplatePicker();
  createNote(template);
}

function createNote(template = NOTE_TEMPLATES[0]) {
  flushAutoSave(false);

  const now = new Date().toISOString();
  const note = {
    id: createId(),
    title: template.title,
    body: template.body,
    category: getEditableCategories().includes(template.category) ? template.category : "その他",
    tags: uniqueTags(template.tags),
    priority: "中",
    pinned: false,
    favorite: false,
    color: "default",
    createdAt: now,
    updatedAt: now
  };

  state.notes.unshift(note);
  state.selectedId = note.id;
  state.editorMode = "edit";
  openEditor();
  saveNotes(false);
  renderAll();
  focusTitleAfterCreate();
  showToast(`${template.name}から作成しました`);
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
  state.editorMode = "view";
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
  renderDashboard();
}

// フォームの値をメモオブジェクトへ反映します。
function applyFormToNote(note, touchUpdatedAt) {
  note.title = dom.titleInput.value;
  note.body = dom.bodyInput.value;
  note.category = normalizeCategory(dom.categorySelect.value);
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
  state.editorMode = "view";
  saveNotes(false);
  renderAll();
}

function toggleSelectedFlag(key) {
  flushAutoSave(false);

  const note = getSelectedNote();
  if (!note || !["pinned", "favorite"].includes(key)) return;

  note[key] = !note[key];
  note.updatedAt = new Date().toISOString();
  saveNotes(false);
  renderAll();
}

function handlePreviewChecklistChange(event) {
  const checkbox = event.target.closest("[data-check-line]");
  if (!checkbox) return;

  const note = getSelectedNote();
  if (!note) return;

  const lineIndex = Number.parseInt(checkbox.dataset.checkLine, 10);
  if (!Number.isInteger(lineIndex)) return;

  const lines = note.body.split(/\r?\n/);
  const line = lines[lineIndex];
  if (typeof line !== "string" || !/^\s*-\s+\[( |x|X)\]\s*/.test(line)) return;

  lines[lineIndex] = line.replace(
    /^(\s*-\s+\[)( |x|X)(\]\s*)/,
    `$1${checkbox.checked ? "x" : " "}$3`
  );
  note.body = lines.join("\n");
  note.updatedAt = new Date().toISOString();
  saveNotes(false);
  renderAll();
  showToast("チェックリストを更新しました");
}

function renderMarkdownPreview(body) {
  const lines = toStringValue(body).split(/\r?\n/);

  if (lines.length === 0 || lines.every((line) => line.trim() === "")) {
    return `<p class="dashboard-empty">本文なし</p>`;
  }

  return lines.map((line, index) => renderMarkdownLine(line, index)).join("");
}

function renderMarkdownLine(line, index) {
  const trimmed = line.trim();

  if (!trimmed) {
    return `<div class="markdown-blank-line" aria-hidden="true"></div>`;
  }

  const checklistMatch = line.match(/^\s*-\s+\[( |x|X)\]\s*(.*)$/);
  if (checklistMatch) {
    const checked = checklistMatch[1].toLowerCase() === "x";
    const checkedAttribute = checked ? " checked" : "";
    const completeClass = checked ? " is-complete" : "";

    return `
      <label class="preview-check${completeClass}">
        <input type="checkbox" data-check-line="${index}"${checkedAttribute}>
        <span class="preview-check-text">${formatInlineMarkdown(checklistMatch[2])}</span>
      </label>
    `;
  }

  const heading3 = line.match(/^###\s+(.+)$/);
  if (heading3) {
    return `<h4>${formatInlineMarkdown(heading3[1])}</h4>`;
  }

  const heading2 = line.match(/^##\s+(.+)$/);
  if (heading2) {
    return `<h3>${formatInlineMarkdown(heading2[1])}</h3>`;
  }

  const bullet = line.match(/^\s*-\s+(.+)$/);
  if (bullet) {
    return `<ul><li>${formatInlineMarkdown(bullet[1])}</li></ul>`;
  }

  return `<p>${formatInlineMarkdown(line)}</p>`;
}

function formatInlineMarkdown(text) {
  return toStringValue(text)
    .split(/(https:\/\/[^\s<>"']+)/g)
    .map((part) => {
      if (part.startsWith("https://")) {
        return formatSafeLink(part);
      }

      return formatBoldText(part);
    })
    .join("");
}

function formatBoldText(text) {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function formatSafeLink(rawUrl) {
  const { url, trailing } = splitTrailingUrlPunctuation(rawUrl);
  const safeHref = escapeHtml(url);
  const safeText = escapeHtml(shortenUrl(url));
  const safeTrailing = formatBoldText(trailing);

  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeText}</a>${safeTrailing}`;
}

function splitTrailingUrlPunctuation(rawUrl) {
  const match = rawUrl.match(/^(.+?)([.,。、，）)\]]*)$/);
  if (!match) {
    return { url: rawUrl, trailing: "" };
  }

  return {
    url: match[1],
    trailing: match[2]
  };
}

function shortenUrl(url) {
  return url.length > 64 ? `${url.slice(0, 42)}...${url.slice(-14)}` : url;
}

function openEditor() {
  state.isEditorOpen = true;
}

function closeEditor() {
  flushAutoSave(true);
  state.isEditorOpen = false;
  cancelSheetDrag();
  renderAll();
}

function updateEditorShell() {
  const isOpen = state.isEditorOpen;
  const hasNote = Boolean(getSelectedNote());
  const hasOpenContent = isOpen && hasNote;
  dom.editorPanel.classList.toggle("is-closed", !isOpen);
  dom.editorPanel.classList.toggle("is-view-mode", hasOpenContent && state.editorMode === "view");
  dom.editorPanel.classList.toggle("is-edit-mode", hasOpenContent && state.editorMode === "edit");
  dom.noteViewPanel.hidden = !(hasOpenContent && state.editorMode === "view");
  dom.noteForm.hidden = !(hasOpenContent && state.editorMode === "edit");
  dom.editorClosedState.hidden = hasOpenContent || (isSmallScreen() && !isOpen);
  dom.body.classList.toggle("editor-open", isOpen && isSmallScreen());
}

function dismissKeyboard() {
  if (!isSmallScreen()) return;

  const activeElement = document.activeElement;
  if (activeElement && typeof activeElement.blur === "function") {
    activeElement.blur();
  }

  flushAutoSave(true);
}

function handleEditorBlankTap(event) {
  if (!state.isEditorOpen || !isSmallScreen()) return;
  if (event.target.closest("input, textarea, select, button, label")) return;

  dismissKeyboard();
}

function handleSheetTouchStart(event) {
  if (!state.isEditorOpen || !isSmallScreen() || event.touches.length !== 1) return;
  if (event.target.closest("button, input, select, textarea, label")) return;

  const touch = event.touches[0];
  state.sheetTouchStartY = touch.clientY;
  state.sheetTouchStartX = touch.clientX;
  state.sheetTouchDeltaY = 0;
  state.isSheetDragging = true;
  dom.editorPanel.classList.add("is-dragging");
}

function handleSheetTouchMove(event) {
  if (!state.isSheetDragging || event.touches.length !== 1) return;

  const touch = event.touches[0];
  const deltaY = touch.clientY - state.sheetTouchStartY;
  const deltaX = touch.clientX - state.sheetTouchStartX;
  const isMostlyVertical = Math.abs(deltaY) > Math.abs(deltaX) * 1.2;

  if (deltaY <= 0 || !isMostlyVertical) return;

  event.preventDefault();
  state.sheetTouchDeltaY = deltaY;
  dom.editorPanel.style.setProperty("--sheet-drag", `${Math.min(deltaY, 180)}px`);
}

function handleSheetTouchEnd() {
  if (!state.isSheetDragging) return;

  const shouldClose = state.sheetTouchDeltaY >= 80;
  cancelSheetDrag();

  if (shouldClose) {
    closeEditor();
  }
}

function cancelSheetDrag() {
  state.isSheetDragging = false;
  state.sheetTouchDeltaY = 0;
  dom.editorPanel.classList.remove("is-dragging");
  dom.editorPanel.style.removeProperty("--sheet-drag");
}

function getVisibleNotes() {
  const query = state.searchQuery;

  return [...state.notes]
    .filter((note) => {
      const matchesCategory = state.activeCategory === "全部" || note.category === state.activeCategory;
      const matchesColor = state.colorFilter === "all" || normalizeNoteColor(note.color) === state.colorFilter;
      const matchesFavorite = !state.favoriteOnly || note.favorite;
      const matchesPinned = !state.pinnedOnly || note.pinned;
      const searchableText = [
        note.title,
        note.body,
        note.category,
        note.tags.join(" ")
      ].join(" ").toLowerCase();

      return matchesCategory
        && matchesColor
        && matchesFavorite
        && matchesPinned
        && searchableText.includes(query);
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

  const exportedAt = new Date().toISOString();
  const payload = {
    app: "TOI MEMO",
    version: 2,
    appVersion: APP_VERSION,
    exportedAt,
    categories: state.categories,
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
  localStorage.setItem(STORAGE_KEYS.lastExportAt, exportedAt);
  renderSettings();
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
      const categories = normalizeImportedCategories(parsed, notes);

      if (notes.length === 0) {
        window.alert("取り込めるメモがありません。");
        return;
      }

      const ok = window.confirm("現在のメモを置き換えてインポートします。よろしいですか？");
      if (!ok) return;

      state.notes = notes;
      state.categories = categories;
      if (!state.categories.includes(state.activeCategory)) {
        state.activeCategory = "全部";
      }
      state.selectedId = getVisibleNotes()[0]?.id || state.notes[0]?.id || null;
      state.editorMode = "view";
      saveCategories();
      saveNotes(false);
      renderCategoryFilters();
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
    const category = normalizeCategory(raw?.category);
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
      color: normalizeNoteColor(raw?.color),
      createdAt: isValidDate(raw?.createdAt) ? raw.createdAt : now,
      updatedAt: isValidDate(raw?.updatedAt) ? raw.updatedAt : now
    };
  });
}

function normalizeImportedCategories(input, notes) {
  const rawCategories = Array.isArray(input?.categories) ? input.categories : [];
  const baseCategories = rawCategories.length > 0 ? rawCategories : DEFAULT_CATEGORIES;
  const categories = normalizeCategories(baseCategories, true);

  notes.forEach((note) => {
    const category = normalizeCategory(note.category);
    if (category !== "全部" && !categories.includes(category)) {
      const otherIndex = categories.indexOf("その他");
      categories.splice(otherIndex === -1 ? categories.length : otherIndex, 0, category);
    }
  });

  return normalizeCategories(categories, true);
}

function openSettings() {
  flushAutoSave(false);
  renderSettings();
  dom.settingsModal.hidden = false;
  dom.settingsCloseButton.focus();
}

function closeSettings() {
  dom.settingsModal.hidden = true;
}

function renderSettings() {
  if (!dom.settingsVersion) return;

  const lastExportAt = getLastExportAt();
  dom.settingsVersion.textContent = `TOI MEMO v${APP_VERSION}`;
  dom.settingsNoteCount.textContent = `${state.notes.length}件`;
  dom.settingsLastBackup.textContent = lastExportAt ? formatDateTime(lastExportAt) : "未バックアップ";
  dom.backupAdvice.hidden = !shouldRecommendBackup(lastExportAt);
  dom.showDashboardToggle.checked = state.showDashboard;
}

function getLastExportAt() {
  const value = localStorage.getItem(STORAGE_KEYS.lastExportAt);
  return isValidDate(value) ? value : "";
}

function shouldRecommendBackup(lastExportAt) {
  if (state.notes.length >= 5 && !lastExportAt) {
    return true;
  }

  if (!lastExportAt) {
    return false;
  }

  const backupAge = Date.now() - Date.parse(lastExportAt);
  return backupAge >= BACKUP_RECOMMEND_DAYS * 24 * 60 * 60 * 1000;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return uniqueTags(value.map(toStringValue));
  }

  return parseTags(toStringValue(value));
}

function normalizeCategory(value) {
  const category = toStringValue(value).trim();
  return category && category !== "全部" ? category : "その他";
}

function normalizeCategoryName(value) {
  return toStringValue(value).trim();
}

function uniqueCategoryNames(categories) {
  const seen = new Set();
  const result = [];

  categories.forEach((category) => {
    const clean = normalizeCategoryName(category);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) return;
    seen.add(key);
    result.push(clean);
  });

  return result;
}

function getEditableCategories() {
  return state.categories.filter((category) => category !== "全部");
}

function canManageCategory(category) {
  return state.categories.includes(category) && !PROTECTED_CATEGORIES.includes(category);
}

function isCategoryNameAvailable(name, exceptName = "") {
  const normalizedName = name.toLowerCase();
  const normalizedExcept = exceptName.toLowerCase();

  return !state.categories.some((category) => (
    category.toLowerCase() === normalizedName
    && category.toLowerCase() !== normalizedExcept
  ));
}

function insertCategoryBeforeOther(category) {
  if (!category || state.categories.includes(category)) return;

  const otherIndex = state.categories.indexOf("その他");
  state.categories.splice(otherIndex === -1 ? state.categories.length : otherIndex, 0, category);
}

function normalizeNoteColor(value) {
  const color = toStringValue(value).trim();
  return NOTE_COLORS.some((item) => item.id === color) ? color : "default";
}

function getNoteColorClass(value) {
  return `color-${normalizeNoteColor(value)}`;
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

function applySortMode(sortMode) {
  const safeSortMode = SORT_MODES.includes(sortMode) ? sortMode : "pinned";
  state.sortMode = safeSortMode;
  dom.sortSelect.value = safeSortMode;
}

function loadSortMode() {
  return localStorage.getItem(STORAGE_KEYS.sortMode) || "pinned";
}

function applyViewMode(viewMode) {
  state.viewMode = VIEW_MODES.includes(viewMode) ? viewMode : "card";
}

function loadViewMode() {
  return localStorage.getItem(STORAGE_KEYS.viewMode) || "card";
}

function applyColorFilter(colorFilter) {
  const safeColor = colorFilter === "all" || NOTE_COLORS.some((color) => color.id === colorFilter)
    ? colorFilter
    : "all";
  state.colorFilter = safeColor;
}

function loadColorFilter() {
  return localStorage.getItem(STORAGE_KEYS.colorFilter) || "all";
}

function applyBooleanFilter(key, value) {
  state[key] = Boolean(value);
}

function loadBooleanFilter(storageKey) {
  return localStorage.getItem(storageKey) === "true";
}

function applyShowDashboard(value) {
  state.showDashboard = Boolean(value);
}

function loadShowDashboard() {
  const stored = localStorage.getItem(STORAGE_KEYS.showDashboard);
  return stored === null ? true : stored === "true";
}

function applyDashboardCollapsed(value) {
  state.dashboardCollapsed = Boolean(value);
}

function loadDashboardCollapsed() {
  const stored = localStorage.getItem(STORAGE_KEYS.dashboardCollapsed);
  return stored === null ? true : stored === "true";
}

function hasActiveFilters() {
  return Boolean(state.searchQuery)
    || state.activeCategory !== "全部"
    || state.colorFilter !== "all"
    || state.favoriteOnly
    || state.pinnedOnly;
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

function focusTitleAfterCreate() {
  if (isSmallScreen()) {
    requestAnimationFrame(scrollEditorFormToTop);
    return;
  }

  dom.titleInput.focus();
}

function resetEditorScrollOnSmallScreen() {
  if (isSmallScreen()) {
    requestAnimationFrame(scrollEditorFormToTop);
  }
}

function scrollEditorFormToTop() {
  dom.editorPanel.scrollTop = 0;
  dom.noteViewPanel.scrollTop = 0;
  dom.noteForm.scrollTop = 0;
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

function isSameLocalDay(value, targetDate) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.getFullYear() === targetDate.getFullYear()
    && date.getMonth() === targetDate.getMonth()
    && date.getDate() === targetDate.getDate();
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

function registerServiceWorker() {
  const canRegister = "serviceWorker" in navigator && /^https?:$/.test(window.location.protocol);
  if (!canRegister) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (state.isUpdateReloading) return;
    state.isUpdateReloading = true;
    window.location.reload();
  });

  navigator.serviceWorker.register("./service-worker.js")
    .then((registration) => {
      watchServiceWorkerUpdate(registration);
      checkForServiceWorkerUpdate(registration);
    })
    .catch((error) => {
      console.warn("TOI MEMO: Service Worker registration failed.", error);
    });

  navigator.serviceWorker.ready
    .then((registration) => {
      checkForServiceWorkerUpdate(registration);
    })
    .catch((error) => {
      console.warn("TOI MEMO: Service Worker ready check failed.", error);
    });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;

    navigator.serviceWorker.ready
      .then((registration) => {
        checkForServiceWorkerUpdate(registration);
      })
      .catch((error) => {
        console.warn("TOI MEMO: Service Worker visibility update check failed.", error);
      });
  });
}

function checkForServiceWorkerUpdate(registration) {
  if (!registration) return Promise.resolve();

  if (registration.waiting && navigator.serviceWorker.controller) {
    showUpdateNotice(registration.waiting);
    return Promise.resolve();
  }

  return registration.update()
    .then(() => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateNotice(registration.waiting);
      }
    })
    .catch((error) => {
      console.warn("TOI MEMO: Service Worker update check failed.", error);
    });
}

function watchServiceWorkerUpdate(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    showUpdateNotice(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) return;

    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        showUpdateNotice(registration.waiting || worker);
      }
    });
  });
}

function showUpdateNotice(worker) {
  if (!worker) return;

  state.waitingWorker = worker;
  dom.updateBanner.hidden = false;
}

function hideUpdateNotice() {
  dom.updateBanner.hidden = true;
}

function applyServiceWorkerUpdate() {
  hideUpdateNotice();

  if (state.waitingWorker) {
    state.waitingWorker.postMessage({ type: "SKIP_WAITING" });

    setTimeout(() => {
      if (state.isUpdateReloading) return;
      state.isUpdateReloading = true;
      window.location.reload();
    }, 1200);
    return;
  }

  state.isUpdateReloading = true;
  window.location.reload();
}
