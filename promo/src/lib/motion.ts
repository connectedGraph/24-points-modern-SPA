import { Easing } from 'remotion';

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeSoft = Easing.bezier(0.33, 0, 0.15, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.9, 0.4);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** t 在 [a, a+dur] 上 0→1（秒），带缓动 */
export const ramp = (t: number, a: number, dur: number, ease: (x: number) => number = easeOut) =>
  ease(clamp01((t - a) / Math.max(1e-6, dur)));

/**
 * 欠阻尼弹簧的解析解：0→1，带一点过冲。不依赖帧序，任意时刻可直接求值。
 * k 越大越快，z 是阻尼比。
 */
export const springAt = (t: number, k = 16, z = 0.55) => {
  if (t <= 0) return 0;
  const wd = k * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * k * t) * (Math.cos(wd * t) + ((z * k) / wd) * Math.sin(wd * t));
};

/** 鼓点上的一次冲击：t0 时刻跳到 1，按指数衰减 */
export const punch = (t: number, t0: number, decay = 7) => (t < t0 ? 0 : Math.exp(-(t - t0) * decay));

/** 分段关键帧：[[t, v], ...]，段间按 ease 插值 */
export const keys = (t: number, ks: [number, number][], ease: (x: number) => number = easeInOut) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1] = ks[i];
    const [t0, v0] = ks[i - 1];
    if (t < t1) return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
  }
  return ks[ks.length - 1][1];
};
