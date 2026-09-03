"use strict";
/* =========================================================
   gear.js - ギアパワー(アビリティ)データ & 効果計算
   -----------------------------------------------------------
   スプラトゥーン3のギアパワーの一覧・AP(ギアパワーポイント)計算・
   効果の目安を扱うモジュール。プレイヤー編集モーダルの「ギア」タブから
   使用する。

   ■ AP(ギアパワーポイント)の考え方
     ・ギアは頭/服/靴の3つ、それぞれ「メイン1つ」+「サブ3つ」を持てる
       (メイン3枠・サブ9枠、最大 3×10 + 9×3 = 57AP)。
     ・メインギアパワー1つ = 10AP相当、サブギアパワー1つ = 3AP相当として、
       同じギアパワーが複数箇所に付いていれば合算する。
     ・「メイン専用」のギアパワー(対物攻撃力アップ等)はサブに置くことが
       できないため、AP計算の対象外(装備の有無のみ)として扱う。

   ■ 効果の目安について
     ・「効果進行度」は、APが増えるほど効果の伸びが緩やかになる
       (逓減する)スプラトゥーン3の一般的なAP計算式を用いた、
       0AP=0% ～ 57AP(カンスト)=100% の目安値です。
       実際の移動速度や与ダメージの絶対値はブキごとに基準値が異なるため、
       本アプリでは「基準からどれだけ効果が伸びているか」の目安として
       割合のみを表示します。
     ・対物攻撃力アップ(靴限定)はメイン専用でAPが存在しないギアパワーのため、
       「装備の有無」と、対象物ごとの倍率の目安を表示します。
     ・数値は検証情報をもとにした目安であり、アップデートで変わる場合が
       あります。最新のデータに差し替えたい場合はClaudeに新しい情報を
       渡して gear.js の再生成を依頼してください。
   ========================================================= */

// メイン・サブどちらにも付けられるギアパワー(スタック可能)
const STACKABLE_ABILITIES = [
  { id: "inkSaverMain", name: "インク効率アップ（メイン）", desc: "メインウェポンのインク消費量を抑える。" },
  { id: "inkSaverSub", name: "インク効率アップ（サブ）", desc: "サブウェポンのインク消費量を抑える。" },
  { id: "inkRecovery", name: "インク回復力アップ", desc: "インクタンクの自然回復速度を上げる。" },
  { id: "runSpeed", name: "ヒト移動速度アップ", desc: "ヒト状態(地上)の移動速度を上げる。" },
  { id: "swimSpeed", name: "イカダッシュ速度アップ", desc: "イカ・タコ状態の移動速度を上げる。" },
  { id: "specialCharge", name: "スペシャル増加量アップ", desc: "塗り等で溜まるスペシャルゲージの量を増やす。" },
  { id: "specialSaver", name: "スペシャル減少量ダウン", desc: "やられたときのスペシャルゲージ減少量を抑える。" },
  { id: "specialPower", name: "スペシャル性能アップ", desc: "スペシャルの効果時間・範囲・性能を上げる。" },
  { id: "quickRespawn", name: "復活時間短縮", desc: "やられてから動けるようになるまでの時間を短縮する。" },
  { id: "quickSuperJump", name: "スーパージャンプ時間短縮", desc: "スーパージャンプの溜め時間を短縮する。" },
  { id: "subPower", name: "サブ性能アップ", desc: "サブウェポンの射程・範囲・性能を上げる。" },
  { id: "inkResistance", name: "相手インク影響軽減", desc: "相手インクの上を通ったときの速度低下・ダメージを抑える。" },
  { id: "subResistance", name: "サブ影響軽減", desc: "相手のサブウェポンから受ける効果(スプラッシュボム等)を軽減する。" },
  { id: "intensifyAction", name: "アクション強化", desc: "着地隙の軽減など各種アクションを強化する。" },
];

// メイン専用のギアパワー(スロット限定・サブ不可)
const MAINONLY_ABILITIES = [
  { id: "openingGambit", slot: "head", name: "スタートダッシュ", desc: "試合開始30秒間、一部ギアパワーの効果がアップする。(頭限定)" },
  { id: "lastDitchEffort", slot: "head", name: "ラストスパート", desc: "試合終了間際、一部ギアパワーの効果がアップする。(頭限定)" },
  { id: "tenacity", slot: "head", name: "逆境強化", desc: "自チームの人数が相手より少ないとき、一部ギアパワーの効果がアップする。(頭限定)" },
  { id: "comeback", slot: "head", name: "カムバック", desc: "やられて復活した直後の一定時間、一部ギアパワーの効果がアップする。(頭限定)" },
  { id: "ninjaSquid", slot: "clothes", name: "イカニンジャ", desc: "イカ・タコ状態で移動しても水しぶきが立たなくなる(代わりにイカダッシュ速度は低下)。(服限定)" },
  { id: "haunt", slot: "clothes", name: "リベンジ", desc: "自分をやられた相手が次にリスポーンする位置に、しばらくマークが付く。(服限定)" },
  { id: "thermalInk", slot: "clothes", name: "サーマルインク", desc: "相手を攻撃(直接攻撃)したとき、その相手の位置が一定時間味方に見えるようになる。(服限定)" },
  { id: "respawnPunisher", slot: "clothes", name: "復活ペナルティアップ", desc: "デス数の多い相手を倒すほど、その相手の復活時間を伸ばす。(服限定)" },
  { id: "abilityDoubler", slot: "clothes", name: "追加ギアパワー倍化", desc: "そのギアの追加ギアパワー1つを、ランダムな2つのギアパワーとして扱う。(服限定)" },
  { id: "stealthJump", slot: "shoes", name: "ステルスジャンプ", desc: "スーパージャンプ時、着地地点が相手のマップに表示されにくくなる。(靴限定)" },
  { id: "objectShredder", slot: "shoes", name: "対物攻撃力アップ", desc: "プレイヤー以外の物体(スプリンクラーやバリアなど)への攻撃ダメージが増える。(靴限定)" },
  { id: "dropRoller", slot: "shoes", name: "受け身術", desc: "スーパージャンプ着地時に操作すると、転がって着地隙をなくし攻撃もできる。(靴限定)" },
];

const ALL_STACKABLE_BY_ID = {};
STACKABLE_ABILITIES.forEach((a) => { ALL_STACKABLE_BY_ID[a.id] = a; });
const ALL_MAINONLY_BY_ID = {};
MAINONLY_ABILITIES.forEach((a) => { ALL_MAINONLY_BY_ID[a.id] = a; });

const GEAR_SLOTS = [
  { key: "head", label: "アタマ" },
  { key: "clothes", label: "フク" },
  { key: "shoes", label: "クツ" },
];

// 対物攻撃力アップ 装備時の主な対象物への倍率(参考値)
const OBJECT_SHREDDER_TABLE = [
  { name: "スプリンクラー・ジャンプビーコン", mult: 10.0 },
  { name: "スプラッシュシールド(サブの壁)", mult: 1.5 },
  { name: "トーピード・カニタンク本体", mult: 1.3 },
  { name: "ウェーブブレイカー・スポンジ", mult: 1.25 },
  { name: "グレートバリア・ブーヤボムの鎧・ガチホコバリア", mult: 1.1 },
];

function emptyGear() {
  return {
    head: { main: "", subs: ["", "", ""] },
    clothes: { main: "", subs: ["", "", ""] },
    shoes: { main: "", subs: ["", "", ""] },
  };
}
function normalizeGear(g) {
  const out = emptyGear();
  if (!g) return out;
  GEAR_SLOTS.forEach(({ key }) => {
    if (g[key]) {
      out[key].main = g[key].main || "";
      for (let i = 0; i < 3; i++) out[key].subs[i] = (g[key].subs && g[key].subs[i]) || "";
    }
  });
  return out;
}

// AP合計から「効果進行度」(0-100%)を算出。
// 0AP=0%、57AP(カンスト)=100%として、APが増えるほど伸びが緩やかになる
// スプラトゥーン3の一般的な逓減カーブの近似式を使用しています。
function apEffectPercent(ap) {
  if (ap <= 0) return 0;
  const p = 3.3 * ap - 0.027 * ap * ap;
  return Math.max(0, Math.min(100, p));
}

// 現在のギア設定から、スタック可能ギアパワーごとのAP合計を計算
function computeApTotals(gear) {
  const totals = {};
  STACKABLE_ABILITIES.forEach((a) => { totals[a.id] = 0; });
  GEAR_SLOTS.forEach(({ key }) => {
    const piece = gear[key];
    if (!piece) return;
    if (piece.main && totals.hasOwnProperty(piece.main)) totals[piece.main] += 10;
    (piece.subs || []).forEach((s) => {
      if (s && totals.hasOwnProperty(s)) totals[s] += 3;
    });
  });
  return totals;
}

// 現在のギア設定から、装備中のメイン専用ギアパワー一覧(装備数つき)を取得
function computeMainOnlyActive(gear) {
  const counts = {};
  GEAR_SLOTS.forEach(({ key }) => {
    const piece = gear[key];
    if (!piece || !piece.main) return;
    if (ALL_MAINONLY_BY_ID[piece.main]) {
      counts[piece.main] = (counts[piece.main] || 0) + 1;
    }
  });
  return Object.keys(counts).map((id) => ({ ability: ALL_MAINONLY_BY_ID[id], count: counts[id] }));
}
