import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Overlay } from '../components/Stage';
import { beat as b } from '../lib/beats';
import { FONT, INK } from '../lib/theme';
import { clamp01, easeIn, ramp, springAt } from '../lib/motion';

/** 游戏 body 的底色（style.css :root --bg-body） */
export const GLASS_BG = 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';

const ink = INK.glass;

/**
 * 卡片：把游戏里 .card + .card-style-modern 的样子按 2.5 倍画出来
 * （80×110、圆角 12、rgba(255,255,255,.9)、0 4px 6px 阴影、'Segoe UI', sans-serif 粗体）。
 */
const Tile: React.FC<{ v: string; e: number; tilt: number }> = ({ v, e, tilt }) => {
  const s = springAt(e, 17, 0.5);
  const o = clamp01(e / 0.1);
  return (
    <div
      style={{
        width: 200,
        height: 275,
        borderRadius: 30,
        background: 'rgba(255,255,255,0.9)',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 24px 60px rgba(31,38,135,0.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif",
        fontWeight: 'bold',
        fontSize: 96,
        color: '#2d3748',
        opacity: o,
        transform: `translateY(${(1 - s) * -70}px) scale(${0.72 + 0.28 * s}) rotate(${(1 - s) * tilt}deg)`,
      }}
    >
      {v}
    </div>
  );
};

const Q: React.FC<{ e: number }> = ({ e }) => {
  const s = springAt(e, 20, 0.45);
  return (
    <div
      style={{
        width: 70,
        height: 70,
        margin: '0 24px',
        borderRadius: 99,
        background: 'rgba(255,255,255,0.45)',
        border: '1.5px solid rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT.display,
        fontSize: 40,
        fontWeight: 700,
        color: ink.accent,
        opacity: clamp01(e / 0.08),
        transform: `scale(${Math.max(0, s)})`,
      }}
    >
      ?
    </div>
  );
};

/**
 * 开场在 b8 小节线上硬切到主页。叠化试过：两套大字叠在一起很乱；
 * 现在是最后半小节往前推近，切过去时主页正从近景往外拉，两个方向接上。
 */
export const HOOK_END = b(8);

export const Hook: React.FC<{ t: number; nums: number[] }> = ({ t, nums }) => {
  // 收尾：整屏往前冲（放大），最后 0.18s 化掉 —— 冲劲盖过两层字叠在一起的那几帧
  const exit = ramp(t, HOOK_END - 0.7, 0.7, easeIn);
  const k = ramp(t, b(1) - 0.05, 0.35);
  const eq = t - b(6);
  const eqS = springAt(eq, 15, 0.42);
  const cap = ramp(t, b(6) + 0.08, 0.45);
  const sub = ramp(t, b(7), 0.4);
  // 「= 24」出来之前，四张牌自己居中；它弹出来时整行往左让出 173px（它宽度的一半）
  const shift = 173 * (1 - ramp(t, b(6) - 0.04, 0.42));
  return (
    <AbsoluteFill style={{ background: GLASS_BG }}>
      <Overlay>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${1 + exit * 0.9})`,
            transformOrigin: '960px 520px',
            filter: exit > 0 ? `blur(${exit * 5}px)` : undefined,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 196,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: FONT.display,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.36em',
              color: ink.accent,
              opacity: k,
            }}
          >
            24 POINT
          </div>
          <div
            style={{
              position: 'absolute',
              top: 500 - 138,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `translateX(${shift}px)`,
            }}
          >
            {nums.map((n, i) => (
              <React.Fragment key={i}>
                <Tile v={String(n)} e={t - b(1 + i)} tilt={[-7, 5, -4, 6][i]} />
                {i < 3 && (t >= b(5) ? <Q e={t - b(5) - i * 0.07} /> : <div style={{ width: 118 }} />)}
              </React.Fragment>
            ))}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 46,
                width: 300,
                opacity: clamp01(eq / 0.06),
                transform: `scale(${eq > 0 ? 1.5 - 0.5 * eqS : 1.5})`,
                transformOrigin: '0 60%',
              }}
            >
              <span style={{ fontFamily: FONT.display, fontSize: 110, fontWeight: 500, color: ink.soft, lineHeight: 1 }}>=</span>
              <span
                style={{
                  fontFamily: FONT.display,
                  fontSize: 168,
                  fontWeight: 800,
                  color: ink.accent,
                  marginLeft: 22,
                  letterSpacing: '-0.02em',
                }}
              >
                24
              </span>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 724,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: FONT.sans,
              fontSize: 60,
              fontWeight: 700,
              color: ink.text,
              opacity: cap,
              transform: `translateY(${(1 - cap) * 24}px)`,
            }}
          >
            四张牌，加减乘除，凑出 24
          </div>
          <div
            style={{
              position: 'absolute',
              top: 820,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: FONT.sans,
              fontSize: 32,
              color: ink.soft,
              opacity: sub,
              transform: `translateY(${(1 - sub) * 16}px)`,
            }}
          >
            这一题，你能算出来吗？
          </div>
        </div>
      </Overlay>
    </AbsoluteFill>
  );
};
