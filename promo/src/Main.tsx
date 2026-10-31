import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GameFrame } from './game/GameFrame';
import { Overlay, Stage } from './components/Stage';
import { Panel, type Ink } from './components/Panel';
import { Keycaps, LangList, StyleRow, ThemeList, Trace } from './components/Widgets';
import { Math as MathML, MATH_FONT } from './components/Math';
import { Hook, GLASS_BG, HOOK_END } from './scenes/Hook';
import { SolverScene } from './scenes/SolverScene';
import { ThemeWall } from './scenes/ThemeWall';
import { MarkdownCard, PrintSheet } from './scenes/PrintSheet';
import { Outro } from './scenes/Outro';
import {
  CALC_ZOOM, CUT, LANGS, M, P, T1, cycleAt, fullFrame, langAt, mainPose, mainSnap, prevScene, sceneAt, type SceneId,
} from './lib/story';
import { FONT, INK } from './lib/theme';
import { beat as b } from './lib/beats';
import { clamp01, easeOut, ramp } from './lib/motion';
import type { GameSnap } from './game/types';
import data from './generated/solver.json';

/** 合并记录：左式与结果都用 MathML 排（分数是上下两层，和游戏里同一种字形） */
const traceOf = (steps: { trace: string; traceMath: string[] }[], rel: number[]) =>
  steps.map((s, i) => ({ at: rel[i], text: s.trace, math: s.traceMath as [string, string] }));

const PlayBox: React.FC<{ t: number; snap: GameSnap; ink: Ink; lines: { at: number; text: string; math?: [string, string] }[] }> = ({
  t,
  snap,
  ink,
  lines,
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40 }}>
    <Keycaps active={snap.activeOp} ink={ink} />
    <div style={{ paddingTop: 6 }}>
      <Trace t={t} lines={lines} ink={ink} size={40} />
    </div>
  </div>
);

/** 提示那一段的小图：两张待算的牌（和游戏里 .card.highlighted 的橙框脉冲同一套色） */
const HintArt: React.FC<{ p: number; ink: Ink }> = ({ p, ink }) => {
  const pulse = 0.5 + 0.5 * Math.sin(p * 6);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: clamp01(p * 2) }}>
      {['8', '3'].map((v, i) => (
        <div
          key={v}
          style={{
            width: 96,
            height: 132,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.92)',
            border: `3px solid #F59E0B`,
            boxShadow: `0 0 0 ${4 + 10 * pulse}px rgba(245,158,11,${0.28 - 0.12 * pulse})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
            fontSize: 48,
            fontWeight: 700,
            color: ink.text,
            transform: `scale(${1 + 0.04 * pulse})`,
          }}
        >
          {v}
        </div>
      ))}
      <div style={{ marginLeft: 10, fontFamily: FONT.sans, fontSize: 27, color: ink.soft, lineHeight: 1.5, width: 300 }}>
        先算这两张
        <br />
        体力 −1，每关只扣一次
      </div>
    </div>
  );
};

/**
 * 计算器推近之后，结果列表右边的注：位置按 CALC_ZOOM 机位下列表的屏幕坐标摆
 * （列表文字在页面 x 691~871、y 481~565，放大 2.2 倍后落在屏幕 x 500~900、y 454~640）。
 */
const CalcNote: React.FC<{ t: number; ink: Ink }> = ({ t, ink }) => {
  const p = ramp(t, CALC_ZOOM.at + CALC_ZOOM.dur - 0.25, 0.45);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 1000,
        top: 462,
        fontFamily: FONT.sans,
        color: ink.text,
        opacity: p,
        transform: `translateX(${(1 - p) * 24}px)`,
      }}
    >
      <div style={{ fontSize: 46, fontWeight: 700 }}>
        <span style={{ color: ink.accent }}>←</span> 4 个本质不同的解
      </div>
      <div style={{ marginTop: 14, fontSize: 28, color: ink.soft }}>可它背后，是 292 条递归路径</div>
    </div>
  );
}

function panelFor(sc: SceneId, t: number, snap: GameSnap, exit?: number) {
  const ink = INK[snap.theme];
  switch (sc) {
    case 'home':
      return (
        <Panel
          t={t}
          from={CUT.home + 1.05}
          exit={exit}
          ink={ink}
          kicker="ZERO-DEPENDENCY SPA"
          title={['零依赖的', '现代 24 点']}
          body={'HTML + CSS + 原生 JavaScript\n双击 index.html 就能玩'}
        />
      );
    // 提示：先卡住，点 💡 高亮该先算的两张牌；提示完再切到玩法那一段
    case 'play': {
      // 提示段先退干净（0.3s），玩法段再进，两个 Panel 不叠在一起
      const HINT_OUT = CUT.play + 1.72;
      const PLAY_IN = HINT_OUT + 0.1;
      if (t >= PLAY_IN) {
        return (
          <Panel
            t={t}
            from={PLAY_IN}
            exit={exit}
            ink={ink}
            kicker="PLAY · 玩法"
            title={['把卡片拖到卡片上', '按住 WASD 定运算']}
            titleSize={68}
          >
            <PlayBox t={t} snap={snap} ink={ink} lines={traceOf(M.hook.steps, T1.rel)} />
          </Panel>
        );
      }
      return (
        <>
          <Panel
            t={t}
            from={CUT.play}
            exit={Math.min(HINT_OUT, exit ?? Infinity)}
            ink={ink}
            kicker="HINT · 提示"
            title={['卡住了就点 💡', '先算哪两张']}
            titleSize={66}
            body={'参考解里最先该做的那一步\n直接高亮在牌面上'}
          >
            <HintArt p={t - CUT.play - 0.15} ink={ink} />
          </Panel>
          {t >= PLAY_IN && (
            <Panel
              t={t}
              from={PLAY_IN}
              exit={exit}
              ink={ink}
              kicker="PLAY · 玩法"
              title={['把卡片拖到卡片上', '按住 WASD 定运算']}
              titleSize={68}
            >
              <PlayBox t={t} snap={snap} ink={ink} lines={traceOf(M.hook.steps, T1.rel)} />
            </Panel>
          )}
        </>
      );
    }
    case 'drop':
      return (
        <Panel
          t={t}
          from={CUT.drop}
          exit={exit}
          ink={ink}
          kicker="FRACTION ENGINE · 分数引擎"
          title={['分数精确运算', '一步都不丢精度']}
          titleSize={66}
          hero={
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, color: ink.text }}>
              <MathML html={P.hook.solutionsMath[0]} size={54} color={ink.text} />
              <span style={{ fontFamily: FONT.display, fontSize: 62, fontWeight: 500, color: ink.soft }}>=</span>
              <span style={{ fontFamily: FONT.display, fontSize: 76, fontWeight: 800, color: ink.accent }}>24</span>
            </div>
          }
          body={'8/3、1/3 全程按分数存\n不会冒出 23.999999'}
        />
      );
    case 'speed':
      return (
        <Panel
          t={t}
          from={CUT.speed}
          exit={exit}
          ink={ink}
          kicker="PLAY · 玩法"
          title={['熟练之后', '一拍一步']}
        >
          <PlayBox t={t} snap={snap} ink={ink} lines={traceOf(M.speed.steps, T1.srel)} />
        </Panel>
      );
    case 'themes':
      return (
        <Panel
          t={t}
          from={CUT.themes}
          exit={exit}
          ink={ink}
          kicker="THEMES · 主题"
          title={['6 套主题', '一键换装']}
          body={'调色板里点一下\n整套配色跟着 CSS 变量走'}
        />
      );
    case 'cycle': {
      const c = cycleAt(t);
      return (
        <Panel t={t} from={CUT.cycle} exit={exit} ink={ink} kicker="THEMES · 主题" title={['6 套主题', '3 种卡面']}>
          <ThemeList themes={data.themes} active={c.theme} ink={ink} />
          <div style={{ height: 34 }} />
          <StyleRow active={c.style} ink={ink} />
        </Panel>
      );
    }
    case 'calc':
      return (
        <>
          <Panel
            t={t}
            from={CUT.calc}
            exit={exit ?? CALC_ZOOM.at}
            ink={ink}
            kicker="SOLVER · 计算器"
            title={['任意 4 个数', '解一次列全']}
            body={'计算器和出题用的是同一个求解器\n分数精确运算，重复的解只留一个'}
          />
          <CalcNote t={t} ink={ink} />
        </>
      );
    case 'i18n':
      return (
        <Panel t={t} from={CUT.i18n} exit={exit} ink={ink} kicker="I18N · 多语言" title={['5 种语言', '随时切换']}>
          <LangList
            langs={LANGS.map((l) => ({ id: l.lang, label: l.label, start: data.langs.find((x) => x.id === l.lang)!.start }))}
            active={langAt(t).lang}
            ink={ink}
          />
        </Panel>
      );
    case 'rules':
      return (
        <Panel
          t={t}
          from={CUT.rules}
          exit={exit}
          ink={ink}
          kicker="RULES · 规则"
          title={['遇到无解题', '点「声明无解」']}
          body={'1 1 2 5 怎么算都到不了 24\n判断对了，一样算赢'}
        />
      );
    case 'timeout':
      return (
        <Panel
          t={t}
          from={CUT.timeout}
          exit={exit}
          ink={ink}
          kicker="RULES · 规则"
          title={['30 秒倒计时', '超时给参考解']}
          body={'体力 10 点：超时 −2，用提示 −1\n体力耗尽，这一轮结束'}
        />
      );
    case 'history':
      return (
        <Panel
          t={t}
          from={CUT.history}
          exit={exit}
          ink={ink}
          kicker="HISTORY · 记录"
          title={['每一局', '都有记录']}
          body={'导出 Markdown：全部 / 只导错题\n打印练习卡：全部 / 只打错题'}
        />
      );
    case 'export':
      return (
        <MarkdownCard
          t={t}
          from={CUT.export}
          name={data.markdown.name}
          text={data.markdown.text}
          math={data.markdown.math as Record<string, string>}
          theme={snap.theme}
        />
      );
    case 'print':
      return <PrintSheet t={t} from={CUT.print} html={data.printHtml} theme={snap.theme} />;
    case 'outro':
      return <Outro t={t} />;
    default:
      return null;
  }
}

/** 整幅合成画面（开场 / 主题墙 / 求解器）的进出场：两头都淡，不硬切 */
const FULL_OUT: Record<string, number> = { wall: 0.42, solver: 0.42 };
const FULL_IN: Record<string, number> = { wall: 0.34, solver: 0.34 };
function fullOpacity(sc: SceneId, t: number) {
  if (!fullFrame(sc)) return 0;
  if (sc === 'hook') return 1; // 开场从 0 秒就在，只在切到主页时淡出
  const start = CUT[sc];
  const end = CUT[ORDER_NEXT[sc]];
  // 从切点前 0.06s 开始进（和游戏画面的溶解差半拍，别让两层字重叠）
  const a = ramp(t, start - 0.06, FULL_IN[sc]);
  const b = 1 - ramp(t, end - FULL_OUT[sc], FULL_OUT[sc]);
  return Math.min(a, b);
}
const ORDER_NEXT: Record<string, keyof typeof CUT> = {
  hook: 'home',
  wall: 'calc',
  solver: 'i18n',
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sc = sceneAt(t);
  const snap = mainSnap(t);
  const prev = prevScene(sc);

  // 三个整幅画面（开场 / 主题墙 / 求解器）：自己的不透明度 × 反过来给游戏窗口，
  // 两层交叉溶解 —— 任何一帧画面都是「实」的，不会出现两层半透明糊在一起，也不会空一下
  // 开场：四张牌在 b7.5 起就往前推、同时化掉，主页从近景往外拉，两边接上
  const hookOp = 1 - ramp(t, HOOK_END - 0.16, 0.16);
  const wallOp = fullOpacity('wall', t);
  const solverOp = fullOpacity('solver', t);
  const cover = t < HOOK_END + 0.02 ? hookOp : t >= CUT.wall - 0.02 && t < CUT.calc + 0.42 ? wallOp : t >= CUT.solver - 0.02 && t < CUT.i18n + 0.42 ? solverOp : 0;
  const gameOp = clamp01(1 - cover);
  // 上一个镜头的叠字：切点前 0.26s 内退干净，和下一段错开，不糊在一起
  const prevOut = prev ? 1 - ramp(t, CUT[sc] - 0.26, 0.22, easeOut) : 0;

  return (
    <AbsoluteFill style={{ background: GLASS_BG }}>
      <Audio src={staticFile('music-60s.mp3')} />
      <Stage pose={mainPose(t)} style={{ opacity: gameOp, visibility: gameOp < 0.004 ? 'hidden' : 'visible' }}>
        <GameFrame snap={snap} />
      </Stage>
      <Overlay>
        {prev && !fullFrame(prev) && prevOut > 0.001 && (
          <div style={{ position: 'absolute', inset: 0, opacity: prevOut, transform: `translateX(${(1 - prevOut) * -26}px)` }}>
            {panelFor(prev, t, snap)}
          </div>
        )}
        {panelFor(sc, t, snap)}
      </Overlay>
      {t < HOOK_END + 0.42 && (
        <AbsoluteFill style={{ opacity: hookOp }}>
          <Hook t={t} nums={P.hook.nums} />
        </AbsoluteFill>
      )}
      {t >= CUT.wall - 0.02 && t < CUT.calc + 0.42 && wallOp > 0.001 && (
        <AbsoluteFill style={{ opacity: wallOp }}>
          <ThemeWall t={t} />
        </AbsoluteFill>
      )}
      {t >= CUT.solver - 0.02 && t < CUT.i18n + 0.42 && solverOp > 0.001 && (
        <AbsoluteFill style={{ opacity: solverOp }}>
          <SolverScene t={t} paths={P.calc.paths!} solutions={P.calc.solutions} solutionsMath={P.calc.solutionsMath} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
