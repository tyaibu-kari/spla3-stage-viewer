"use strict";
/* =========================================================
   スプラ ステージビューアー - app.js
   完全オフライン動作の個人用ツール。

   画像は同梱の manifest.js (IMAGE_MANIFEST) に書かれた相対パスから
   自動で読み込みます(「スプラ図面_Claude」フォルダ内の画像を、
   コピーせずそのまま参照します)。
   画像フォルダの位置を変えた/画像を追加した場合は manifest.js の
   再生成が必要です(Claudeに頼めば再生成できます)。
   それとは別に、ヘッダーの「画像フォルダを追加」ボタンから、
   その場限りで別の画像フォルダを追加読み込みすることもできます
   (この方法で追加した画像はブラウザを閉じるたびに選び直しが必要です)。

   注記・3D設定は localStorage に保存され、次回同じ画像を
   開いたときも自動的に復元されます。
   ========================================================= */

const STORAGE_PREFIX = "splatapp_v1";

// ---------- グローバル状態 ----------
let modes = {};              // { モード名: [ {mode,base,label,file} ... ] }
let modeOrder = [];
let currentMode = null;
let currentItem = null;      // 現在選択中のステージ画像 item
let currentObjectUrl = null;
let currentImage = null;     // Image() ロード済み

// 白黒版/カラー版の表示切替(全ステージ共通の好みとして保存)
// カラー版が用意されているステージが増えてきたら、既定値を"color"に変更してください。
let colorMode = "bw"; // 'color' | 'bw'
try { colorMode = localStorage.getItem(`${STORAGE_PREFIX}_colormode`) || "bw"; } catch (e) {}

let activeTab = "2d";        // '2d' | '3d'

// 2D 注記
let annotations = [];
let annotHistory = [];
let annotRedoStack = [];
let tool2d = "pen";
let drawColor = "#ff3b30";
let drawWidth = 4;
let is2dPointerDown = false;
let dragStartPos = null;
let currentPath = null;
let previewObj = null;
let selectedIndex = -1;
let draggingSelected = false;
let dragOrigSnapshot = null;
let zoom2d = 1;
let nativeW2d = 0;
let nativeH2d = 0;
let draggingHandle = null; // 定規/コンパスなどのハンドルドラッグ中のキー

// プレイヤー配置(4対4)
let players = [];               // { id, team:'ally'|'enemy', num, x, y, weaponClass, weaponName, special }
let draggingPlayer = -1;
let dragPlayerOrig = null;
let dragMoved = false;
let selectedPlayerIndex = -1;
let editingPlayerIndex = -1;
const PLAYER_RADIUS = 22;
const WEAPON_CLASSES = ["シューター", "ブラスター", "ローラー", "フデ", "チャージャー", "スロッシャー", "スピナー", "マニューバー", "シェルター", "ストリンガー", "ワイパー"];
const WEAPON_CLASS_ABBR = {
  "シューター": "シュ", "ブラスター": "ブラ", "ローラー": "ロラ", "フデ": "フデ", "チャージャー": "チャ",
  "スロッシャー": "スロ", "スピナー": "スピ", "マニューバー": "マニ", "シェルター": "シェ", "ストリンガー": "スト", "ワイパー": "ワイ",
};
function findWeapon(category, name) {
  if (typeof WEAPON_DATA === "undefined") return null;
  return WEAPON_DATA.find((w) => w.category === category && w.name === name) || null;
}

// スペシャルウェポン配置(複数配置可、射程1/射程2/爆風込み射程を個別に表示切替)
let specials = [];              // { id, name, x, y, showRange1, showRange2, showRangeBlast }
let draggingSpecial = -1;
let dragSpecialOrig = null;
let selectedSpecialIndex = -1;
let editingSpecialIndex = -1;
const SPECIAL_RADIUS = 20;
function findSpecial(name) {
  if (typeof SPECIAL_RANGE_DATA === "undefined") return null;
  return SPECIAL_RANGE_DATA[name] || null;
}

// 射程スケール校正(画像上の「射程(試し打ち場のライン)」目盛りとpxの対応)
let rangeScale = null; // { pxPerUnit }
let calibratingScale = false;
let calibDragging = false;
let calibStart = null;
let calibPreview = null;

// 3D 用の平面図形状
let shapes3D = [];
let tool3d = "area";
let pendingPoints = [];
let color3d = "#4fc3f7";
let mouse3dPos = null;

// three.js
let three = { renderer: null, scene: null, camera: null, controls: null, ground: null, meshes: [] };
let resizeObserverAttached = false;

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const folderInput = $("folderInput");
const importFileInput = $("importFileInput");
const statusText = $("statusText");
const modeTabsEl = $("modeTabs");
const stageListEl = $("stageList");
const stageSearchEl = $("stageSearch");

const baseCanvas = $("baseCanvas");
const drawCanvas = $("drawCanvas");
const baseCtx = baseCanvas.getContext("2d");
const drawCtx = drawCanvas.getContext("2d");
const canvasWrap = $("canvasWrap");
const canvasInner = $("canvasInner");
const emptyMsg = $("emptyMsg");

const baseCanvas3d = $("baseCanvas3d");
const drawCanvas3d = $("drawCanvas3d");
const baseCtx3d = baseCanvas3d.getContext("2d");
const drawCtx3d = drawCanvas3d.getContext("2d");
const canvasWrap3d = $("canvasWrap3d");
const emptyMsg3d = $("emptyMsg3d");

/* =========================================================
   画像読み込み (manifest.js 自動読み込み + フォルダ手動追加)
   ========================================================= */
const MODE_ORDER_HINT = ["ナワバリ", "エリア", "ヤグラ", "ホコ", "アサリ"];

function parseFilename(filename) {
  const m = filename.match(/^[（(]([^）)]+)[）)]\s*(.+?)\s*\.(jpe?g|png|webp)$/i);
  if (m) return { mode: m[1], base: m[2].trim(), ext: m[3].toLowerCase() };
  const extM = filename.match(/\.(jpe?g|png|webp)$/i);
  return { mode: "その他", base: filename.replace(/\.(jpe?g|png|webp)$/i, ""), ext: extM ? extM[1].toLowerCase() : "" };
}

function dedupeModeItems(arr) {
  const counts = {};
  for (const it of arr) counts[it.base] = (counts[it.base] || 0) + 1;
  for (const it of arr) {
    if (counts[it.base] > 1) {
      const name = it.file ? it.file.name : it.path;
      const extM = name.match(/\.(jpe?g|png|webp)$/i);
      it.base = it.base + (extM ? `(${extM[1].toLowerCase()})` : "");
      it.label = it.base;
      it.key = it.mode + "::" + it.base;
    }
  }
}

function rebuildModeOrder() {
  modeOrder = Object.keys(modes).sort((a, b) => {
    const ia = MODE_ORDER_HINT.indexOf(a), ib = MODE_ORDER_HINT.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "ja");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  for (const mode of modeOrder) {
    modes[mode].sort((a, b) => a.base.localeCompare(b.base, "ja"));
  }
}

// items: [{mode, base, label, path?, file?}]  path=マニフェスト由来 / file=手動追加(Fileオブジェクト)
function addItems(items) {
  for (const item of items) {
    item.key = item.mode + "::" + item.base;
    if (!modes[item.mode]) modes[item.mode] = [];
    modes[item.mode] = modes[item.mode].filter((x) => x.key !== item.key);
    modes[item.mode].push(item);
  }
  for (const mode of Object.keys(modes)) dedupeModeItems(modes[mode]);
  rebuildModeOrder();
}

function countAllItems() {
  return Object.values(modes).reduce((s, arr) => s + arr.length, 0);
}

function loadFromManifest() {
  if (typeof IMAGE_MANIFEST === "undefined" || !Array.isArray(IMAGE_MANIFEST) || IMAGE_MANIFEST.length === 0) {
    statusText.textContent = "manifest.js が見つからないか空です。「画像フォルダを追加」から手動で読み込んでください。";
    return;
  }
  const items = IMAGE_MANIFEST.map((e) => ({ mode: e.mode, base: e.base, label: e.base, path: e.path, pathColor: e.pathColor || null }));
  addItems(items);
  currentMode = modeOrder[0];
  renderModeTabs();
  renderStageList();
  statusText.textContent = `${countAllItems()} 件の画像を自動読み込みしました(${modeOrder.join(" / ")})。左のリストからステージを選んでください。`;
}

/* 白黒版/カラー版 切り替え */
function updateColorModeButton() {
  const btn = $("btnColorMode");
  if (!btn) return;
  if (colorMode === "color") {
    btn.textContent = "🎨 カラー表示";
    btn.classList.add("active");
  } else {
    btn.textContent = "⚫ 白黒表示";
    btn.classList.remove("active");
  }
}
updateColorModeButton();
$("btnColorMode").addEventListener("click", () => {
  colorMode = colorMode === "color" ? "bw" : "color";
  try { localStorage.setItem(`${STORAGE_PREFIX}_colormode`, colorMode); } catch (e) {}
  updateColorModeButton();
  if (currentItem && !currentItem.file) selectItem(currentItem);
});

$("btnPickFolder").addEventListener("click", () => folderInput.click());

folderInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files).filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name));
  if (files.length === 0) {
    statusText.textContent = "画像ファイル(jpg/png)が見つかりませんでした。";
    return;
  }
  const items = files.map((f) => {
    const { mode, base } = parseFilename(f.name);
    return { mode, base, label: base, file: f };
  });
  addItems(items);
  statusText.textContent = `${files.length} 件の画像を追加で読み込みました(合計 ${countAllItems()} 件)。`;
  renderModeTabs();
  if (!currentMode) currentMode = modeOrder[0];
  renderStageList();
});

loadFromManifest(); // このスクリプトは body 末尾で読み込まれるためDOMは準備済み

function renderModeTabs() {
  modeTabsEl.innerHTML = "";
  for (const mode of modeOrder) {
    const btn = document.createElement("button");
    btn.className = "btn small" + (mode === currentMode ? " active" : "");
    btn.textContent = `${mode} (${modes[mode].length})`;
    btn.addEventListener("click", () => {
      currentMode = mode;
      renderModeTabs();
      renderStageList();
    });
    modeTabsEl.appendChild(btn);
  }
}

function renderStageList() {
  stageListEl.innerHTML = "";
  if (!currentMode) return;
  const query = stageSearchEl.value.trim();
  const items = modes[currentMode].filter((it) => it.label.includes(query));
  for (const item of items) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = item.label;
    if (currentItem && currentItem.key === item.key) btn.classList.add("active");
    btn.addEventListener("click", () => selectItem(item));
    li.appendChild(btn);
    stageListEl.appendChild(li);
  }
}
stageSearchEl.addEventListener("input", renderStageList);

/* =========================================================
   ステージ選択
   ========================================================= */
// カラーモードが有効かつそのステージにカラー版があればカラー版のパスを、
// 無ければ白黒版のパスを返す。手動追加(Fileオブジェクト)のアイテムは対象外。
function resolveItemPath(item) {
  if (colorMode === "color" && item.pathColor) return item.pathColor;
  return item.path;
}
function selectItem(item) {
  currentItem = item;
  renderStageList();
  if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    const colorNote = !item.file && colorMode === "color" && !item.pathColor ? "(カラー版なし・白黒表示)" : "";
    statusText.textContent = `[${item.mode}] ${item.label} ${colorNote}`;
    setupCanvases(img);
    annotations = loadAnnotations(item);
    annotHistory = [];
    annotRedoStack = [];
    selectedIndex = -1;
    players = loadPlayers(item);
    selectedPlayerIndex = -1;
    draggingPlayer = -1;
    renderPlayerCount();
    specials = loadSpecials(item);
    selectedSpecialIndex = -1;
    draggingSpecial = -1;
    rangeScale = loadRangeScale(item);
    updateRangeScaleLabel();
    render2D();

    shapes3D = loadShapes3D(item);
    pendingPoints = [];
    renderPlan3d();
    renderShapeList();
    rebuild3DScene();
  };
  img.onerror = () => {
    statusText.textContent = `[${item.mode}] ${item.label} の画像を読み込めませんでした(ファイルが見つからないか移動された可能性があります)。`;
  };
  if (item.file) {
    // 手動でフォルダ追加した画像 (Fileオブジェクト)
    currentObjectUrl = URL.createObjectURL(item.file);
    img.src = currentObjectUrl;
  } else {
    // manifest.js 由来の画像 (相対パスでそのまま参照、コピーしない)
    img.src = resolveItemPath(item);
  }
}

const MAX_DIM = 3200; // 実寸に近い解像度を保持(射程ラインなど細い線が多いため)
function setupCanvases(img) {
  const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  nativeW2d = w;
  nativeH2d = h;

  // 2D注記タブ: canvasInner(実寸)を transform:scale で見た目だけ拡縮し、
  // canvasWrap(レイアウト上の箱)はズーム後の実サイズに合わせる。
  // (transformはレイアウトサイズに影響しないため、箱ごと拡縮しないと
  //  スクロール領域や中央寄せの計算が実寸のままズレて余白ができてしまう)
  baseCanvas.width = w; baseCanvas.height = h;
  drawCanvas.width = w; drawCanvas.height = h;
  canvasInner.style.width = w + "px";
  canvasInner.style.height = h + "px";
  canvasWrap.style.display = "block";
  emptyMsg.style.display = "none";
  baseCtx.clearRect(0, 0, w, h);
  baseCtx.drawImage(img, 0, 0, w, h);

  // 3Dモデルタブの平面図編集エリア: ズーム機能が無いので従来通り実寸のまま
  baseCanvas3d.width = w; baseCanvas3d.height = h;
  drawCanvas3d.width = w; drawCanvas3d.height = h;
  canvasWrap3d.style.width = w + "px";
  canvasWrap3d.style.height = h + "px";
  canvasWrap3d.style.display = "block";
  emptyMsg3d.style.display = "none";
  baseCtx3d.clearRect(0, 0, w, h);
  baseCtx3d.drawImage(img, 0, 0, w, h);

  applyZoom();
}

function applyZoom() {
  canvasInner.style.transform = `scale(${zoom2d})`;
  if (nativeW2d && nativeH2d) {
    canvasWrap.style.width = Math.round(nativeW2d * zoom2d) + "px";
    canvasWrap.style.height = Math.round(nativeH2d * zoom2d) + "px";
  }
}
$("btnZoomIn").addEventListener("click", () => { zoom2d = Math.min(3, zoom2d + 0.1); applyZoom(); updateZoomLabel(); });
$("btnZoomOut").addEventListener("click", () => { zoom2d = Math.max(0.2, zoom2d - 0.1); applyZoom(); updateZoomLabel(); });
$("btnZoomReset").addEventListener("click", () => { zoom2d = 1; applyZoom(); updateZoomLabel(); });
function updateZoomLabel() { $("zoomLabel").textContent = Math.round(zoom2d * 100) + "%"; }

/* =========================================================
   localStorage 永続化
   ========================================================= */
function annotKey(item) { return `${STORAGE_PREFIX}_annot::${item.mode}::${item.base}`; }
function shapesKey(item) { return `${STORAGE_PREFIX}_shapes3d::${item.mode}::${item.base}`; }

function loadAnnotations(item) {
  try { return JSON.parse(localStorage.getItem(annotKey(item)) || "[]"); }
  catch (e) { return []; }
}
function saveAnnotations() {
  if (!currentItem) return;
  try { localStorage.setItem(annotKey(currentItem), JSON.stringify(annotations)); } catch (e) {}
}
function loadShapes3D(item) {
  try { return JSON.parse(localStorage.getItem(shapesKey(item)) || "[]"); }
  catch (e) { return []; }
}
function saveShapes3D() {
  if (!currentItem) return;
  try { localStorage.setItem(shapesKey(currentItem), JSON.stringify(shapes3D)); } catch (e) {}
}

function playersKey(item) { return `${STORAGE_PREFIX}_players::${item.mode}::${item.base}`; }
function loadPlayers(item) {
  try { return JSON.parse(localStorage.getItem(playersKey(item)) || "[]"); }
  catch (e) { return []; }
}
function savePlayers() {
  if (!currentItem) return;
  try { localStorage.setItem(playersKey(currentItem), JSON.stringify(players)); } catch (e) {}
}

function rangeScaleKey(item) { return `${STORAGE_PREFIX}_rangescale::${item.mode}::${item.base}`; }
// あらかじめ同梱された初期値(rangescale.js の DEFAULT_RANGE_SCALE)を、
// このユーザーがまだ自分で校正していないステージにだけ適用する。
// "モード::ステージ名" の個別指定を優先し、無ければ "*::ステージ名"(全モード共通)を見る。
function findDefaultRangeScale(item) {
  if (typeof DEFAULT_RANGE_SCALE === "undefined") return null;
  return DEFAULT_RANGE_SCALE[`${item.mode}::${item.base}`]
    || DEFAULT_RANGE_SCALE[`*::${item.base}`]
    || null;
}
function loadRangeScale(item) {
  try {
    const saved = JSON.parse(localStorage.getItem(rangeScaleKey(item)) || "null");
    if (saved) return saved;
  } catch (e) { /* ignore, fall through to default */ }
  return findDefaultRangeScale(item);
}
function saveRangeScale() {
  if (!currentItem) return;
  try { localStorage.setItem(rangeScaleKey(currentItem), JSON.stringify(rangeScale)); } catch (e) {}
}
function updateRangeScaleLabel() {
  const el = $("rangeScaleLabel");
  if (!el) return;
  if (!rangeScale) { el.textContent = "射程スケール: 未設定"; return; }
  let ownSaved = false;
  if (currentItem) {
    try { ownSaved = !!localStorage.getItem(rangeScaleKey(currentItem)); } catch (e) {}
  }
  const suffix = ownSaved ? "" : "(初期値・再校正できます)";
  el.textContent = `射程スケール: 1目盛=${rangeScale.pxPerUnit.toFixed(1)}px ${suffix}`;
}

function specialsKey(item) { return `${STORAGE_PREFIX}_specials::${item.mode}::${item.base}`; }
function loadSpecials(item) {
  try { return JSON.parse(localStorage.getItem(specialsKey(item)) || "[]"); }
  catch (e) { return []; }
}
function saveSpecials() {
  if (!currentItem) return;
  try { localStorage.setItem(specialsKey(currentItem), JSON.stringify(specials)); } catch (e) {}
}

$("btnExportAll").addEventListener("click", () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) data[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(data, null, 0)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "splatapp_backup.json";
  a.click();
});
$("btnImportAll").addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      for (const k of Object.keys(data)) {
        if (k.startsWith(STORAGE_PREFIX)) localStorage.setItem(k, data[k]);
      }
      alert("データを読み込みました。");
      if (currentItem) selectItem(currentItem);
    } catch (err) {
      alert("読み込みに失敗しました: " + err.message);
    }
  };
  reader.readAsText(f);
  importFileInput.value = "";
});

/* =========================================================
   タブ切り替え
   ========================================================= */
$("tabBtn2D").addEventListener("click", () => switchTab("2d"));
$("tabBtn3D").addEventListener("click", () => switchTab("3d"));
function switchTab(tab) {
  activeTab = tab;
  $("tabBtn2D").classList.toggle("active", tab === "2d");
  $("tabBtn3D").classList.toggle("active", tab === "3d");
  $("view2d").classList.toggle("visible", tab === "2d");
  $("view3d").classList.toggle("visible", tab === "3d");
  if (tab === "3d") {
    setTimeout(() => { initThreeIfNeeded(); onThreeContainerResize(); rebuild3DScene(); }, 0);
  }
}

/* =========================================================
   2D 注記エディタ
   ========================================================= */
document.querySelectorAll('input[name="t2d"]').forEach((r) => {
  r.addEventListener("change", (e) => {
    tool2d = e.target.value;
    selectedIndex = -1;
    render2D();
    updateCursor2d();
  });
});
$("colorPicker").addEventListener("input", (e) => (drawColor = e.target.value));
$("widthPicker").addEventListener("input", (e) => (drawWidth = parseInt(e.target.value, 10)));

function getPos2d(e) {
  const r = drawCanvas.getBoundingClientRect();
  const sx = drawCanvas.width / r.width;
  const sy = drawCanvas.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}

function pushHistory() {
  annotHistory.push(JSON.stringify(annotations));
  if (annotHistory.length > 60) annotHistory.shift();
  annotRedoStack = [];
}
function undo2d() {
  if (!annotHistory.length) return;
  annotRedoStack.push(JSON.stringify(annotations));
  annotations = JSON.parse(annotHistory.pop());
  selectedIndex = -1;
  saveAnnotations();
  render2D();
}
function redo2d() {
  if (!annotRedoStack.length) return;
  annotHistory.push(JSON.stringify(annotations));
  annotations = JSON.parse(annotRedoStack.pop());
  saveAnnotations();
  render2D();
}
$("btnUndo2d").addEventListener("click", undo2d);
$("btnRedo2d").addEventListener("click", redo2d);
$("btnClear2d").addEventListener("click", () => {
  if (!currentItem) return;
  if (!confirm("この画像の注記をすべて消去します。よろしいですか？")) return;
  pushHistory();
  annotations = [];
  saveAnnotations();
  render2D();
});

const canvasScrollEl = $("canvasScroll");
let isPanning2d = false;
let panStart2d = null;
let panScrollStart2d = null;
let tempErasing2d = false;

function updateCursor2d() {
  if (isPanning2d) { drawCanvas.style.cursor = "grabbing"; return; }
  drawCanvas.style.cursor = tool2d === "select" ? "default" : tool2d === "text" ? "text" : "crosshair";
}

drawCanvas.addEventListener("contextmenu", (e) => e.preventDefault());
drawCanvas.addEventListener("mousedown", (e) => { if (e.button === 1) e.preventDefault(); });

drawCanvas.addEventListener("pointerdown", (e) => {
  if (!currentItem) return;
  drawCanvas.setPointerCapture(e.pointerId);
  const p = getPos2d(e);

  if (e.button === 1) {
    // 中クリック(ホイール押し込み)ドラッグ: 画像の表示位置を移動(パン)
    e.preventDefault();
    isPanning2d = true;
    panStart2d = { x: e.clientX, y: e.clientY };
    panScrollStart2d = { left: canvasScrollEl.scrollLeft, top: canvasScrollEl.scrollTop };
    updateCursor2d();
    return;
  }
  if (e.button === 2) {
    // 右クリックドラッグ: 選択中のツールに関わらず一時的に消しゴムとして使う
    tempErasing2d = true;
    pushHistory();
    eraseAt(p);
    return;
  }
  if (e.button !== 0) return;

  if (calibratingScale) {
    calibDragging = true;
    calibStart = p;
    calibPreview = { type: "ruler", x1: p.x, y1: p.y, x2: p.x, y2: p.y, color: "#ffeb3b", width: 3 };
    render2D();
    return;
  }

  if (tool2d === "select") {
    // 1. 選択中オブジェクトのハンドル(定規の端・コンパスの中心/外周など)に当たったか
    if (selectedIndex >= 0 && annotations[selectedIndex]) {
      const handleKey = hitTestHandle(annotations[selectedIndex], p, 10);
      if (handleKey) {
        draggingHandle = handleKey;
        dragOrigSnapshot = JSON.parse(JSON.stringify(annotations[selectedIndex]));
        pushHistory();
        render2D();
        return;
      }
    }
    // 2. プレイヤーマーカー(一番上に描画されるので優先)に当たったか
    const pIdx = hitTestPlayer(p);
    if (pIdx >= 0) {
      selectedIndex = -1;
      selectedSpecialIndex = -1;
      selectedPlayerIndex = pIdx;
      draggingPlayer = pIdx;
      dragStartPos = p;
      dragPlayerOrig = { x: players[pIdx].x, y: players[pIdx].y };
      dragMoved = false;
      render2D();
      return;
    }
    // 2b. スペシャル配置マーカーに当たったか
    const sIdx = hitTestSpecial(p);
    if (sIdx >= 0) {
      selectedIndex = -1;
      selectedPlayerIndex = -1;
      selectedSpecialIndex = sIdx;
      draggingSpecial = sIdx;
      dragStartPos = p;
      dragSpecialOrig = { x: specials[sIdx].x, y: specials[sIdx].y };
      render2D();
      return;
    }
    // 3. 通常の注記オブジェクト
    selectedPlayerIndex = -1;
    selectedSpecialIndex = -1;
    const idx = hitTest(annotations, p.x, p.y);
    selectedIndex = idx;
    if (idx >= 0) {
      draggingSelected = true;
      dragStartPos = p;
      dragOrigSnapshot = JSON.parse(JSON.stringify(annotations[idx]));
      pushHistory();
    }
    render2D();
    return;
  }
  if (tool2d === "text") {
    const txt = prompt("テキストを入力してください:");
    if (txt) {
      pushHistory();
      annotations.push({ type: "text", x: p.x, y: p.y, text: txt, color: drawColor, fontSize: Math.max(16, drawWidth * 4) });
      saveAnnotations();
      render2D();
    }
    return;
  }
  if (tool2d === "eraser") {
    pushHistory();
    is2dPointerDown = true;
    eraseAt(p);
    return;
  }
  is2dPointerDown = true;
  dragStartPos = p;
  pushHistory();
  if (tool2d === "pen") {
    currentPath = { type: "path", points: [[p.x, p.y]], color: drawColor, width: drawWidth };
  }
});

drawCanvas.addEventListener("dblclick", (e) => {
  if (!currentItem || tool2d !== "select") return;
  const p = getPos2d(e);
  const pIdx = hitTestPlayer(p);
  if (pIdx >= 0) { openPlayerEditor(pIdx); return; }
  const sIdx = hitTestSpecial(p);
  if (sIdx >= 0) openSpecialEditor(sIdx);
});

drawCanvas.addEventListener("pointermove", (e) => {
  if (isPanning2d) {
    const dx = e.clientX - panStart2d.x, dy = e.clientY - panStart2d.y;
    canvasScrollEl.scrollLeft = panScrollStart2d.left - dx;
    canvasScrollEl.scrollTop = panScrollStart2d.top - dy;
    return;
  }
  const p = getPos2d(e);
  if (tempErasing2d) { eraseAt(p); return; }
  if (calibDragging) {
    calibPreview = { type: "ruler", x1: calibStart.x, y1: calibStart.y, x2: p.x, y2: p.y, color: "#ffeb3b", width: 3 };
    render2D();
    return;
  }
  if (tool2d === "select" && draggingPlayer >= 0) {
    const dx = p.x - dragStartPos.x, dy = p.y - dragStartPos.y;
    if (Math.hypot(dx, dy) > 4) dragMoved = true;
    players[draggingPlayer].x = dragPlayerOrig.x + dx;
    players[draggingPlayer].y = dragPlayerOrig.y + dy;
    render2D();
    return;
  }
  if (tool2d === "select" && draggingSpecial >= 0) {
    const dx = p.x - dragStartPos.x, dy = p.y - dragStartPos.y;
    specials[draggingSpecial].x = dragSpecialOrig.x + dx;
    specials[draggingSpecial].y = dragSpecialOrig.y + dy;
    render2D();
    return;
  }
  if (tool2d === "select" && draggingHandle && selectedIndex >= 0) {
    applyHandleDrag(annotations[selectedIndex], draggingHandle, p);
    render2D();
    return;
  }
  if (tool2d === "select" && draggingSelected && selectedIndex >= 0) {
    const dx = p.x - dragStartPos.x, dy = p.y - dragStartPos.y;
    translateObj(annotations[selectedIndex], dragOrigSnapshot, dx, dy);
    render2D();
    return;
  }
  if (!is2dPointerDown) return;
  if (tool2d === "eraser") { eraseAt(p); return; }
  if (tool2d === "pen" && currentPath) {
    currentPath.points.push([p.x, p.y]);
    render2D();
    drawObj(drawCtx, currentPath);
  } else if (["line", "arrow", "rect", "ellipse", "ruler"].includes(tool2d)) {
    previewObj = { type: tool2d, x1: dragStartPos.x, y1: dragStartPos.y, x2: p.x, y2: p.y, color: drawColor, width: drawWidth };
    render2D();
    drawObj(drawCtx, previewObj);
  } else if (tool2d === "compass") {
    const r = Math.hypot(p.x - dragStartPos.x, p.y - dragStartPos.y);
    previewObj = { type: "compass", cx: dragStartPos.x, cy: dragStartPos.y, r, color: drawColor, width: drawWidth };
    render2D();
    drawObj(drawCtx, previewObj);
  }
});

drawCanvas.addEventListener("pointerup", () => {
  if (isPanning2d) { isPanning2d = false; updateCursor2d(); return; }
  if (tempErasing2d) { tempErasing2d = false; saveAnnotations(); render2D(); return; }
  if (calibDragging) {
    calibDragging = false;
    const len = calibPreview ? Math.hypot(calibPreview.x2 - calibPreview.x1, calibPreview.y2 - calibPreview.y1) : 0;
    calibPreview = null;
    calibratingScale = false;
    if (len < 5) { updateRangeScaleLabel(); render2D(); return; }
    const input = prompt(`ドラッグした長さは ${Math.round(len)}px でした。\nこれが画像上の「射程(試し打ち場のライン)」の目盛りいくつ分か入力してください(例: 6.2):`, "");
    const num = input === null ? NaN : parseFloat(input);
    if (input !== null && !isNaN(num) && num > 0) {
      rangeScale = { pxPerUnit: len / num };
      saveRangeScale();
    }
    updateRangeScaleLabel();
    render2D();
    return;
  }
  if (tool2d === "select" && draggingPlayer >= 0) {
    draggingPlayer = -1;
    savePlayers();
    render2D();
    return;
  }
  if (tool2d === "select" && draggingSpecial >= 0) {
    draggingSpecial = -1;
    saveSpecials();
    render2D();
    return;
  }
  if (tool2d === "select" && draggingHandle) {
    draggingHandle = null;
    if (selectedIndex >= 0) saveAnnotations();
    render2D();
    return;
  }
  if (tool2d === "select") {
    draggingSelected = false;
    if (selectedIndex >= 0) saveAnnotations();
    return;
  }
  if (tool2d === "eraser") { is2dPointerDown = false; saveAnnotations(); render2D(); return; }
  if (!is2dPointerDown) return;
  is2dPointerDown = false;
  if (tool2d === "pen" && currentPath) {
    if (currentPath.points.length > 1) annotations.push(currentPath);
    currentPath = null;
  } else if (previewObj) {
    annotations.push(previewObj);
    previewObj = null;
  }
  saveAnnotations();
  render2D();
});

function isTypingTarget(el) {
  if (!el) return false;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName === "INPUT") {
    const t = (el.type || "text").toLowerCase();
    return ["text", "number", "search", "email", "password"].includes(t);
  }
  return false;
}
document.addEventListener("keydown", (e) => {
  if (isTypingTarget(document.activeElement)) return;
  // ツールバーのボタン/ラジオにフォーカスが残っていても、
  // 図形操作のショートカットだけは効くようにフォーカスをキャンバスへ戻す。
  if (document.activeElement && document.activeElement !== document.body &&
      (e.key === "Delete" || e.key === "Backspace" || e.key === "Enter" || e.key === "Escape" ||
       (e.ctrlKey && ["z", "y"].includes(e.key.toLowerCase())))) {
    document.activeElement.blur();
  }
  if (activeTab === "2d") {
    if (e.key === "Escape" && (calibratingScale || calibDragging)) {
      calibratingScale = false;
      calibDragging = false;
      calibPreview = null;
      updateRangeScaleLabel();
      render2D();
      e.preventDefault();
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selectedIndex >= 0) {
      pushHistory();
      annotations.splice(selectedIndex, 1);
      selectedIndex = -1;
      saveAnnotations();
      render2D();
      e.preventDefault();
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selectedPlayerIndex >= 0) {
      removePlayer(selectedPlayerIndex);
      e.preventDefault();
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selectedSpecialIndex >= 0) {
      removeSpecial(selectedSpecialIndex);
      e.preventDefault();
    }
    if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) { undo2d(); e.preventDefault(); }
    if (e.ctrlKey && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { redo2d(); e.preventDefault(); }
  } else if (activeTab === "3d") {
    if (e.key === "Enter") finishPendingShape();
    if (e.key === "Escape") { pendingPoints = []; renderPlan3d(); }
  }
});

function eraseAt(p) {
  const before = annotations.length;
  annotations = annotations.filter((o) => !isNear(o, p, Math.max(14, drawWidth * 2)));
  if (annotations.length !== before) render2D();
}

function hitTest(objs, x, y) {
  for (let i = objs.length - 1; i >= 0; i--) {
    if (isNear(objs[i], { x, y }, 8, true)) return i;
  }
  return -1;
}

function isNear(obj, p, tol, useBoxInterior) {
  const b = getBBox(obj);
  if (!b) return false;
  const inside = p.x >= b.x1 - tol && p.x <= b.x2 + tol && p.y >= b.y1 - tol && p.y <= b.y2 + tol;
  if (useBoxInterior) return inside;
  if (obj.type === "path") {
    return obj.points.some(([x, y]) => Math.hypot(x - p.x, y - p.y) < tol);
  }
  if (obj.type === "text") return inside;
  if (obj.type === "rect" || obj.type === "ellipse") return inside;
  if (obj.type === "compass") {
    const d = Math.hypot(p.x - obj.cx, p.y - obj.cy);
    return Math.abs(d - obj.r) < tol || d < tol;
  }
  // line / arrow / ruler: distance to segment
  return distToSegment(p, { x: obj.x1, y: obj.y1 }, { x: obj.x2, y: obj.y2 }) < tol;
}
function distToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx, cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}
function getBBox(obj) {
  if (obj.type === "path") {
    const xs = obj.points.map((pt) => pt[0]), ys = obj.points.map((pt) => pt[1]);
    return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
  }
  if (obj.type === "text") {
    const w = obj.text.length * obj.fontSize * 0.6;
    return { x1: obj.x, y1: obj.y - obj.fontSize, x2: obj.x + w, y2: obj.y };
  }
  if (obj.type === "compass") {
    return { x1: obj.cx - obj.r, y1: obj.cy - obj.r, x2: obj.cx + obj.r, y2: obj.cy + obj.r };
  }
  return { x1: Math.min(obj.x1, obj.x2), y1: Math.min(obj.y1, obj.y2), x2: Math.max(obj.x1, obj.x2), y2: Math.max(obj.y1, obj.y2) };
}
function translateObj(obj, orig, dx, dy) {
  if (obj.type === "path") obj.points = orig.points.map(([x, y]) => [x + dx, y + dy]);
  else if (obj.type === "text") { obj.x = orig.x + dx; obj.y = orig.y + dy; }
  else if (obj.type === "compass") { obj.cx = orig.cx + dx; obj.cy = orig.cy + dy; }
  else { obj.x1 = orig.x1 + dx; obj.y1 = orig.y1 + dy; obj.x2 = orig.x2 + dx; obj.y2 = orig.y2 + dy; }
}

/* 定規・コンパス用: 選択中オブジェクトのハンドル(端点)取得と適用 */
const HANDLE_ENDPOINT_TYPES = ["line", "arrow", "ruler", "rect", "ellipse"];
function getHandles(obj) {
  if (HANDLE_ENDPOINT_TYPES.includes(obj.type)) {
    return [{ key: "p1", x: obj.x1, y: obj.y1 }, { key: "p2", x: obj.x2, y: obj.y2 }];
  }
  if (obj.type === "compass") {
    return [{ key: "center", x: obj.cx, y: obj.cy }, { key: "edge", x: obj.cx + obj.r, y: obj.cy }];
  }
  return [];
}
function hitTestHandle(obj, p, tol) {
  for (const h of getHandles(obj)) {
    if (Math.hypot(h.x - p.x, h.y - p.y) < tol) return h.key;
  }
  return null;
}
function applyHandleDrag(obj, key, p) {
  if (obj.type === "compass") {
    if (key === "center") { obj.cx = p.x; obj.cy = p.y; }
    else if (key === "edge") { obj.r = Math.max(2, Math.hypot(p.x - obj.cx, p.y - obj.cy)); }
    return;
  }
  if (key === "p1") { obj.x1 = p.x; obj.y1 = p.y; }
  else if (key === "p2") { obj.x2 = p.x; obj.y2 = p.y; }
}

function render2D() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  for (const obj of annotations) drawObj(drawCtx, obj);
  if (selectedIndex >= 0 && annotations[selectedIndex]) {
    const obj = annotations[selectedIndex];
    const b = getBBox(obj);
    drawCtx.save();
    drawCtx.strokeStyle = "#4fc3f7";
    drawCtx.setLineDash([6, 4]);
    drawCtx.lineWidth = 1.5;
    drawCtx.strokeRect(b.x1 - 6, b.y1 - 6, b.x2 - b.x1 + 12, b.y2 - b.y1 + 12);
    drawCtx.restore();
    for (const h of getHandles(obj)) {
      drawCtx.save();
      drawCtx.fillStyle = "#4fc3f7";
      drawCtx.strokeStyle = "#08202b";
      drawCtx.lineWidth = 2;
      drawCtx.beginPath();
      drawCtx.arc(h.x, h.y, 7, 0, Math.PI * 2);
      drawCtx.fill();
      drawCtx.stroke();
      drawCtx.restore();
    }
  }
  for (const sp of specials) drawSpecial(drawCtx, sp, sp === specials[selectedSpecialIndex]);
  for (const pl of players) drawPlayer(drawCtx, pl, pl === players[selectedPlayerIndex]);
  if (calibPreview) drawRuler(drawCtx, calibPreview);
}

function drawObj(ctx, obj) {
  ctx.save();
  ctx.strokeStyle = obj.color;
  ctx.fillStyle = obj.color;
  ctx.lineWidth = obj.width || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (obj.type) {
    case "path": {
      ctx.beginPath();
      obj.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
      break;
    }
    case "line": {
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      break;
    }
    case "arrow": {
      drawArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2, obj.width || 2);
      break;
    }
    case "rect": {
      ctx.strokeRect(Math.min(obj.x1, obj.x2), Math.min(obj.y1, obj.y2), Math.abs(obj.x2 - obj.x1), Math.abs(obj.y2 - obj.y1));
      break;
    }
    case "ellipse": {
      const cx = (obj.x1 + obj.x2) / 2, cy = (obj.y1 + obj.y2) / 2;
      const rx = Math.abs(obj.x2 - obj.x1) / 2, ry = Math.abs(obj.y2 - obj.y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "ruler": {
      drawRuler(ctx, obj);
      break;
    }
    case "compass": {
      drawCompass(ctx, obj);
      break;
    }
    case "text": {
      ctx.font = `bold ${obj.fontSize}px sans-serif`;
      ctx.textBaseline = "alphabetic";
      ctx.lineWidth = Math.max(3, obj.fontSize / 6);
      ctx.strokeStyle = "#000000cc";
      ctx.strokeText(obj.text, obj.x, obj.y);
      ctx.fillText(obj.text, obj.x, obj.y);
      break;
    }
  }
  ctx.restore();
}
function drawArrow(ctx, x1, y1, x2, y2, width) {
  const headLen = Math.max(12, width * 3);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

/* 定規: 端のハンドルをドラッグすると角度・長さが自由に変わる(360度回転可能) */
function drawRuler(ctx, obj) {
  const dx = obj.x2 - obj.x1, dy = obj.y2 - obj.y1;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(obj.x1, obj.y1);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.stroke();
  const tickSpacing = 20, tickLen = 8;
  const perpX = Math.cos(angle + Math.PI / 2), perpY = Math.sin(angle + Math.PI / 2);
  for (let d = 0; d <= len; d += tickSpacing) {
    const cx = obj.x1 + Math.cos(angle) * d, cy = obj.y1 + Math.sin(angle) * d;
    ctx.beginPath();
    ctx.moveTo(cx - perpX * tickLen / 2, cy - perpY * tickLen / 2);
    ctx.lineTo(cx + perpX * tickLen / 2, cy + perpY * tickLen / 2);
    ctx.stroke();
  }
  const midX = (obj.x1 + obj.x2) / 2, midY = (obj.y1 + obj.y2) / 2;
  const label = `${Math.round(len)}px`;
  ctx.save();
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = obj.color;
  ctx.strokeStyle = "#000000cc";
  ctx.lineWidth = 3;
  const lx = midX + perpX * 16, ly = midY + perpY * 16;
  ctx.strokeText(label, lx, ly);
  ctx.fillText(label, lx, ly);
  ctx.restore();
}

/* コンパス: 中心ハンドルで移動、外周ハンドルで半径を変更 */
function drawCompass(ctx, obj) {
  ctx.beginPath();
  ctx.arc(obj.cx, obj.cy, obj.r, 0, Math.PI * 2);
  ctx.stroke();
  const crossLen = 6;
  ctx.beginPath();
  ctx.moveTo(obj.cx - crossLen, obj.cy);
  ctx.lineTo(obj.cx + crossLen, obj.cy);
  ctx.moveTo(obj.cx, obj.cy - crossLen);
  ctx.lineTo(obj.cx, obj.cy + crossLen);
  ctx.stroke();
  const label = `r=${Math.round(obj.r)}px`;
  ctx.save();
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = obj.color;
  ctx.strokeStyle = "#000000cc";
  ctx.lineWidth = 3;
  const lx = obj.cx + obj.r * 0.7 + 6, ly = obj.cy - obj.r * 0.7 - 6;
  ctx.strokeText(label, lx, ly);
  ctx.fillText(label, lx, ly);
  ctx.restore();
}

/* プレイヤー配置マーカー(4対4) */
function drawPlayer(ctx, pl, isSelected) {
  const r = PLAYER_RADIUS;
  const teamColor = pl.team === "ally" ? "#4fc3f7" : "#ff7043";
  ctx.save();
  if (isSelected) {
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.arc(pl.x, pl.y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (pl.rangeVisible && pl.range && rangeScale && rangeScale.pxPerUnit) {
    const rad = pl.range * rangeScale.pxPerUnit;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pl.x, pl.y, rad, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = teamColor;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = teamColor;
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(pl.x, pl.y, r, 0, Math.PI * 2);
  ctx.fillStyle = teamColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(pl.num), pl.x, pl.y);
  if (pl.weaponClass) {
    const abbr = WEAPON_CLASS_ABBR[pl.weaponClass] || pl.weaponClass.slice(0, 2);
    const bx = pl.x - r * 0.62, by = pl.y + r * 0.62;
    ctx.beginPath();
    ctx.arc(bx, by, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#2e3340";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(abbr, bx, by + 0.5);
  }
  if (pl.special) {
    const bx = pl.x + r * 0.62, by = pl.y + r * 0.62;
    ctx.beginPath();
    ctx.arc(bx, by, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd54f";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.fillStyle = "#3a2c00";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("★", bx, by + 0.5);
  }
  if (pl.weaponName) {
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000cc";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.strokeText(pl.weaponName, pl.x, pl.y + r + 5);
    ctx.fillText(pl.weaponName, pl.x, pl.y + r + 5);
  }
  ctx.restore();
}

function hitTestPlayer(p) {
  for (let i = players.length - 1; i >= 0; i--) {
    if (Math.hypot(players[i].x - p.x, players[i].y - p.y) < PLAYER_RADIUS) return i;
  }
  return -1;
}

/* スペシャルウェポン配置マーカー(複数配置可): 射程1/射程2/爆風込み射程を個別に円で表示 */
function drawSpecial(ctx, sp, isSelected) {
  const r = SPECIAL_RADIUS;
  const markerColor = "#7c4dff";
  const data = findSpecial(sp.name);
  if (data && rangeScale && rangeScale.pxPerUnit) {
    const ranges = [
      { on: sp.showRange1, value: data.range1, color: "#4fc3f7", dash: [], label: "射程1" },
      { on: sp.showRange2, value: data.range2, color: "#ff7043", dash: [7, 5], label: "射程2" },
      { on: sp.showRangeBlast, value: data.blastRange, color: "#ff3b30", dash: [2, 5], label: "爆風込み" },
    ];
    for (const rg of ranges) {
      if (!rg.on || rg.value == null) continue;
      const rad = rg.value * rangeScale.pxPerUnit;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(rg.dash);
      ctx.strokeStyle = rg.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = rg.color;
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = rg.color;
      ctx.strokeStyle = "#000000cc";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const label = `${rg.label}:${rg.value}`;
      const lx = sp.x, ly = sp.y - rad - 4;
      ctx.strokeText(label, lx, ly);
      ctx.fillText(label, lx, ly);
      ctx.restore();
    }
  }
  ctx.save();
  if (isSelected) {
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.arc(sp.x, sp.y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
  ctx.fillStyle = markerColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", sp.x, sp.y);
  ctx.restore();
  ctx.save();
  ctx.font = "bold 12px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000cc";
  ctx.lineWidth = 3;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.strokeText(sp.name, sp.x, sp.y + r + 5);
  ctx.fillText(sp.name, sp.x, sp.y + r + 5);
  ctx.restore();
}

function hitTestSpecial(p) {
  for (let i = specials.length - 1; i >= 0; i--) {
    if (Math.hypot(specials[i].x - p.x, specials[i].y - p.y) < SPECIAL_RADIUS) return i;
  }
  return -1;
}

/* 現在表示中のビュー中央あたり(スクロール・ズーム位置を考慮)にプレイヤーを配置する */
function viewCenterPos2d() {
  const r = drawCanvas.getBoundingClientRect();
  const sr = canvasScrollEl.getBoundingClientRect();
  const screenX = Math.max(r.left, Math.min(r.right, sr.left + canvasScrollEl.clientWidth / 2));
  const screenY = Math.max(r.top, Math.min(r.bottom, sr.top + canvasScrollEl.clientHeight / 2));
  const sx = drawCanvas.width / r.width, sy = drawCanvas.height / r.height;
  return { x: (screenX - r.left) * sx, y: (screenY - r.top) * sy };
}

function renderPlayerCount() {
  const allyN = players.filter((p) => p.team === "ally").length;
  const enemyN = players.filter((p) => p.team === "enemy").length;
  $("playerCountLabel").textContent = `味方 ${allyN}/4 ・ 相手 ${enemyN}/4`;
  $("btnAddAlly").disabled = allyN >= 4;
  $("btnAddEnemy").disabled = enemyN >= 4;
}

function addPlayer(team) {
  if (!currentItem) return;
  const count = players.filter((p) => p.team === team).length;
  if (count >= 4) { alert(team === "ally" ? "味方は4人まで配置できます。" : "相手は4人まで配置できます。"); return; }
  const base = viewCenterPos2d();
  const offset = count * 32 - 48;
  players.push({
    id: `${team}_${Date.now()}_${count}`,
    team,
    num: count + 1,
    x: base.x + offset,
    y: base.y + (team === "ally" ? -20 : 20),
    weaponClass: "",
    weaponName: "",
    special: "",
    range: null,
    range2: null,
    rangeVisible: false,
  });
  savePlayers();
  renderPlayerCount();
  render2D();
}
function renumberTeam(team) {
  let n = 1;
  for (const p of players) if (p.team === team) p.num = n++;
}
function removePlayer(idx) {
  if (idx < 0 || idx >= players.length) return;
  const team = players[idx].team;
  players.splice(idx, 1);
  renumberTeam(team);
  selectedPlayerIndex = -1;
  savePlayers();
  renderPlayerCount();
  render2D();
}
$("btnAddAlly").addEventListener("click", () => addPlayer("ally"));
$("btnAddEnemy").addEventListener("click", () => addPlayer("enemy"));
$("btnCalibrateScale").addEventListener("click", () => {
  if (!currentItem) { alert("先にステージを選択してください。"); return; }
  calibratingScale = true;
  calibDragging = false;
  calibStart = null;
  calibPreview = null;
  $("rangeScaleLabel").textContent = "射程スケール: 画像上の「射程」目盛りに沿ってドラッグしてください(Escで中止)";
  alert("画像に印刷されている「射程(試し打ち場のライン)」の目盛りに沿って、\n始点から終点までドラッグしてください。\nドラッグが終わると、目盛りの数値(例: リッター4Kなら6.2)を入力する画面が出ます。");
});
$("btnClearPlayers").addEventListener("click", () => {
  if (!currentItem) return;
  if (!players.length) return;
  if (!confirm("配置したプレイヤーをすべて削除します。よろしいですか？")) return;
  players = [];
  selectedPlayerIndex = -1;
  savePlayers();
  renderPlayerCount();
  render2D();
});

/* スペシャルウェポン配置(複数配置可) */
function addSpecial(name) {
  if (!currentItem) return;
  if (!name) { alert("スペシャルを選択してください。"); return; }
  const base = viewCenterPos2d();
  const count = specials.length;
  const offset = (count % 5) * 34 - 68;
  specials.push({
    id: `special_${Date.now()}_${count}`,
    name,
    x: base.x + offset,
    y: base.y + Math.floor(count / 5) * 34,
    showRange1: true,
    showRange2: true,
    showRangeBlast: true,
  });
  saveSpecials();
  render2D();
}
function removeSpecial(idx) {
  if (idx < 0 || idx >= specials.length) return;
  specials.splice(idx, 1);
  selectedSpecialIndex = -1;
  saveSpecials();
  render2D();
}
const specialSelectEl = $("specialSelect");
if (typeof SPECIAL_RANGE_DATA !== "undefined") {
  Object.keys(SPECIAL_RANGE_DATA).sort().forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name; opt.textContent = name;
    specialSelectEl.appendChild(opt);
  });
}
$("btnAddSpecial").addEventListener("click", () => addSpecial(specialSelectEl.value));
$("btnClearSpecials").addEventListener("click", () => {
  if (!currentItem) return;
  if (!specials.length) return;
  if (!confirm("配置したスペシャルをすべて削除します。よろしいですか？")) return;
  specials = [];
  selectedSpecialIndex = -1;
  saveSpecials();
  render2D();
});

/* スペシャル編集モーダル(射程1/射程2/爆風込み射程の表示切替) */
const specialEditorBackdrop = $("specialEditorBackdrop");
function openSpecialEditor(idx) {
  const sp = specials[idx];
  if (!sp) return;
  editingSpecialIndex = idx;
  selectedSpecialIndex = idx;
  const data = findSpecial(sp.name) || {};
  $("specialEditorTitle").textContent = `${sp.name} の射程表示`;
  const rows = [
    { row: "specialRange1Row", label: "specialRange1Label", box: "specialShowRange1", value: data.range1, name: "射程1", flag: sp.showRange1 },
    { row: "specialRange2Row", label: "specialRange2Label", box: "specialShowRange2", value: data.range2, name: "射程2", flag: sp.showRange2 },
    { row: "specialRangeBlastRow", label: "specialRangeBlastLabel", box: "specialShowRangeBlast", value: data.blastRange, name: "爆風込み射程", flag: sp.showRangeBlast },
  ];
  for (const r of rows) {
    if (r.value == null) {
      $(r.row).style.display = "none";
    } else {
      $(r.row).style.display = "";
      $(r.label).textContent = `${r.name}: ${r.value}`;
      $(r.box).checked = !!r.flag;
    }
  }
  specialEditorBackdrop.classList.add("visible");
  render2D();
}
function closeSpecialEditor() {
  specialEditorBackdrop.classList.remove("visible");
  editingSpecialIndex = -1;
}
$("btnSpecialSave").addEventListener("click", () => {
  const sp = specials[editingSpecialIndex];
  if (sp) {
    sp.showRange1 = $("specialShowRange1").checked;
    sp.showRange2 = $("specialShowRange2").checked;
    sp.showRangeBlast = $("specialShowRangeBlast").checked;
    saveSpecials();
    render2D();
  }
  closeSpecialEditor();
});
$("btnSpecialCancel").addEventListener("click", closeSpecialEditor);
$("btnSpecialDelete").addEventListener("click", () => {
  if (editingSpecialIndex < 0) return;
  if (!confirm("このスペシャル配置を削除しますか？")) { return; }
  removeSpecial(editingSpecialIndex);
  closeSpecialEditor();
});
specialEditorBackdrop.addEventListener("click", (e) => {
  if (e.target === specialEditorBackdrop) closeSpecialEditor();
});

/* プレイヤー編集モーダル(ブキ種別・ブキ名・スペシャル名) */
const playerEditorBackdrop = $("playerEditorBackdrop");
const playerWeaponClassSel = $("playerWeaponClass");
WEAPON_CLASSES.forEach((c) => {
  const opt = document.createElement("option");
  opt.value = c; opt.textContent = c;
  playerWeaponClassSel.appendChild(opt);
});
{
  const blank = document.createElement("option");
  blank.value = ""; blank.textContent = "(未選択)";
  playerWeaponClassSel.insertBefore(blank, playerWeaponClassSel.firstChild);
  playerWeaponClassSel.value = "";
}
/* ブキ名セレクト: 選択中のブキ種別に応じて候補を絞り込む */
function populateWeaponNameOptions(category, selectedName) {
  const sel = $("playerWeaponName");
  sel.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = ""; blank.textContent = "(未選択)";
  sel.appendChild(blank);
  if (typeof WEAPON_DATA !== "undefined" && category) {
    WEAPON_DATA.filter((w) => w.category === category).forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.name; opt.textContent = w.name;
      sel.appendChild(opt);
    });
  }
  const has = Array.from(sel.options).some((o) => o.value === selectedName);
  sel.value = has ? selectedName : "";
}
/* スペシャルセレクト: 全ブキのスペシャル名を一覧化(ブキ選択で自動選択されるが、手動変更も可能) */
function populateSpecialOptions(selectedName) {
  const sel = $("playerSpecialName");
  sel.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = ""; blank.textContent = "(未選択)";
  sel.appendChild(blank);
  if (typeof WEAPON_DATA !== "undefined") {
    const names = Array.from(new Set(WEAPON_DATA.map((w) => w.special).filter(Boolean))).sort();
    names.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n; opt.textContent = n;
      sel.appendChild(opt);
    });
  }
  const has = Array.from(sel.options).some((o) => o.value === selectedName);
  sel.value = has ? selectedName : "";
}
populateSpecialOptions("");
playerWeaponClassSel.addEventListener("change", () => {
  populateWeaponNameOptions(playerWeaponClassSel.value, "");
  const w = findWeapon(playerWeaponClassSel.value, "");
  populateSpecialOptions(w ? w.special : "");
});
$("playerWeaponName").addEventListener("change", () => {
  const w = findWeapon(playerWeaponClassSel.value, $("playerWeaponName").value);
  populateSpecialOptions(w ? w.special || "" : "");
});
/* --- プレイヤー編集モーダル内の 基本/ギア タブ切替 --- */
let playerModalTab = "basic"; // 'basic' | 'gear'
function switchPlayerModalTab(tab) {
  playerModalTab = tab;
  $("playerTabBasic").classList.toggle("active", tab === "basic");
  $("playerTabGear").classList.toggle("active", tab === "gear");
  $("playerPanelBasic").classList.toggle("visible", tab === "basic");
  $("playerPanelGear").classList.toggle("visible", tab === "gear");
}
$("playerTabBasic").addEventListener("click", () => switchPlayerModalTab("basic"));
$("playerTabGear").addEventListener("click", () => switchPlayerModalTab("gear"));

/* --- ギアパワー選択UIの構築 --- */
let currentEditingGear = null; // emptyGear() 形式。保存確定までは編集用に保持
function buildAbilityOptionsHtml(slotKey, blankLabel) {
  let html = `<option value="">${blankLabel}</option>`;
  html += `<optgroup label="メイン・サブ共通">`;
  STACKABLE_ABILITIES.forEach((a) => { html += `<option value="${a.id}">${a.name}</option>`; });
  html += `</optgroup>`;
  const mainOnlyForSlot = MAINONLY_ABILITIES.filter((a) => a.slot === slotKey);
  if (mainOnlyForSlot.length) {
    html += `<optgroup label="メイン専用">`;
    mainOnlyForSlot.forEach((a) => { html += `<option value="${a.id}">${a.name}</option>`; });
    html += `</optgroup>`;
  }
  return html;
}
function buildGearGrid() {
  const grid = $("gearGrid");
  grid.innerHTML = "";
  GEAR_SLOTS.forEach(({ key, label }) => {
    const col = document.createElement("div");
    col.className = "gearCol";
    let html = `<h4>${label}</h4>`;
    html += `<select class="gearMainSelect" data-slot="${key}" data-kind="main">${buildAbilityOptionsHtml(key, "(メイン未選択)")}</select>`;
    for (let i = 0; i < 3; i++) {
      html += `<select data-slot="${key}" data-kind="sub" data-idx="${i}">${buildAbilityOptionsHtml(key, "(サブ未選択)")}</select>`;
    }
    col.innerHTML = html;
    grid.appendChild(col);
  });
  grid.querySelectorAll("select").forEach((sel) => {
    sel.addEventListener("change", () => {
      const slot = sel.getAttribute("data-slot");
      const kind = sel.getAttribute("data-kind");
      if (!currentEditingGear) currentEditingGear = emptyGear();
      if (kind === "main") currentEditingGear[slot].main = sel.value;
      else currentEditingGear[slot].subs[+sel.getAttribute("data-idx")] = sel.value;
      renderGearResults();
    });
  });
}
buildGearGrid();

function applyGearToUI(gear) {
  currentEditingGear = normalizeGear(gear);
  GEAR_SLOTS.forEach(({ key }) => {
    const mainSel = $("gearGrid").querySelector(`select[data-slot="${key}"][data-kind="main"]`);
    if (mainSel) mainSel.value = currentEditingGear[key].main || "";
    for (let i = 0; i < 3; i++) {
      const subSel = $("gearGrid").querySelector(`select[data-slot="${key}"][data-kind="sub"][data-idx="${i}"]`);
      if (subSel) subSel.value = currentEditingGear[key].subs[i] || "";
    }
  });
}

function renderGearResults() {
  const box = $("gearResults");
  if (!currentEditingGear) currentEditingGear = emptyGear();
  const totals = computeApTotals(currentEditingGear);
  const activeMainOnly = computeMainOnlyActive(currentEditingGear);
  const rows = STACKABLE_ABILITIES
    .map((a) => ({ a, ap: totals[a.id] }))
    .filter((x) => x.ap > 0)
    .sort((x, y) => y.ap - x.ap);

  let html = "";
  if (rows.length === 0 && activeMainOnly.length === 0) {
    html += `<div class="emptyNote">ギアパワーが選択されていません。上のセレクトからメイン・サブを選ぶと、対物性能・ヒト速度などの効果目安がここに表示されます。</div>`;
  }

  if (rows.length) {
    html += `<h4>ヒト速度・その他ギアパワー(AP合計 / 効果進行度)</h4><table>`;
    rows.forEach(({ a, ap }) => {
      const pct = apEffectPercent(ap);
      html += `<tr>
        <td style="white-space:nowrap;">${a.name}</td>
        <td style="white-space:nowrap;color:var(--accent);">${ap}AP</td>
        <td style="width:40%;"><span class="apBar"><span class="apBarFill" style="width:${pct.toFixed(0)}%;"></span></span></td>
        <td style="white-space:nowrap;">${pct.toFixed(0)}%</td>
      </tr>`;
    });
    html += `</table>`;
  }

  if (activeMainOnly.length) {
    html += `<h4>メイン専用ギアパワー</h4>`;
    activeMainOnly.forEach(({ ability, count }) => {
      html += `<div class="mainOnlyItem"><b>${ability.name}</b>${count > 1 ? `(${count}枚)` : ""}<br>${ability.desc}</div>`;
      if (ability.id === "objectShredder") {
        html += `<table>`;
        OBJECT_SHREDDER_TABLE.forEach((row) => {
          html += `<tr><td>${row.name}</td><td style="color:var(--accent2);white-space:nowrap;">×${row.mult}</td></tr>`;
        });
        html += `</table>`;
      }
    });
  }

  html += `<span class="hint emptyNote">※効果進行度・倍率は検証情報をもとにした目安です。ブキごとの基準値の違いは反映していません。最新情報に更新したい場合はClaudeにgear.jsの再生成を依頼してください。</span>`;
  box.innerHTML = html;
}

function openPlayerEditor(idx) {
  const pl = players[idx];
  if (!pl) return;
  editingPlayerIndex = idx;
  selectedPlayerIndex = idx;
  $("playerEditorTitle").textContent = `${pl.team === "ally" ? "味方" : "相手"} ${pl.num}番 のブキ・スペシャル`;
  playerWeaponClassSel.value = pl.weaponClass || "";
  populateWeaponNameOptions(pl.weaponClass || "", pl.weaponName || "");
  populateSpecialOptions(pl.special || "");
  $("playerRangeVisible").checked = !!pl.rangeVisible;
  applyGearToUI(pl.gear);
  renderGearResults();
  switchPlayerModalTab("basic");
  playerEditorBackdrop.classList.add("visible");
  render2D();
}
function closePlayerEditor() {
  playerEditorBackdrop.classList.remove("visible");
  editingPlayerIndex = -1;
}
$("btnPlayerSave").addEventListener("click", () => {
  const pl = players[editingPlayerIndex];
  if (pl) {
    pl.weaponClass = playerWeaponClassSel.value;
    pl.weaponName = $("playerWeaponName").value;
    pl.special = $("playerSpecialName").value;
    const w = findWeapon(pl.weaponClass, pl.weaponName);
    pl.range = w ? w.range : null;
    pl.range2 = w ? w.range2 : null;
    pl.rangeVisible = $("playerRangeVisible").checked;
    pl.gear = normalizeGear(currentEditingGear);
    savePlayers();
    render2D();
  }
  closePlayerEditor();
});
$("btnPlayerCancel").addEventListener("click", closePlayerEditor);
$("btnPlayerDelete").addEventListener("click", () => {
  if (editingPlayerIndex < 0) return;
  if (!confirm("このプレイヤーを削除しますか？")) { return; }
  removePlayer(editingPlayerIndex);
  closePlayerEditor();
});
playerEditorBackdrop.addEventListener("click", (e) => {
  if (e.target === playerEditorBackdrop) closePlayerEditor();
});

$("btnExportPng").addEventListener("click", () => {
  if (!currentItem) return;
  const out = document.createElement("canvas");
  out.width = baseCanvas.width;
  out.height = baseCanvas.height;
  const octx = out.getContext("2d");
  octx.drawImage(baseCanvas, 0, 0);
  octx.drawImage(drawCanvas, 0, 0);
  out.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${currentItem.mode}_${currentItem.label}_annotated.png`;
    a.click();
  });
});

/* =========================================================
   3D 平面図エディタ (エリア / 壁の配置)
   ========================================================= */
document.querySelectorAll('input[name="t3d"]').forEach((r) => {
  r.addEventListener("change", (e) => { tool3d = e.target.value; pendingPoints = []; renderPlan3d(); });
});
$("colorPicker3d").addEventListener("input", (e) => (color3d = e.target.value));

function getPos3d(e) {
  const r = drawCanvas3d.getBoundingClientRect();
  const sx = drawCanvas3d.width / r.width;
  const sy = drawCanvas3d.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}
drawCanvas3d.addEventListener("click", (e) => {
  if (!currentItem) return;
  const p = getPos3d(e);
  pendingPoints.push([p.x, p.y]);
  renderPlan3d();
});
drawCanvas3d.addEventListener("dblclick", (e) => { e.preventDefault(); finishPendingShape(); });
drawCanvas3d.addEventListener("mousemove", (e) => { mouse3dPos = getPos3d(e); if (pendingPoints.length) renderPlan3d(); });
drawCanvas3d.addEventListener("contextmenu", (e) => { e.preventDefault(); });
drawCanvas3d.addEventListener("mousedown", (e) => { if (e.button === 1) e.preventDefault(); });

// 中クリック(ホイール押し込み)ドラッグで平面図をパン(3Dタブ側の編集エリアも同様に対応)
const plan3dScrollEl = $("plan3dCanvasScroll");
let isPanning3d = false;
let panStart3d = null;
let panScrollStart3d = null;
drawCanvas3d.addEventListener("pointerdown", (e) => {
  if (e.button !== 1) return;
  e.preventDefault();
  isPanning3d = true;
  panStart3d = { x: e.clientX, y: e.clientY };
  panScrollStart3d = { left: plan3dScrollEl.scrollLeft, top: plan3dScrollEl.scrollTop };
  drawCanvas3d.style.cursor = "grabbing";
});
drawCanvas3d.addEventListener("pointermove", (e) => {
  if (!isPanning3d) return;
  const dx = e.clientX - panStart3d.x, dy = e.clientY - panStart3d.y;
  plan3dScrollEl.scrollLeft = panScrollStart3d.left - dx;
  plan3dScrollEl.scrollTop = panScrollStart3d.top - dy;
});
drawCanvas3d.addEventListener("pointerup", () => {
  if (!isPanning3d) return;
  isPanning3d = false;
  drawCanvas3d.style.cursor = "";
});

$("btnFinishShape").addEventListener("click", finishPendingShape);
$("btnCancelShape").addEventListener("click", () => { pendingPoints = []; renderPlan3d(); });

function finishPendingShape() {
  if (!currentItem) return;
  const height = parseFloat($("heightInput3d").value) || 1;
  if (tool3d === "area") {
    if (pendingPoints.length < 3) { pendingPoints = []; renderPlan3d(); return; }
    shapes3D.push({ type: "area", points: pendingPoints.slice(), height, color: color3d });
  } else {
    if (pendingPoints.length < 2) { pendingPoints = []; renderPlan3d(); return; }
    shapes3D.push({ type: "wall", points: pendingPoints.slice(), height, thickness: 0.15, color: color3d });
  }
  pendingPoints = [];
  saveShapes3D();
  renderPlan3d();
  renderShapeList();
  rebuild3DScene();
}

function renderPlan3d() {
  drawCtx3d.clearRect(0, 0, drawCanvas3d.width, drawCanvas3d.height);
  for (const s of shapes3D) drawShape3dOnPlan(drawCtx3d, s);
  if (pendingPoints.length) {
    drawCtx3d.save();
    drawCtx3d.strokeStyle = color3d;
    drawCtx3d.fillStyle = color3d;
    drawCtx3d.lineWidth = 2;
    drawCtx3d.beginPath();
    pendingPoints.forEach(([x, y], i) => (i === 0 ? drawCtx3d.moveTo(x, y) : drawCtx3d.lineTo(x, y)));
    if (mouse3dPos) drawCtx3d.lineTo(mouse3dPos.x, mouse3dPos.y);
    drawCtx3d.stroke();
    pendingPoints.forEach(([x, y]) => { drawCtx3d.beginPath(); drawCtx3d.arc(x, y, 4, 0, Math.PI * 2); drawCtx3d.fill(); });
    drawCtx3d.restore();
  }
}
function drawShape3dOnPlan(ctx, s) {
  ctx.save();
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color + "55";
  ctx.lineWidth = s.type === "wall" ? 4 : 2;
  ctx.beginPath();
  s.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  if (s.type === "area") { ctx.closePath(); ctx.fill(); }
  ctx.stroke();
  ctx.restore();
}

function renderShapeList() {
  const ul = $("shapeList");
  ul.innerHTML = "";
  shapes3D.forEach((s, idx) => {
    const li = document.createElement("li");
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.background = s.color;
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = (s.type === "area" ? "🟦エリア" : "🧱壁") + ` #${idx + 1}`;
    const hInput = document.createElement("input");
    hInput.type = "number"; hInput.step = "0.1"; hInput.value = s.height;
    hInput.title = "高さ";
    hInput.addEventListener("input", () => { s.height = parseFloat(hInput.value) || 0; saveShapes3D(); rebuild3DScene(); });
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => {
      shapes3D.splice(idx, 1);
      saveShapes3D();
      renderPlan3d();
      renderShapeList();
      rebuild3DScene();
    });
    li.appendChild(sw); li.appendChild(lbl); li.appendChild(hInput); li.appendChild(delBtn);
    ul.appendChild(li);
  });
}
$("btnClearShapes").addEventListener("click", () => {
  if (!currentItem) return;
  if (!confirm("この画像の3D形状をすべて削除します。よろしいですか？")) return;
  shapes3D = [];
  saveShapes3D();
  renderPlan3d();
  renderShapeList();
  rebuild3DScene();
});

/* =========================================================
   three.js 3D プレビュー
   ========================================================= */
function initThreeIfNeeded() {
  if (three.renderer) return;
  const container = $("three-container");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0d11);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(0, 8, 10);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.1));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  const grid = new THREE.GridHelper(20, 20, 0x445, 0x223);
  scene.add(grid);

  three = { renderer, scene, camera, controls, ground: null, meshes: [], grid };

  $("chkGrid").addEventListener("change", (e) => (grid.visible = e.target.checked));
  $("chkGround").addEventListener("change", (e) => { if (three.ground) three.ground.visible = e.target.checked; });
  $("btnResetCamera").addEventListener("click", () => {
    camera.position.set(0, 8, 10);
    controls.target.set(0, 0, 0);
  });

  window.addEventListener("resize", onThreeContainerResize);
  if (!resizeObserverAttached && window.ResizeObserver) {
    new ResizeObserver(onThreeContainerResize).observe(container);
    resizeObserverAttached = true;
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

function onThreeContainerResize() {
  if (!three.renderer) return;
  const container = $("three-container");
  const w = container.clientWidth || 300, h = container.clientHeight || 300;
  three.renderer.setSize(w, h);
  three.camera.aspect = w / h;
  three.camera.updateProjectionMatrix();
}

const PLANE_W = 10;
function rebuild3DScene() {
  if (!three.renderer || !currentImage) return;
  for (const m of three.meshes) { three.scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
  three.meshes = [];
  if (three.ground) { three.scene.remove(three.ground); three.ground.geometry.dispose(); three.ground.material.dispose(); three.ground = null; }

  const imgW = currentImage.naturalWidth, imgH = currentImage.naturalHeight;
  const planeD = PLANE_W * (imgH / imgW);

  const texture = new THREE.Texture(currentImage);
  texture.needsUpdate = true;
  const groundGeo = new THREE.PlaneGeometry(PLANE_W, planeD);
  const groundMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.visible = $("chkGround").checked;
  three.scene.add(ground);
  three.ground = ground;

  const toWorld = (px, py) => ({
    x: (px / imgW - 0.5) * PLANE_W,
    z: (py / imgH - 0.5) * planeD,
  });

  for (const s of shapes3D) {
    const h = Math.max(0.05, s.height || 1);
    if (s.type === "area" && s.points.length >= 3) {
      const shapePts = s.points.map(([px, py]) => { const w = toWorld(px, py); return new THREE.Vector2(w.x, -w.z); });
      const shape = new THREE.Shape(shapePts);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.color), transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      three.scene.add(mesh);
      three.meshes.push(mesh);
    } else if (s.type === "wall" && s.points.length >= 2) {
      for (let i = 0; i < s.points.length - 1; i++) {
        const a = toWorld(s.points[i][0], s.points[i][1]);
        const b = toWorld(s.points[i + 1][0], s.points[i + 1][1]);
        const length = Math.hypot(b.x - a.x, b.z - a.z);
        if (length < 0.001) continue;
        const angle = Math.atan2(b.z - a.z, b.x - a.x);
        const geo = new THREE.BoxGeometry(length, h, s.thickness || 0.15);
        const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.color) });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((a.x + b.x) / 2, h / 2, (a.z + b.z) / 2);
        mesh.rotation.y = -angle;
        three.scene.add(mesh);
        three.meshes.push(mesh);
      }
    }
  }
}

/* 初期状態: 3Dは初回タブ表示時に初期化 */
