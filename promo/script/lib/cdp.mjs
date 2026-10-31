// 用 Remotion 自带的 chrome-headless-shell 开一个页面，走 CDP 执行脚本 / 截图。
// measure.mjs、ui-shots.mjs 共用。Node 24 自带 WebSocket，不需要 puppeteer。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const CHROME =
  process.env.CHROME ||
  path.join(here, '../../node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell');

export async function openPage({ width = 1920, height = 1080, scale = 1 } = {}) {
  if (!fs.existsSync(CHROME)) throw new Error(`找不到浏览器：${CHROME}（先 npx remotion browser ensure）`);
  const proc = spawn(CHROME, ['--headless', '--remote-debugging-port=0', `--window-size=${width},${height}`, '--hide-scrollbars', 'about:blank'], {
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
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  await send('Page.enable');

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  return {
    send,
    sleep,
    async goto(url, wait = 800) {
      await send('Page.navigate', { url });
      await sleep(wait);
    },
    /** 在页面里执行表达式，返回值（需可序列化）；页面里抛错会在这里抛出 */
    async evaluate(expression) {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? JSON.stringify(r.result.exceptionDetails));
      return r.result?.result?.value;
    },
    async screenshot(file, clip) {
      const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
    },
    close() {
      ws.close();
      proc.kill();
    },
  };
}
