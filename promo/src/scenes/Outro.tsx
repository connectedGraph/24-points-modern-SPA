import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CUT } from '../lib/story';
import { beat as b } from '../lib/beats';
import { FONT, INK, LINKS } from '../lib/theme';
import { easeOut, ramp } from '../lib/motion';

const ink = INK.glass;

const Qr: React.FC<{ url: string; label: string; text: string; p: number }> = ({ url, label, text, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
    <div
      style={{
        padding: 12,
        borderRadius: 18,
        background: '#fff',
        boxShadow: '0 12px 30px rgba(31,38,135,0.16)',
        lineHeight: 0,
      }}
    >
      <QRCodeSVG value={url} size={150} level="M" fgColor="#2d3748" bgColor="#ffffff" marginSize={0} />
    </div>
    <div>
      <div style={{ fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: ink.text }}>{label}</div>
      {/* 网址在最后一个 / 后面断行，不在单词中间折 */}
      <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 20, color: ink.soft, lineHeight: 1.45 }}>
        <div>{text.slice(0, text.lastIndexOf('/') + 1)}</div>
        <div style={{ color: ink.text }}>{text.slice(text.lastIndexOf('/') + 1)}</div>
      </div>
    </div>
  </div>
);

/** 片尾：左边品牌与两个二维码（在线玩 / 源码），右边是游戏主页本身 */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const e = t - CUT.outro;
  const k = ramp(e, 0, 0.32);
  const title = ramp(e, 0.05, 0.6, easeOut);
  const sub = ramp(t, b(105), 0.45);
  const q1 = ramp(t, b(106), 0.45);
  const q2 = ramp(t, b(107), 0.45);
  return (
    <div style={{ position: 'absolute', left: 128, top: 0, bottom: 0, width: 720, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
        }}
      >
        <span style={{ width: 34, height: 3, borderRadius: 2, background: ink.accent }} />
        24-POINTS-MODERN-SPA
      </div>
      <div style={{ overflow: 'hidden', marginTop: 10 }}>
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: ink.text,
            transform: `translateY(${(1 - title) * 100}%)`,
            lineHeight: 1.12,
          }}
        >
          24 <span style={{ color: ink.accent }}>Point</span>
        </div>
      </div>
      <div style={{ marginTop: 6, fontFamily: FONT.sans, fontSize: 36, color: ink.soft, opacity: sub }}>
        现代 UI 的 24 点 · 零依赖 · 打开即玩
      </div>
      <div style={{ marginTop: 54, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <Qr url={LINKS.playUrl} label="在线玩" text={LINKS.play} p={q1} />
        <Qr url={LINKS.repoUrl} label="源码" text={LINKS.repo} p={q2} />
      </div>
    </div>
  );
};
