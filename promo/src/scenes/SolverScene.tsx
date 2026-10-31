import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Overlay } from '../components/Stage';
import { beat as b } from '../lib/beats';
import { FONT } from '../lib/theme';
import { clamp01, easeInOut, lerp, ramp, springAt } from '../lib/motion';

type Path = { exp: string; key: string };

/** 四组的颜色：style.css 里的 accent / success / 警告橙 / danger，在深底上提亮一档 */
const GROUP = ['#8fa2ff', '#4fd18b', '#f5b342', '#ff7a7a'];
const BG = 'radial-gradient(ellipse at 28% 18%, #2c3474 0%, #171b3d 52%, #0e1128 100%)';

const COLS = 12;
const CW = 134;
const CH = 22;
const GX = 140;
const GY = 27;
const X0 = 128;
const Y0 = 336;

/** 伪随机（按下标确定），飞行路线的抖动用 */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * 「去重」镜头：求解器在 1 2 3 4 上递归回溯，一共 292 条路径算到 24；
 * getHash 把它们映射到 4 个标准化哈希 —— 也就是计算器里那 4 行。
 * 数据来自 generated/solver.json（用 script.js 真跑、在 getHash 那一行插桩记下的每一条路径）。
 */
export const SolverScene: React.FC<{ t: number; paths: Path[]; solutions: string[] }> = ({ t, paths, solutions }) => {
  const order: string[] = [];
  for (const p of paths) if (!order.includes(p.key)) order.push(p.key);
  const count = order.map((k) => paths.filter((p) => p.key === k).length);
  const firstExp = order.map((k) => paths.find((p) => p.key === k)!.exp);

  const tA = b(64);
  const tB = b(66);
  const tC = b(68);
  const tD = b(69.6);
  const n = Math.round(292 * ramp(t, tA, 1.1, (x) => x));
  const seen = new Map<string, number>();

  // 第四阶段：四张结果卡
  const cardX = (g: number) => 168 + g * 404;
  const cardW = 372;
  const cardY = 404;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Overlay>
        {/* 标题区 */}
        <div style={{ position: 'absolute', left: 128, top: 92, color: '#eef1ff', fontFamily: FONT.sans }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: FONT.display,
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: '0.22em',
              color: '#a1c4fd',
              marginBottom: 22,
            }}
          >
            <span style={{ width: 34, height: 3, borderRadius: 2, background: '#a1c4fd' }} />
            UNIQUENESS SOLVER · 唯一解求解器
          </div>
          {t < tC ? (
            <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.15 }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, color: '#a1c4fd' }}>{n}</span> 条递归路径都算到了 24
            </div>
          ) : (
            <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.15, display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, color: 'rgba(238,241,255,0.45)' }}>292</span>
              <span style={{ fontFamily: FONT.display, color: 'rgba(238,241,255,0.45)' }}>→</span>
              <span
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  color: '#a1c4fd',
                  display: 'inline-block',
                  transform: `scale(${1.5 - 0.5 * springAt(t - tC, 15, 0.45)})`,
                  transformOrigin: '50% 70%',
                }}
              >
                4
              </span>
              <span>个本质不同的解</span>
            </div>
          )}
          <div
            style={{
              marginTop: 18,
              fontSize: 28,
              color: 'rgba(238,241,255,0.66)',
              opacity: ramp(t, tB, 0.4),
            }}
          >
            {t < tC ? '按标准化哈希归类：同一组 = 数学上同一个解' : 'AST 扁平化 + 标准化哈希：交换律、结合律、负号统统归一'}
          </div>
        </div>

        {/* 源码片段：getHash 里决定「交换律无关」的那三行 */}
        <div
          style={{
            position: 'absolute',
            right: 128,
            top: 98,
            padding: '20px 26px',
            borderRadius: 16,
            background: 'rgba(10,12,32,0.55)',
            border: '1px solid rgba(161,196,253,0.22)',
            fontFamily: FONT.mono,
            fontSize: 19,
            lineHeight: 1.7,
            color: 'rgba(238,241,255,0.82)',
            opacity: ramp(t, tB + 0.15, 0.4) * (1 - ramp(t, tC - 0.2, 0.25)),
            transform: `translateY(${(1 - ramp(t, tB + 0.15, 0.4)) * 14}px)`,
          }}
        >
          <div style={{ color: 'rgba(161,196,253,0.6)' }}>{'// script.js · Solver.getHash'}</div>
          <div>
            termHashes.<span style={{ color: '#f5b342' }}>sort</span>();
          </div>
          <div>
            <span style={{ color: '#8fa2ff' }}>let</span> h = <span style={{ color: '#4fd18b' }}>"(ADD"</span> + termHashes.
            <span style={{ color: '#f5b342' }}>join</span>(<span style={{ color: '#4fd18b' }}>""</span>) + <span style={{ color: '#4fd18b' }}>")"</span>;
          </div>
          <div>
            <span style={{ color: '#8fa2ff' }}>return</span> is_neg ? <span style={{ color: '#4fd18b' }}>"-"</span> + h : h;
          </div>
        </div>

        {/* 292 个路径块 */}
        {paths.map((p, i) => {
          const g = order.indexOf(p.key);
          const appear = ramp(t, tA + (i / paths.length) * 1.0, 0.18);
          if (appear <= 0) return null;
          const tint = ramp(t, tB + g * 0.12 + (i % 12) * 0.012, 0.3);
          const rank = seen.get(p.key) ?? 0;
          seen.set(p.key, rank + 1);
          const x0 = X0 + (i % COLS) * GX;
          const y0 = Y0 + Math.floor(i / COLS) * GY;
          // 飞向本组的结果卡：先到的压在下面，最后一块正好落在卡片中间
          const fly = easeInOut(clamp01((t - (tC + (i / paths.length) * 0.55)) / 0.62));
          const tx = cardX(g) + cardW / 2 - CW / 2 + (rnd(i) - 0.5) * 60 * (1 - rank / count[g]);
          const ty = cardY + 120 + (rnd(i + 7) - 0.5) * 70 * (1 - rank / count[g]);
          const x = lerp(x0, tx, fly);
          const y = lerp(y0, ty, fly) - Math.sin(fly * Math.PI) * (60 + rnd(i + 3) * 80);
          const gone = ramp(t, tD - 0.05, 0.25);
          const c = GROUP[g];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: CW,
                height: CH,
                borderRadius: 6,
                fontFamily: FONT.mono,
                fontSize: 12.5,
                lineHeight: `${CH}px`,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                color: tint > 0.5 ? '#fff' : 'rgba(238,241,255,0.78)',
                background: tint > 0 ? `color-mix(in srgb, ${c} ${Math.round(tint * 34)}%, rgba(255,255,255,0.06))` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${tint > 0 ? `color-mix(in srgb, ${c} ${Math.round(tint * 100)}%, rgba(255,255,255,0.12))` : 'rgba(255,255,255,0.12)'}`,
                opacity: appear * (1 - gone),
                transform: `scale(${(0.6 + 0.4 * appear) * (1 - 0.25 * fly)})`,
              }}
            >
              {p.exp}
            </div>
          );
        })}

        {/* 四张结果卡 */}
        {order.map((k, g) => {
          const s = springAt(t - tD - g * 0.08, 16, 0.55);
          if (t < tD) return null;
          const c = GROUP[g];
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: cardX(g),
                top: cardY,
                width: cardW,
                height: 300,
                borderRadius: 24,
                background: `linear-gradient(160deg, color-mix(in srgb, ${c} 26%, #1d2250) 0%, #161a3d 100%)`,
                border: `1.5px solid ${c}`,
                boxShadow: `0 0 0 6px ${c}22, 0 24px 60px rgba(0,0,0,0.35)`,
                padding: '30px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: clamp01((t - tD - g * 0.08) / 0.1),
                transform: `scale(${0.8 + 0.2 * s})`,
                color: '#eef1ff',
              }}
            >
              <div style={{ fontFamily: FONT.mono, fontSize: 30, fontWeight: 600, lineHeight: 1.3 }}>{solutions[g] ?? firstExp[g]}</div>
              <div>
                <div style={{ fontFamily: FONT.mono, fontSize: 15, color: c, wordBreak: 'break-all', lineHeight: 1.45 }}>{k}</div>
                <div style={{ marginTop: 16, fontFamily: FONT.sans, fontSize: 22, color: 'rgba(238,241,255,0.6)' }}>
                  合并了 <span style={{ fontFamily: FONT.display, fontWeight: 700, color: '#fff' }}>{count[g]}</span> 条路径
                </div>
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 778,
            textAlign: 'center',
            fontFamily: FONT.sans,
            fontSize: 30,
            color: 'rgba(238,241,255,0.72)',
            opacity: ramp(t, tD + 0.45, 0.4),
          }}
        >
          3 × 4 和 4 × 3、(1 + 2) + 3 和 1 + (2 + 3) —— 只留一个
        </div>
      </Overlay>
    </AbsoluteFill>
  );
};
