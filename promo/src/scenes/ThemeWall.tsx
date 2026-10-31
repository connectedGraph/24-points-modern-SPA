import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GameFrame } from '../game/GameFrame';
import { Overlay } from '../components/Stage';
import { GLASS_BG } from './Hook';
import { CUT, WALL, wallSnap } from '../lib/story';
import { FONT, INK, THEME_ZH } from '../lib/theme';
import { clamp01, ramp, springAt } from '../lib/motion';

const VIEW = 640; // 每个实例的视口：600×600 的游戏窗口四周留 20px 页面底色
const TILE = 360;
const GAP_X = 40;
const GAP_Y = 30;
const LABEL = 44;
const GX = (1920 - (3 * TILE + 2 * GAP_X)) / 2;
const GY = 200;

const STYLE_EN: Record<string, string> = { modern: 'Modern', magic: 'Magic', colorful: 'Colorful' };
const THEME_EN: Record<string, string> = {
  glass: 'Glass',
  paper: 'Paper',
  bamboo: 'Bamboo',
  leather: 'Leather',
  dark: 'Dark',
  'simple-white': 'Plain White',
};

/** 主题墙：同一局、6 个真实实例并排，每个一套主题（3 个换了卡面） */
export const ThemeWall: React.FC<{ t: number }> = ({ t }) => {
  const e = t - CUT.wall;
  const zoom = 1.06 - 0.06 * ramp(t, CUT.wall, CUT.calc - CUT.wall, (x) => x);
  const head = ramp(e, 0, 0.35);
  return (
    <AbsoluteFill style={{ background: GLASS_BG }}>
      <Overlay>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '960px 600px' }}>
          <div
            style={{
              position: 'absolute',
              top: 78,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: FONT.sans,
              color: INK.glass.text,
              opacity: head,
              transform: `translateY(${(1 - head) * 16}px)`,
            }}
          >
            <span style={{ fontSize: 62, fontWeight: 700 }}>
              6 套主题 <span style={{ color: INK.glass.accent }}>×</span> 3 种卡面
            </span>
            <span style={{ fontSize: 28, color: INK.glass.soft, marginLeft: 28 }}>CSS 变量整套覆盖，切换不刷新</span>
          </div>
          {WALL.map((w, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const s = springAt(e - 0.06 - i * 0.07, 15, 0.6);
            const o = clamp01((e - 0.06 - i * 0.07) / 0.12);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: GX + col * (TILE + GAP_X),
                  top: GY + row * (TILE + LABEL + GAP_Y),
                  width: TILE,
                  opacity: o,
                  transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + 0.1 * s})`,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: TILE,
                    height: TILE,
                    borderRadius: 22,
                    overflow: 'hidden',
                    boxShadow: '0 18px 44px rgba(31,38,135,0.22), 0 0 0 1px rgba(255,255,255,0.6)',
                  }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, transform: `scale(${TILE / VIEW})`, transformOrigin: '0 0' }}>
                    <GameFrame snap={wallSnap(t, i)} width={VIEW} height={VIEW} />
                  </div>
                </div>
                <div
                  style={{
                    height: LABEL,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 12,
                    fontFamily: FONT.sans,
                    color: INK.glass.text,
                  }}
                >
                  <span style={{ fontFamily: FONT.display, fontSize: 25, fontWeight: 700 }}>{THEME_EN[w.theme]}</span>
                  <span style={{ fontSize: 21, color: INK.glass.soft }}>{THEME_ZH[w.theme]}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 19, fontWeight: 600, color: INK.glass.accent }}>
                    {STYLE_EN[w.style]} 卡面
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Overlay>
    </AbsoluteFill>
  );
};
