// 量游戏界面里各元素在 1920×1080 视口中的位置（CSS 像素），给机位和指针定点用。
//
// 用 Remotion 自带的 chrome-headless-shell 打开 public/game/index.html，走 CDP 执行脚本。
// 用法： node script/measure.mjs            （先跑过 npm run sync）
//        CHROME=/path/to/chrome node script/measure.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const chrome =
  process.env.CHROME ||
  path.join(here, '../node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell');
const page = pathToFileURL(path.join(here, '../public/game/index.html')).href;
if (!fs.existsSync(chrome)) throw new Error(`找不到浏览器：${chrome}（先 npx remotion browser ensure）`);

const proc = spawn(chrome, ['--headless', '--remote-debugging-port=0', '--window-size=1920,1080', '--hide-scrollbars', 'about:blank'], {
  stdio: ['ignore', 'ignore', 'pipe'],
});
const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  proc.stderr.on('data', (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) res(m[1]);
  });
  setTimeout(() => rej(new Error('浏览器没起来')), 15000);
});
const port = new URL(wsUrl).port;
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
});
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url: page });
await new Promise((r) => setTimeout(r, 1500));

const expr = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
  const out = {};
  const sel = ${JSON.stringify(process.argv.slice(2).length ? process.argv.slice(2) : [
    '#app-container', '#screen-home h1', '#screen-home p', '[data-t="start_game"]', '[data-t="calculator"]',
    '[title="Theme"]', '#palette-menu', '.theme-option', '#game-area', '.card-slot', '.status-bar', '.key-legend',
    '[data-t="claim_no_solution"]', '#screen-settlement > div', '[data-t="next_level"]', '[data-t="view_history"]',
    '.calc-grid', '#calc-n1', '#calc-n4', '[data-t="solve"]', '#calc-output', '#history-list', '[data-t="export_all"]',
    '[data-t="print_all"]', '#timer-bar-container',
  ])};
  App.togglePalette();
  for (const s of sel) out[s] = [...document.querySelectorAll(s)].map(r);
  return JSON.stringify(out);
})()`;
const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
const out = JSON.parse(res.result.result.value);
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(32), v.map((b) => `[${b.join(',')}]`).join(' '));
ws.close();
proc.kill();
