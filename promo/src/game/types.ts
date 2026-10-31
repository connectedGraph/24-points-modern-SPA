import type { ThemeId } from '../lib/theme';

export type ScreenId = 'home' | 'game' | 'settlement' | 'calculator' | 'settings' | 'help' | 'history';
export type CardStyle = 'modern' | 'magic' | 'colorful';
export type Lang = 'zh' | 'en' | 'es' | 'fr' | 'de';
export type OpKey = 'w' | 'a' | 's' | 'd';

/** 一张卡：值用分子 / 分母存，进 iframe 后再 new 成游戏自己的 Fraction */
export type CardSnap = { id: number; n: number; d: number; slot: number };

export type HistoryRow = { q: string; res: string; success: boolean; sols: string[] };

/**
 * 游戏内的定位点（iframe 视口的 CSS 像素）：
 * - slot：第 n 个卡槽里卡片的中心（和 App.renderCards 的居中算法一致）
 * - sel：任意元素的中心
 * - xy：绝对坐标
 * dx / dy 是在此基础上的偏移。
 */
export type Anchor =
  | { slot: number; dx?: number; dy?: number }
  | { sel: string; dx?: number; dy?: number }
  | { x: number; y: number };

/** 指针关键帧：在 at 秒到达 to；移动用 dur 秒（默认 0.38） */
export type CursorKey = { at: number; to: Anchor; dur?: number; click?: boolean };

/**
 * 拖拽：from 秒按下（指针应当已经停在被拖卡片上），之后卡片跟着指针走，
 * to 秒松手。松手后卡片就交给 cards 字段（合并结果）了。
 */
export type DragSnap = { id: number; from: number; to: number };

export type GameSnap = {
  t: number;
  theme: ThemeId;
  lang: Lang;
  cardStyle: CardStyle;
  /** 每一屏的不透明度；> 0 即 active（游戏原本 0.3s 的淡入淡出改由这里逐帧给） */
  screens: Partial<Record<ScreenId, number>>;
  /** 调色板菜单展开进度 0..1 */
  palette: number;
  levelNums: number[];
  cards: CardSnap[];
  drag?: DragSnap;
  activeOp: OpKey | null;
  stamina: number;
  streak: number;
  /** 倒计时条剩余比例 0..1 */
  timer: number;
  /** 提示高亮：哪些卡、从哪一秒开始脉冲 */
  highlight?: { ids: number[]; since: number };
  settlement?: { success: boolean; msg?: string; solutions: string[]; streak: number; history: HistoryRow[] };
  calc?: { inputs: string[]; solved: boolean };
  history?: HistoryRow[];
  allowNoSolution: boolean;
  /** 悬停 / 按下的元素（CSS 选择器）；用游戏自己的 :hover / :active 规则 */
  hover?: string;
  press?: string;
  cursor?: CursorKey[];
};
