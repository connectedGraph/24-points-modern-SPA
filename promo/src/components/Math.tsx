import React from 'react';

/**
 * 公式：和游戏里同一套 MathTeX（script.js）产出的 MathML，直接交给浏览器原生排版。
 * 字体和 style.css 里那条 math 规则一致，片子里和游戏里看到的是同一种公式。
 */
export const MATH_FONT = '"Latin Modern Math", "STIX Two Math", "Noto Sans Math", math';

export const Math: React.FC<{ html: string; size: number; color?: string; style?: React.CSSProperties }> = ({
  html,
  size,
  color,
  style,
}) => (
  <span
    style={{ fontFamily: MATH_FONT, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', ...style }}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
