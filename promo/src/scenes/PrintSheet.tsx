import React, { useCallback, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { FONT, type ThemeId, INK } from '../lib/theme';
import { easeOut, ramp } from '../lib/motion';
import type { Ink } from '../components/Panel';

const A4_W = 794;
const A4_H = 1123;
const SCALE = 0.84;
/** 打印页只露上半截（4 张练习卡都在这一截里），下沿渐隐 */
const SHOW_H = 520;

const Kicker: React.FC<{ ink: Ink; p: number; children: React.ReactNode }> = ({ ink, p, children }) => (
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
      opacity: p,
      marginBottom: 24,
    }}
  >
    <span style={{ width: 34, height: 3, borderRadius: 2, background: ink.accent }} />
    {children}
  </div>
);

/**
 * 「📥 错题导出」下载下来的那份 Markdown。内容是 gen-solver-data.mjs 调
 * App.exportMarkdown('wrong') 收下来的原文（文件名里的时间戳固定过）。
 */
export const MarkdownCard: React.FC<{ t: number; from: number; name: string; text: string; theme: ThemeId }> = ({
  t,
  from,
  name,
  text,
  theme,
}) => {
  const ink = INK[theme];
  const p = ramp(t, from + 0.04, 0.5, easeOut);
  const k = ramp(t, from, 0.3);
  return (
    <div style={{ position: 'absolute', left: 128, top: 0, bottom: 0, width: 680, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Kicker ink={ink} p={k}>
        EXPORT · <span style={{ fontFamily: FONT.sans, letterSpacing: '0.08em' }}>错题导出 Markdown</span>
      </Kicker>
      <div
        style={{
          width: 620,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.86)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 24px 60px rgba(31,38,135,0.2)',
          overflow: 'hidden',
          opacity: Math.min(1, p * 1.5),
          transform: `translateY(${(1 - p) * 60}px) scale(${0.96 + 0.04 * p})`,
          transformOrigin: '0 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 26px',
            borderBottom: '1px solid rgba(45,55,72,0.1)',
            fontFamily: FONT.mono,
            fontSize: 19,
            color: ink.text,
          }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26">
            <path d="M2 1h12l6 6v18H2z" fill="none" stroke={ink.accent} strokeWidth="2" strokeLinejoin="round" />
            <path d="M14 1v6h6" fill="none" stroke={ink.accent} strokeWidth="2" strokeLinejoin="round" />
          </svg>
          {name}
          <span style={{ marginLeft: 'auto', fontFamily: FONT.sans, fontSize: 18, fontWeight: 600, color: '#38a169' }}>已下载</span>
        </div>
        <div style={{ padding: '22px 30px 28px', fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.62, color: ink.text }}>
          {text
            .trimEnd()
            .split('\n')
            .map((line, i) => {
              const q = ramp(t, from + 0.25 + i * 0.06, 0.25);
              const head = line.startsWith('#');
              return (
                <div key={i} style={{ minHeight: '1.62em', opacity: q, whiteSpace: 'pre' }}>
                  {head ? (
                    <span style={{ color: ink.accent, fontWeight: 700 }}>{line}</span>
                  ) : (
                    line.split(/(\*\*[^*]+\*\*)/).map((seg, j) =>
                      seg.startsWith('**') ? (
                        <span key={j} style={{ fontWeight: 700 }}>
                          {seg}
                        </span>
                      ) : (
                        <span key={j} style={{ color: ink.soft }}>
                          {seg}
                        </span>
                      ),
                    )
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

/**
 * 「🖨️ 全部打印」打开的那一页。HTML 是 gen-solver-data.mjs 直接调 App.printCards('all')
 * 收下来的原文；只在最前面塞一句把 window.print 换成空函数 —— 原页面 onload 500ms 后
 * 会自动弹打印对话框，渲染时不能让它弹。
 */
export const PrintSheet: React.FC<{ t: number; from: number; html: string; theme: ThemeId }> = ({ t, from, html, theme }) => {
  const [handle] = useState(() => delayRender('打印页 iframe'));
  const onLoad = useCallback(() => continueRender(handle), [handle]);
  const doc = html.replace('<head>', '<head><script>window.print = function () {};</script>');
  const p = ramp(t, from + 0.04, 0.6, easeOut);
  const k = ramp(t, from + 0.2, 0.35);
  const ink = INK[theme];
  return (
    <div style={{ position: 'absolute', left: 128, top: 0, bottom: 0, width: 700, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Kicker ink={ink} p={k}>
        PRINT · <span style={{ fontFamily: FONT.sans, letterSpacing: '0.08em' }}>全部打印成练习卡</span>
      </Kicker>
      <div
        style={{
          width: A4_W * SCALE,
          height: SHOW_H,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 30px 80px rgba(31,38,135,0.26), 0 4px 14px rgba(0,0,0,0.1)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)',
          opacity: Math.min(1, p * 1.6),
          transform: `translateY(${(1 - p) * 200}px) rotate(${-2.4 * (1 - p) - 0.8}deg)`,
          transformOrigin: '50% 100%',
        }}
      >
        <iframe
          srcDoc={doc}
          onLoad={onLoad}
          title="print"
          style={{ width: A4_W, height: A4_H, border: 0, transform: `scale(${SCALE})`, transformOrigin: '0 0', display: 'block' }}
        />
      </div>
    </div>
  );
};
