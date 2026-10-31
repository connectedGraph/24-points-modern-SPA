import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { UI_H, UI_W } from '../lib/theme';

/**
 * 机位：页面上的 (x, y) 这一点放在画面正中，放大 k 倍（相对 1920×1080 的 CSS 像素）。
 * k = 1 且 (960, 540) 就是一台 1080p 浏览器原样铺满画面。
 */
export type Pose = { k: number; x: number; y: number };

export const pose = (k: number, x: number, y: number): Pose => ({ k, x, y });

export const lerpPose = (a: Pose, b: Pose, p: number): Pose => ({
  k: a.k * Math.pow(b.k / a.k, p), // 缩放按对数插值，推拉速度才均匀
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
});

export const Stage: React.FC<{
  pose: Pose;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ pose: p, children, style }) => {
  const { width } = useVideoConfig();
  const s = width / UI_W; // 4K = 2，1080p 预览 = 1
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: UI_W,
          height: UI_H,
          transformOrigin: '0 0',
          transform: `scale(${s}) translate(${UI_W / 2}px, ${UI_H / 2}px) scale(${p.k}) translate(${-p.x}px, ${-p.y}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** 叠字层：1920×1080 设计像素，整体按输出分辨率放大 */
export const Overlay: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { width } = useVideoConfig();
  const s = width / UI_W;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: UI_W,
          height: UI_H,
          transformOrigin: '0 0',
          transform: `scale(${s})`,
          ...style,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
