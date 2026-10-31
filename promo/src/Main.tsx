import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GameFrame } from './game/GameFrame';
import { Overlay, Stage } from './components/Stage';
import { Panel, type Ink } from './components/Panel';
import { Keycaps, LangList, StyleRow, ThemeList, Trace } from './components/Widgets';
import { Hook, GLASS_BG, HOOK_END } from './scenes/Hook';
import { SolverScene } from './scenes/SolverScene';
import { ThemeWall } from './scenes/ThemeWall';
import { MarkdownCard, PrintSheet } from './scenes/PrintSheet';
import { Outro } from './scenes/Outro';
import { CALC_ZOOM, CUT, LANGS, M, P, T1, cycleAt, langAt, mainPose, mainSnap, sceneAt, type SceneId } from './lib/story';
import { FONT, INK } from './lib/theme';
import { ramp } from './lib/motion';
import type { GameSnap } from './game/types';
import data from './generated/solver.json';

/** 求解器输出的算式换成数学符号再上标题：* → ×、/ → ÷、- → − */
const pretty = (exp: string) => exp.replace(/\*/g, '×').replace(/\//g, '÷').replace(/ - /g, ' − ');

const traceOf = (steps: { trace: string }[], rel: number[]) => steps.map((s, i) => ({ at: rel[i], text: s.trace }));

const PlayBox: React.FC<{ t: number; snap: GameSnap; ink: Ink; lines: { at: number; text: string }[] }> = ({ t, snap, ink, lines }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 44 }}>
    <Keycaps active={snap.activeOp} ink={ink} />
    <div style={{ paddingTop: 4 }}>
      <Trace t={t} lines={lines} ink={ink} size={31} />
    </div>
  </div>
);

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
};

function panelFor(sc: SceneId, t: number, snap: GameSnap) {
  const ink = INK[snap.theme];
  switch (sc) {
    case 'home':
      return (
        <Panel
          t={t}
          from={CUT.home + 1.05}
          ink={ink}
          kicker="ZERO-DEPENDENCY SPA"
          title={['零依赖的', '现代 24 点']}
          body={'HTML + CSS + 原生 JavaScript\n双击 index.html 就能玩'}
        />
      );
    case 'play':
      return (
        <Panel t={t} from={CUT.play} ink={ink} kicker="PLAY · 玩法" title={['把卡片拖到卡片上', '按住 WASD 定运算']} titleSize={68}>
          <PlayBox t={t} snap={snap} ink={ink} lines={traceOf(M.hook.steps, T1.rel)} />
        </Panel>
      );
    case 'drop':
      return (
        <Panel
          t={t}
          from={CUT.drop}
          ink={ink}
          kicker="FRACTION ENGINE · 分数引擎"
          title={[pretty(P.hook.solutions[0]), <span key="eq" style={{ color: ink.accent }}>= 24</span>]}
          titleSize={70}
          body={'8/3、1/3 全程按分数精确计算\n不会冒出 23.999999'}
        />
      );
    case 'speed':
      return (
        <Panel t={t} from={CUT.speed} ink={ink} kicker="PLAY · 玩法" title={['熟练之后', '一拍一步']}>
          <PlayBox t={t} snap={snap} ink={ink} lines={traceOf(M.speed.steps, T1.srel)} />
        </Panel>
      );
    case 'themes':
      return (
        <Panel
          t={t}
          from={CUT.themes}
          ink={ink}
          kicker="THEMES · 主题"
          title={['6 套主题', '一键换装']}
          body={'调色板里点一下\n整套配色跟着 CSS 变量走'}
        />
      );
    case 'cycle': {
      const c = cycleAt(t);
      return (
        <Panel t={t} from={CUT.cycle} ink={ink} kicker="THEMES · 主题" title={['6 套主题', '3 种卡面']}>
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
            ink={ink}
            kicker="SOLVER · 计算器"
            title={['任意 4 个数', '解一次列全']}
            body={'计算器和出题用的是同一个求解器\n分数精确运算，重复的解只留一个'}
            exit={CALC_ZOOM.at}
          />
          <CalcNote t={t} ink={ink} />
        </>
      );
    case 'i18n':
      return (
        <Panel t={t} from={CUT.i18n} ink={ink} kicker="I18N · 多语言" title={['5 种语言', '随时切换']}>
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
          ink={ink}
          kicker="HISTORY · 记录"
          title={['每一局', '都有记录']}
          body={'导出 Markdown：全部 / 只导错题\n打印练习卡：全部 / 只打错题'}
        />
      );
    case 'export':
      return <MarkdownCard t={t} from={CUT.export} name={data.markdown.name} text={data.markdown.text} theme={snap.theme} />;
    case 'print':
      return <PrintSheet t={t} from={CUT.print} html={data.printHtml} theme={snap.theme} />;
    case 'outro':
      return <Outro t={t} />;
    default:
      return null;
  }
}

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sc = sceneAt(t);
  const snap = mainSnap(t);
  // 这三段是整幅的合成画面，主实例藏起来（不卸载，免得来回重载 iframe）
  const hideMain = sc === 'hook' || sc === 'wall' || sc === 'solver';

  return (
    <AbsoluteFill style={{ background: GLASS_BG }}>
      <Audio src={staticFile('music-60s.mp3')} />
      <Stage pose={mainPose(t)} style={{ visibility: hideMain ? 'hidden' : 'visible' }}>
        <GameFrame snap={snap} />
      </Stage>
      <Overlay>{panelFor(sc, t, snap)}</Overlay>
      {t < HOOK_END && <Hook t={t} nums={P.hook.nums} />}
      {sc === 'wall' && <ThemeWall t={t} />}
      {sc === 'solver' && <SolverScene t={t} paths={P.calc.paths!} solutions={P.calc.solutions} />}
    </AbsoluteFill>
  );
};
