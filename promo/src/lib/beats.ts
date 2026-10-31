/**
 * 时间轴：60.0 秒 @60fps = 3600 帧，配乐取 wenever.mp3 的前 60 秒。
 *
 * 112.906 BPM，1 拍 = 0.531415s，1 小节 = 2.12566s，第 0 拍在 -0.11789s。
 * 这套网格和 steam-lite-730-promo 用的是同一首歌、同一组数；这次又拿全频
 * 频谱通量的前 40 个最强起音点核对过：33/40 落在拍点 ±40ms 以内。
 * 16.887s（第 32 拍 / 第 8 小节）是前 60 秒里最强的 drop。
 */
export const FPS = 60;
export const TOTAL_SECONDS = 60;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

export const BEAT = 60 / 112.906;
export const BAR = BEAT * 4;
export const BEAT0 = -0.11789;

/** 第 n 拍的绝对秒（可以是小数拍） */
export const beat = (n: number) => BEAT0 + n * BEAT;
/** 第 n 小节的绝对秒 */
export const bar = (n: number) => beat(n * 4);

export const DROP = beat(32);
