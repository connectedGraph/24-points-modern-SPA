/**
 * 画布：3840×2160 输出，所有排版按 1920×1080 的设计像素写，再整体 ×2。
 * 游戏 iframe 的视口也是 1920×1080 —— 就是一台 1080p 浏览器打开 index.html 的样子。
 */
export const W = 3840;
export const H = 2160;
export const UI_W = 1920;
export const UI_H = 1080;

export type ThemeId = 'glass' | 'paper' | 'bamboo' | 'leather' | 'dark' | 'simple-white';

/**
 * 每套主题下片子叠字用的颜色。取自 style.css 各主题的 --text-main / --color-accent；
 * 暗血主题的 --text-main (#A3A3A3) 叠在大字上太灰，提亮到 #e9e4e4。
 */
export const INK: Record<ThemeId, { text: string; accent: string; soft: string }> = {
  glass: { text: '#2d3748', accent: '#667eea', soft: 'rgba(45,55,72,0.68)' },
  paper: { text: '#2b2b2b', accent: '#8B2626', soft: 'rgba(43,43,43,0.66)' },
  bamboo: { text: '#2C3E2E', accent: '#4A704A', soft: 'rgba(44,62,46,0.68)' },
  leather: { text: '#4A3625', accent: '#7A5230', soft: 'rgba(74,54,37,0.70)' },
  dark: { text: '#e9e4e4', accent: '#c43a3a', soft: 'rgba(233,228,228,0.62)' },
  'simple-white': { text: '#333333', accent: '#667eea', soft: 'rgba(51,51,51,0.62)' },
};

/** 主题中文名：style.css 注释里的叫法 */
export const THEME_ZH: Record<ThemeId, string> = {
  glass: '毛玻璃',
  paper: '宣纸',
  bamboo: '竹简',
  leather: '牛皮',
  dark: '暗血',
  'simple-white': '极简白',
};

export const FONT = {
  /** 中文：HarmonyOS Sans SC（本机 sans-serif 默认也是它，和游戏里的回退字体一致） */
  sans: '"HarmonyOS Sans SC", "Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei UI", sans-serif',
  /** 拉丁大字与数字 */
  display: '"Inter Display", Inter, "HarmonyOS Sans SC", sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", "DejaVu Sans Mono", ui-monospace, monospace',
} as const;

export const LINKS = {
  play: 'connectedgraph.github.io/24-points-modern-SPA',
  playUrl: 'https://connectedgraph.github.io/24-points-modern-SPA/',
  repo: 'github.com/connectedGraph/24-points-modern-SPA',
  repoUrl: 'https://github.com/connectedGraph/24-points-modern-SPA',
} as const;
