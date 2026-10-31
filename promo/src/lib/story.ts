/**
 * 分镜单一真源：每一秒游戏该是什么状态、指针在哪、机位在哪。
 *
 * 所有切点落在拍点上（beat(n)，见 beats.ts）。段落：
 *
 *   hook    0      ~ b8    四张牌 3 8 3 8，凑 24 ?
 *   home    b8     ~ b16   主页，点「开始游戏」
 *   play    b16    ~ b32   教学：拖 + WASD，三步合成 24，最后一步正落在 drop 上
 *   drop    b32    ~ b40   挑战成功 → 下一关速通（A、W）
 *   themes  b40    ~ b56   调色板 → 每拍换一套主题 / 卡面 → 主题墙
 *   calc    b56    ~ b64   计算器：1 2 3 4 求解
 *   solver  b64    ~ b72   去重动画：292 条路径 → 4 个解
 *   i18n    b72    ~ b80   5 种语言
 *   rules   b80    ~ b92   声明无解 / 超时给参考解
 *   history b92    ~ b104  游戏记录 → 打印
 *   outro   b104   ~ 60s   链接
 *
 * 游戏里的数值（卡面、合并结果、解、记录）全部来自 generated/solver.json，
 * 也就是用仓库里的 script.js 真跑出来的。
 */
import { Easing } from 'remotion';
import data from '../generated/solver.json';
import { beat as b, DROP } from './beats';
import { clamp01, easeInOut, keys, punch } from './motion';
import { lerpPose, pose, type Pose } from '../components/Stage';
import type { ThemeId } from './theme';
import type { CardSnap, CardStyle, CursorKey, DragSnap, GameSnap, HistoryRow, Lang, OpKey, ScreenId } from '../game/types';

export const P = data.puzzles;
export const M = data.merges;
export const HISTORY = data.history as HistoryRow[];

export const CUT = {
  hook: 0,
  home: b(8),
  play: b(16),
  drop: b(32),
  speed: b(35),
  themes: b(40),
  cycle: b(44),
  wall: b(52),
  calc: b(56),
  solver: b(64),
  i18n: b(72),
  rules: b(80),
  timeout: b(86),
  history: b(92),
  export: b(95),
  print: b(98),
  outro: b(104),
  end: 60,
} as const;

export type SceneId =
  | 'hook' | 'home' | 'play' | 'drop' | 'speed' | 'themes' | 'cycle' | 'wall' | 'calc' | 'solver'
  | 'i18n' | 'rules' | 'timeout' | 'history' | 'export' | 'print' | 'outro';
const ORDER: SceneId[] = [
  'hook', 'home', 'play', 'drop', 'speed', 'themes', 'cycle', 'wall', 'calc', 'solver',
  'i18n', 'rules', 'timeout', 'history', 'export', 'print', 'outro',
];
export const sceneAt = (t: number): SceneId => {
  let s: SceneId = 'hook';
  for (const id of ORDER) if (t >= CUT[id]) s = id;
  return s;
};

/** 游戏里 .screen 的 transition: opacity 0.3s ease */
const CSS_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
const fadeIn = (t: number, t0: number, dur = 0.3) => CSS_EASE(clamp01((t - t0) / dur));

// ---------------------------------------------------------------------------
// 第一幕：主页 → 教学三步 → drop → 速通（b8 ~ b40 一镜到底，同一条指针轨迹）
// ---------------------------------------------------------------------------

const START = '[data-t="start_game"]';
const NEXT = '[data-t="next_level"]';
const GRAB = 30; // 抓在数字下方，指针不挡卡面上的字
/**
 * 松手时被拖的卡比目标卡低 78px：上沿刚好让开目标卡上的数字，重叠面积仍有 ~2000px²
 * （checkCollision 的门槛是 500）。
 */
const DROP_Y = 78;

export const T1 = {
  click: b(14),
  /** 教学三步松手时刻：最后一步正落在 drop */
  rel: [b(20), b(24), DROP],
  next: b(35),
  srel: [b(36.5), b(38), b(39.5)],
};

const DRAGS1: DragSnap[] = [
  { id: 1, from: b(17.5), to: T1.rel[0] },
  { id: 2, from: b(21.5), to: T1.rel[1] },
  { id: 3, from: b(25.5), to: T1.rel[2] },
  { id: 1, from: b(35.65), to: T1.srel[0] },
  { id: 3, from: b(37.05), to: T1.srel[1] },
  { id: 2, from: b(38.55), to: T1.srel[2] },
];

type Press = { key: OpKey; from: number; to: number };
const KEYS1: Press[] = [
  { key: 's', from: b(18), to: b(20.3) },
  { key: 'd', from: b(22), to: b(24.3) },
  { key: 's', from: b(26), to: b(32.3) },
  { key: 'a', from: b(35.62), to: b(36.62) },
  { key: 'w', from: b(37.02), to: b(38.1) },
  { key: 'w', from: b(38.52), to: b(39.6) },
];

const PATH1: CursorKey[] = [
  { at: b(11.4), to: { x: 1340, y: 930 } },
  { at: b(13), dur: 0.62, to: { sel: START, dy: 4 } },
  { at: T1.click, to: { sel: START, dy: 4 }, click: true },
  // 第 1 步：8 拖到 3 上，按 S → 8/3
  { at: b(17), dur: 0.62, to: { slot: 1, dy: GRAB } },
  { at: b(19.5), dur: b(19.5) - b(17.5), to: { slot: 0, dx: 30, dy: GRAB + DROP_Y } },
  // 第 2 步：3 拖到 8/3 上，按 D → 1/3
  { at: b(21), dur: 0.46, to: { slot: 2, dy: GRAB } },
  { at: b(23.5), dur: b(23.5) - b(21.5), to: { slot: 0, dx: -24, dy: GRAB + DROP_Y } },
  // 第 3 步：8 拖到 1/3 上，按 S → 24（慢慢拖，憋到 drop 松手）
  { at: b(25), dur: 0.5, to: { slot: 3, dy: GRAB } },
  { at: b(30), dur: b(30) - b(25.5), to: { slot: 0, dx: 30, dy: GRAB + DROP_Y } },
  // 结算 → 下一关
  { at: b(34.5), dur: 0.62, to: { sel: NEXT } },
  { at: T1.next, to: { sel: NEXT }, click: true },
  // 速通：A、W、W
  { at: b(35.6), dur: 0.3, to: { slot: 1, dy: GRAB } },
  { at: b(36.35), dur: 0.36, to: { slot: 0, dx: 30, dy: GRAB + DROP_Y } },
  { at: b(37), dur: 0.3, to: { slot: 3, dy: GRAB } },
  { at: b(37.8), dur: 0.38, to: { slot: 0, dx: 30, dy: GRAB + DROP_Y } },
  { at: b(38.5), dur: 0.3, to: { slot: 2, dy: GRAB } },
  { at: b(39.3), dur: 0.38, to: { slot: 0, dx: -24, dy: GRAB + DROP_Y } },
];

const cardsAt = (seq: { start: CardSnap[]; steps: { cardsAfter: CardSnap[] }[] }, rel: number[], t: number) => {
  let cards = seq.start;
  rel.forEach((r, i) => {
    if (t >= r) cards = seq.steps[i].cardsAfter;
  });
  return cards;
};

const opAt = (presses: Press[], t: number): OpKey | null => presses.find((p) => t >= p.from && t < p.to)?.key ?? null;

/** 指针停在某个按钮上 → 悬停；点击后 0.14s 内 → 按下 */
function hoverPress(path: CursorKey[], t: number) {
  let hover: string | undefined;
  let press: string | undefined;
  for (let i = 0; i < path.length; i++) {
    const k = path[i];
    const next = path[i + 1];
    const leave = next ? next.at - (next.dur ?? 0.38) : Infinity;
    if ('sel' in k.to && t >= k.at - 0.06 && t < leave) {
      hover = k.to.sel;
      if (k.click && t >= k.at && t < k.at + 0.14) press = k.to.sel;
    }
  }
  return { hover, press };
}

const base = (t: number): GameSnap => ({
  t,
  theme: 'glass',
  lang: 'zh',
  cardStyle: 'modern',
  screens: { home: 1 },
  palette: 0,
  levelNums: P.hook.nums,
  cards: M.hook.start,
  activeOp: null,
  stamina: 10,
  streak: 0,
  timer: 1,
  allowNoSolution: true,
});

function act1(t: number): GameSnap {
  const s = base(t);
  const tGame = T1.click + 0.02;
  const tWin = DROP + 0.3; // performOp 里 setTimeout 300ms 才 handleWin
  s.cursor = t >= PATH1[0].at - 0.01 ? PATH1 : undefined;
  Object.assign(s, hoverPress(PATH1, t));
  s.activeOp = opAt(KEYS1, t);
  s.drag = DRAGS1.find((d) => t >= d.from && t < d.to);

  if (t < tGame) return s;
  s.screens = { home: 1 - fadeIn(t, tGame), game: fadeIn(t, tGame) };

  if (t < T1.next) {
    // 第一题 3 8 3 8
    s.cards = cardsAt(M.hook, T1.rel, t);
    s.timer = 1 - (Math.min(t, DROP) - tGame) / 30;
    if (t >= tWin) {
      s.streak = 1;
      s.settlement = { success: true, solutions: P.hook.solutions, streak: 1, history: [] };
      s.screens = { game: 1, settlement: fadeIn(t, tWin) };
    }
    return s;
  }
  // 下一关：6 2 1 3（nextLevel → showScreen('screen-game')，结算层淡出）
  const tn = T1.next + 0.02;
  s.levelNums = P.speed.nums;
  s.cards = cardsAt(M.speed, T1.srel, t);
  s.streak = 1;
  s.timer = 1 - (Math.min(t, T1.srel[2]) - tn) / 30;
  s.settlement = { success: true, solutions: P.hook.solutions, streak: 1, history: [] };
  s.screens = { game: 1, settlement: 1 - fadeIn(t, tn) };
  return s;
}

// ---------------------------------------------------------------------------
// 第二幕：主题
// ---------------------------------------------------------------------------

const PALETTE_BTN = '[title="Theme"]';
const opt = (n: number) => `.theme-option:nth-child(${n})`;
export const T2 = { open: b(41), pick: b(43) };
const PATH2: CursorKey[] = [
  { at: CUT.themes, to: { x: 1150, y: 560 } },
  { at: T2.open, dur: 0.5, to: { sel: PALETTE_BTN } },
  { at: T2.open, to: { sel: PALETTE_BTN }, click: true },
  { at: b(42.2), dur: 0.42, to: { sel: opt(1), dx: -20 } },
  { at: b(42.7), dur: 0.3, to: { sel: opt(2), dx: -20 } },
  { at: T2.pick, to: { sel: opt(2), dx: -20 }, click: true },
];

/** 每拍换一次：主题 / 卡面（b44 ~ b52） */
export const CYCLE: { at: number; theme: ThemeId; style: CardStyle }[] = [
  { at: b(44), theme: 'paper', style: 'modern' },
  { at: b(45), theme: 'bamboo', style: 'modern' },
  { at: b(46), theme: 'leather', style: 'modern' },
  { at: b(47), theme: 'dark', style: 'modern' },
  { at: b(48), theme: 'simple-white', style: 'modern' },
  { at: b(49), theme: 'glass', style: 'modern' },
  { at: b(50), theme: 'dark', style: 'magic' },
  { at: b(51), theme: 'glass', style: 'colorful' },
];
export const cycleAt = (t: number) => [...CYCLE].reverse().find((c) => t >= c.at) ?? CYCLE[0];

function act2(t: number): GameSnap {
  const s = base(t);
  if (t < CUT.cycle) {
    s.cursor = PATH2;
    Object.assign(s, hoverPress(PATH2, t));
    // 调色板：transition all 0.2s；选完主题 setTheme 里顺手 togglePalette 收起
    const open = fadeIn(t, T2.open, 0.2);
    const close = fadeIn(t, T2.pick, 0.2);
    s.palette = t < T2.pick ? open : 1 - close;
    if (t >= T2.pick) s.theme = 'paper';
    return s;
  }
  const c = cycleAt(t);
  s.theme = c.theme;
  s.cardStyle = c.style;
  s.screens = { game: 1 };
  s.timer = 0.62;
  return s;
}

// ---------------------------------------------------------------------------
// 第三幕：计算器
// ---------------------------------------------------------------------------

const SOLVE = '[data-t="solve"]';
export const T3 = { type: [b(57), b(57.5), b(58), b(58.5)], solve: b(60) };
const PATH3: CursorKey[] = [
  { at: CUT.calc, to: { x: 1120, y: 560 } },
  { at: b(56.7), dur: 0.42, to: { sel: '#calc-n1', dx: 10, dy: 6 } },
  { at: b(56.7), to: { sel: '#calc-n1', dx: 10, dy: 6 }, click: true },
  { at: b(59.4), dur: 0.62, to: { sel: SOLVE, dx: 60 } },
  { at: T3.solve, to: { sel: SOLVE, dx: 60 }, click: true },
];

function act3(t: number): GameSnap {
  const s = base(t);
  s.screens = { calculator: 1 };
  s.cursor = PATH3;
  Object.assign(s, hoverPress(PATH3, t));
  const digits = P.calc.nums.map(String);
  s.calc = { inputs: digits.map((d, i) => (t >= T3.type[i] ? d : '')), solved: t >= T3.solve };
  return s;
}

// ---------------------------------------------------------------------------
// 第四幕：多语言
// ---------------------------------------------------------------------------

export const LANGS: { at: number; lang: Lang; label: string }[] = [
  { at: b(72), lang: 'zh', label: '中文' },
  { at: b(73), lang: 'en', label: 'English' },
  { at: b(74.5), lang: 'es', label: 'Español' },
  { at: b(76), lang: 'fr', label: 'Français' },
  { at: b(77.5), lang: 'de', label: 'Deutsch' },
];
export const langAt = (t: number) => [...LANGS].reverse().find((l) => t >= l.at) ?? LANGS[0];

function act4(t: number): GameSnap {
  const s = base(t);
  s.lang = langAt(t).lang;
  return s;
}

// ---------------------------------------------------------------------------
// 第五幕：规则（声明无解 / 超时）→ 记录 → 打印
// ---------------------------------------------------------------------------

const CLAIM = '[data-t="claim_no_solution"]';
const HIST = '[data-t="view_history"]';
export const T5 = { claim: b(83), timeoutFrom: b(86), timeout: b(88), view: b(92), export: CUT.export, print: CUT.print };
const PATH5a: CursorKey[] = [
  { at: CUT.rules, to: { x: 1180, y: 660 } },
  { at: b(82), dur: 0.7, to: { sel: CLAIM } },
  { at: T5.claim, to: { sel: CLAIM }, click: true },
];
const PATH5b: CursorKey[] = [
  { at: b(89), to: { x: 1150, y: 800 } },
  { at: b(91.3), dur: 0.7, to: { sel: HIST } },
  { at: T5.view, to: { sel: HIST }, click: true },
  { at: b(94.4), dur: 0.62, to: { sel: '[data-t="export_wrong"]' } },
  { at: T5.export, to: { sel: '[data-t="export_wrong"]' }, click: true },
  { at: b(97.4), dur: 0.6, to: { sel: '[data-t="print_all"]' } },
  { at: T5.print, to: { sel: '[data-t="print_all"]' }, click: true },
];

function act5(t: number): GameSnap {
  const s = base(t);
  if (t < CUT.timeout) {
    // 1 1 2 5：无解，点「声明无解」→ submitAnswer → handleWin（没有 300ms 延迟）
    s.levelNums = P.noSolution.nums;
    s.cards = M.hook.start.map((c, i) => ({ ...c, n: P.noSolution.nums[i], d: 1 }));
    s.streak = 2;
    s.timer = 1 - (Math.min(t, T5.claim) - CUT.rules) / 30;
    s.screens = { game: 1 };
    s.cursor = PATH5a;
    Object.assign(s, hoverPress(PATH5a, t));
    if (t >= T5.claim) {
      s.streak = 3;
      s.settlement = { success: true, solutions: [], streak: 3, history: HISTORY.slice(0, 2) };
      s.screens = { game: 1, settlement: fadeIn(t, T5.claim) };
    }
    return s;
  }
  // 1 2 7 7：倒计时快进到 0 → handleTimeout：体力 −2、连胜清零、结算给参考解
  s.levelNums = P.timeout.nums;
  s.cards = M.hook.start.map((c, i) => ({ ...c, n: P.timeout.nums[i], d: 1 }));
  s.streak = 3;
  s.timer = keys(t, [[T5.timeoutFrom, 0.24], [T5.timeout, 0]], (x) => x);
  s.screens = { game: 1 };
  if (t >= T5.timeout) {
    s.stamina = 8;
    s.streak = 0;
    s.settlement = { success: false, msg: '时间到！', solutions: P.timeout.solutions, streak: 0, history: HISTORY.slice(0, 3) };
    s.screens = { game: 1, settlement: fadeIn(t, T5.timeout) };
  }
  s.cursor = t >= PATH5b[0].at ? PATH5b : undefined;
  Object.assign(s, hoverPress(PATH5b, t));
  if (t >= T5.view) {
    // endGameAndHistory → showHistory → showScreen('screen-history')
    const p = fadeIn(t, T5.view + 0.02);
    s.history = HISTORY;
    s.screens = { game: 1 - p, settlement: 1 - p, history: p };
  }
  return s;
}

function act6(t: number): GameSnap {
  return base(t);
}

/** 主游戏实例这一帧的状态 */
export function mainSnap(t: number): GameSnap {
  if (t < CUT.themes) return act1(t);
  if (t < CUT.calc) return act2(t);
  if (t < CUT.i18n) return act3(t);
  if (t < CUT.rules) return act4(t);
  if (t < CUT.outro) return act5(t);
  return act6(t);
}

/** 主题墙：6 个实例各自的主题与卡面 */
export const WALL: { theme: ThemeId; style: CardStyle }[] = [
  { theme: 'glass', style: 'modern' },
  { theme: 'paper', style: 'modern' },
  { theme: 'bamboo', style: 'colorful' },
  { theme: 'leather', style: 'magic' },
  { theme: 'dark', style: 'magic' },
  { theme: 'simple-white', style: 'colorful' },
];
export function wallSnap(t: number, i: number): GameSnap {
  const s = base(t);
  s.theme = WALL[i].theme;
  s.cardStyle = WALL[i].style;
  s.screens = { game: 1 };
  s.timer = 0.62;
  return s;
}

// ---------------------------------------------------------------------------
// 机位
// ---------------------------------------------------------------------------

/** 游戏窗口居右、左边留给字：600×600 的窗口放大 1.32 倍，中心落在画面 x≈1290 */
// x 不能小于 960/k，否则画面左边会露出页面以外（玻璃主题看不出来，换成宣纸、暗血就是一条边）
export const RIGHT = pose(1.32, 730, 540);
/** 计算器求解后推近到结果列表 */
export const CALC_ZOOM = { at: b(60) + 0.45, dur: 1.1, pose: pose(2.2, 900, 520) };

const ease = (t: number, a: number, d: number) => easeInOut(clamp01((t - a) / d));

export function mainPose(t: number): Pose {
  let p: Pose = RIGHT;
  let kick = 0;
  const sc = sceneAt(t);
  if (sc === 'home') {
    p = lerpPose(pose(2.15, 960, 478), RIGHT, ease(t, CUT.home + 0.15, 1.75));
  } else if (sc === 'play') {
    const push = lerpPose(RIGHT, pose(1.38, 724, 540), ease(t, CUT.play, b(25) - CUT.play));
    p = lerpPose(push, pose(1.62, 772, 500), ease(t, b(25.5), b(31.5) - b(25.5)));
    kick = 0.022 * (punch(t, T1.rel[0], 6) + punch(t, T1.rel[1], 6));
  } else if (sc === 'drop') {
    p = lerpPose(pose(1.62, 772, 500), RIGHT, ease(t, b(33), 1.3));
    kick = 0.07 * punch(t, DROP, 4.5);
  } else if (sc === 'speed') {
    kick = 0.02 * T1.srel.reduce((a, r) => a + punch(t, r, 7), 0);
  } else if (sc === 'themes') {
    p = pose(1.58, 820, 470);
  } else if (sc === 'cycle') {
    p = lerpPose(RIGHT, pose(1.42, 734, 532), ease(t, CUT.cycle, CUT.wall - CUT.cycle));
    kick = 0.018 * CYCLE.reduce((a, c) => a + punch(t, c.at, 8), 0);
  } else if (sc === 'calc') {
    p = lerpPose(RIGHT, CALC_ZOOM.pose, ease(t, CALC_ZOOM.at, CALC_ZOOM.dur));
  } else if (sc === 'rules' || sc === 'timeout') {
    kick = 0.03 * (punch(t, T5.claim, 6) + punch(t, T5.timeout, 6));
  }
  return { ...p, k: p.k * (1 + kick) };
}
