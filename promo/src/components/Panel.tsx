import React from 'react';
import { FONT } from '../lib/theme';
import { easeOut, ramp } from '../lib/motion';

export type Ink = { text: string; accent: string; soft: string };

/**
 * 左侧叠字：小标（英文大写）+ 大标题（逐行升起）+ 说明 + 附加内容（键帽、算式、列表）。
 * 游戏窗口在右边，叠字只占 x 128 ~ 800。
 */
export const Panel: React.FC<{
  t: number;
  from: number;
  ink: Ink;
  kicker: string;
  title: React.ReactNode[];
  body?: React.ReactNode;
  children?: React.ReactNode;
  titleSize?: number;
  width?: number;
  /** 提前退场（秒）：0.3s 淡出并左移 */
  exit?: number;
}> = ({ t, from, ink, kicker, title, body, children, titleSize = 74, width = 680, exit }) => {
  const e = t - from;
  const k = ramp(e, 0, 0.32);
  const bd = ramp(e, 0.26, 0.42);
  const ch = ramp(e, 0.34, 0.45);
  const out = exit === undefined ? 0 : ramp(t, exit, 0.3);
  if (out >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 128,
        top: 0,
        bottom: 0,
        width,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: ink.text,
        fontFamily: FONT.sans,
        opacity: 1 - out,
        transform: `translateX(${out * -40}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: FONT.display,
          fontWeight: 600,
          fontSize: 21,
          letterSpacing: '0.22em',
          color: ink.accent,
          opacity: k,
          transform: `translateX(${(1 - k) * -18}px)`,
          marginBottom: 26,
        }}
      >
        <span style={{ width: 34, height: 3, borderRadius: 2, background: ink.accent }} />
        {kicker}
      </div>
      {title.map((line, i) => {
        const p = ramp(e, 0.05 + i * 0.075, 0.5, easeOut);
        return (
          <div key={i} style={{ overflow: 'hidden', paddingBottom: 6 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.16,
                letterSpacing: '0.01em',
                transform: `translateY(${(1 - p) * 105}%)`,
                whiteSpace: 'nowrap',
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
      {body && (
        <div
          style={{
            marginTop: 26,
            fontSize: 29,
            lineHeight: 1.62,
            color: ink.soft,
            whiteSpace: 'pre-line',
            opacity: bd,
            transform: `translateY(${(1 - bd) * 14}px)`,
          }}
        >
          {body}
        </div>
      )}
      {children && (
        <div style={{ marginTop: 38, opacity: ch, transform: `translateY(${(1 - ch) * 18}px)` }}>{children}</div>
      )}
    </div>
  );
};
