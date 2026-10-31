// 审片用：只打包一次，按秒数抽若干帧出 PNG（默认 1080p）。
//   node script/stills.mjs 5.2 9.8 17.4          → out/stills/t05.20.png …
//   SCALE=1 node script/stills.mjs 17.4          → 4K 原尺寸
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const times = process.argv.slice(2).map(Number).filter((x) => !Number.isNaN(x));
if (!times.length) throw new Error('用法： node script/stills.mjs <秒> [<秒> …]');
const scale = Number(process.env.SCALE || 0.5);
const outDir = path.join(root, 'out/stills');
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
const composition = await selectComposition({ serveUrl, id: 'Points24', chromiumOptions: { gl: 'angle' } });
for (const s of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = path.join(outDir, `t${s.toFixed(2).padStart(5, '0')}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale, chromiumOptions: { gl: 'angle' }, overwrite: true });
  console.log(`→ ${path.relative(root, output)}  (frame ${frame})`);
}
