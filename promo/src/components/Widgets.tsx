import React from 'react';
import { FONT, type ThemeId, THEME_ZH } from '../lib/theme';
import { Math as MathML } from './Math';
import { easeOut, ramp } from '../lib/motion';
import type { OpKey } from '../game/types';
import type { Ink } from './Panel';

/** WASD 键帽：和游戏底部 .key-badge / .key-active 同一套语义（按下 = 强调色底 + 白字） */
const OPS: Record<OpKey, { sym: string; zh: string }> = {
  w: { sym: '×', zh: '乘' },
  a: { sym: '+', zh: '加' },
  s: { sym: '÷', zh: '除' },
  d: { sym: '−', zh: '减' },
};

const Key: React.FC<{ k: OpKey; on: boolean; ink: Ink }> = ({ k, on, ink }) => (
  <div
    style={{
      width: 104,
      height: 104,
      borderRadius: 22,
      background: on ? ink.accent : 'rgba(255,255,255,0.5)',
      border: `1.5px solid ${on ? ink.accent : 'rgba(255,255,255,0.8)'}`,
      boxShadow: on
        ? `0 1px 0 rgba(0,0,0,0.12), 0 0 0 7px ${ink.accent}30, 0 10px 26px ${ink.accent}55`
        : '0 6px 0 rgba(45,55,72,0.13), 0 12px 26px rgba(31,38,135,0.12)',
      transform: `translateY(${on ? 5 : 0}px)`,
      color: on ? '#fff' : ink.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 42, lineHeight: 1 }}>{k.toUpperCase()}</div>
    <div style={{ fontFamily: FONT.sans, fontSize: 20, fontWeight: 600, opacity: on ? 0.95 : 0.62 }}>
      {OPS[k].sym} {OPS[k].zh}
    </div>
  </div>
);

export const Keycaps: React.FC<{ active: OpKey | null; ink: Ink }> = ({ active, ink }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <Key k="w" on={active === 'w'} ink={ink} />
    <div style={{ display: 'flex', gap: 14 }}>
      <Key k="a" on={active === 'a'} ink={ink} />
      <Key k="s" on={active === 's'} ink={ink} />
      <Key k="d" on={active === 'd'} ink={ink} />
    </div>
  </div>
);

/** 合并记录：每次松手多一行「a op b = c」，公式用 MathML 排（分数是上下两层），结果用强调色 */
export const Trace: React.FC<{
  t: number;
  lines: { at: number; text: string; math?: [string, string] }[];
  ink: Ink;
  size?: number;
}> = ({ t, lines, ink, size = 34 }) => {
  const shown = lines.filter((l) => t >= l.at);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {shown.map((l, i) => {
        const p = ramp(t, l.at, 0.32, easeOut);
        const last = i === shown.length - 1;
        const [lhs, rhs] = l.text.split(' = ');
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              height: size * 1.75,
              color: last ? ink.text : ink.soft,
              opacity: p,
              transform: `translateX(${(1 - p) * -24}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            {l.math ? <MathML html={l.math[0]} size={size} color={last ? ink.text : ink.soft} /> : <span style={{ fontFamily: FONT.mono, fontSize: size }}>{lhs}</span>}
            <span style={{ fontFamily: FONT.mono, fontSize: size * 0.9, opacity: 0.75 }}>=</span>
            {l.math ? <MathML html={l.math[1]} size={size} color={last ? ink.accent : ink.soft} /> : <span style={{ fontFamily: FONT.mono, fontSize: size, color: ink.accent }}>{rhs}</span>}
          </div>
        );
      })}
    </div>
  );
};

/** 主题清单：圆点颜色取自 script.js 里 THEMES 的 --bg-body */
export const ThemeList: React.FC<{
  themes: { id: string; name: string; dot: string }[];
  active: ThemeId;
  ink: Ink;
}> = ({ themes, active, ink }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 34, rowGap: 14 }}>
    {themes.map((th) => {
      const on = th.id === active;
      const name = th.name.replace(/^[^A-Za-z]+/, '').replace(' (Default)', '');
      return (
        <div key={th.id} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: on ? 1 : 0.5 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 99,
              background: th.dot,
              border: '2px solid rgba(0,0,0,0.12)',
              boxShadow: on ? `0 0 0 5px ${ink.accent}55` : 'none',
            }}
          />
          <span style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: on ? 700 : 500 }}>{name}</span>
          <span style={{ fontSize: 22, color: ink.soft }}>{THEME_ZH[th.id as ThemeId]}</span>
        </div>
      );
    })}
  </div>
);

/** 卡面三选一 */
export const StyleRow: React.FC<{ active: string; ink: Ink }> = ({ active, ink }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
    <span style={{ fontSize: 24, color: ink.soft, marginRight: 6 }}>卡面</span>
    {[
      ['modern', 'Modern 现代'],
      ['magic', 'Magic 魔法'],
      ['colorful', 'Colorful 多彩'],
    ].map(([id, label]) => {
      const on = id === active;
      return (
        <span
          key={id}
          style={{
            fontSize: 23,
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: 12,
            color: on ? '#fff' : ink.text,
            background: on ? ink.accent : 'rgba(255,255,255,0.35)',
            border: `1px solid ${on ? ink.accent : 'rgba(255,255,255,0.55)'}`,
            opacity: on ? 1 : 0.7,
          }}
        >
          {label}
        </span>
      );
    })}
  </div>
);

/** 语言清单：右边是该语言下「开始游戏」按钮上的字（I18N.start_game） */
export const LangList: React.FC<{
  langs: { id: string; label: string; start: string }[];
  active: string;
  ink: Ink;
}> = ({ langs, active, ink }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {langs.map((l) => {
      const on = l.id === active;
      return (
        <div key={l.id} style={{ display: 'flex', alignItems: 'baseline', gap: 22, opacity: on ? 1 : 0.42 }}>
          <span
            style={{
              width: 6,
              height: 30,
              borderRadius: 3,
              background: on ? ink.accent : 'transparent',
              alignSelf: 'center',
            }}
          />
          <span style={{ width: 190, fontFamily: FONT.display, fontSize: 34, fontWeight: on ? 700 : 500 }}>{l.label}</span>
          <span style={{ fontSize: 26, color: on ? ink.accent : ink.soft, fontWeight: 600 }}>{l.start}</span>
        </div>
      );
    })}
  </div>
);
