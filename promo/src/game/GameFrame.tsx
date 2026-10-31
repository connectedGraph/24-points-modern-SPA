import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { apply, attach, type GameApi } from './driver';
import type { GameSnap } from './types';

/**
 * 一个真实的游戏实例：iframe 加载 public/game/index.html（= 仓库根目录的游戏本体）。
 * 每次渲染都把 snap 灌进去（见 driver.ts）。指针层画在 iframe 上面，坐标和 iframe 视口一致，
 * 所以放进 Stage 后会跟着机位一起缩放。
 *
 * 首帧要等 iframe 加载完、第一次 apply 做完才放行渲染（自己持有 delayRender）。
 */
export const GameFrame: React.FC<{
  snap: GameSnap;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({ snap, width = 1920, height = 1080, style }) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const api = useRef<GameApi | null>(null);
  const released = useRef(false);
  const [handle] = useState(() => delayRender('游戏 iframe 加载', { timeoutInMilliseconds: 60000 }));
  const [ready, setReady] = useState(false);

  const onLoad = useCallback(() => {
    api.current = attach(frame.current as HTMLIFrameElement);
    setReady(true);
  }, []);

  // Studio 里来回拖时间轴，可能在加载完之前就被卸载：别把 delayRender 留着
  useEffect(
    () => () => {
      if (!released.current) continueRender(handle);
    },
    [handle],
  );

  useLayoutEffect(() => {
    if (!ready || !api.current) return;
    apply(api.current, snap, cursor.current);
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  });

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden', ...style }}>
      <iframe
        ref={frame}
        src={staticFile('game/index.html')}
        onLoad={onLoad}
        title="24 Point"
        style={{ position: 'absolute', inset: 0, width, height, border: 0, display: 'block' }}
      />
      <div ref={cursor} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'none' }}>
        <div
          data-ring
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2.5px solid rgba(102,126,234,0.9)',
            transformOrigin: '24px 24px',
            opacity: 0,
          }}
        />
        <div
          data-dot
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(102,126,234,0.32)',
            border: '1.5px solid rgba(255,255,255,0.85)',
            opacity: 0,
          }}
        />
        <div
          data-arrow
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 26,
            height: 34,
            transformOrigin: '3px 2px',
            filter: 'drop-shadow(0 3px 4px rgba(20,30,60,0.35))',
          }}
        >
          <svg viewBox="0 0 22 30" width={26} height={34}>
            <path
              d="M2 1.4 L2 23.2 L8.1 17.2 L11.6 26.2 L15.4 24.6 L11.8 15.8 L20 15.8 Z"
              fill="#1f2638"
              stroke="#ffffff"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
