// 量游戏界面里各元素在 1920×1080 视口中的位置（CSS 像素），给机位和指针定点用。
//
// 用 Remotion 自带的 chrome-headless-shell 打开 public/game/index.html，走 CDP 执行脚本。
// 用法： node script/measure.mjs                    （先跑过 npm run sync）
//        node script/measure.mjs '#calc-output' …   （只量给定的选择器）
//        SCREEN=game node script/measure.mjs …       （先切到某一屏再量，game 屏会放上 3 8 3 8）
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openPage } from './lib/cdp.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const page = await openPage();
await page.goto(pathToFileURL(path.join(here, '../public/game/index.html')).href, 1500);

const sel = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      '#app-container', '#screen-home h1', '#screen-home p', '[data-t="start_game"]', '[data-t="calculator"]',
      '[title="Theme"]', '#palette-menu', '.theme-option', '#game-area', '.card-slot', '.status-bar', '.key-legend',
      '[data-t="claim_no_solution"]', '#screen-settlement > div', '[data-t="next_level"]', '[data-t="view_history"]',
      '.calc-grid', '#calc-n1', '#calc-n4', '[data-t="solve"]', '#calc-output', '#history-list', '[data-t="export_all"]',
      '[data-t="print_all"]', '#timer-bar-container',
    ];
const out = JSON.parse(
  await page.evaluate(`(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    const screen = ${JSON.stringify(process.env.SCREEN ?? '')};
    if (screen === 'game') {
      App.state.levelNums = [3, 8, 3, 8];
      App.state.currentCards = App.state.levelNums.map((n, i) => ({ id: i, val: new Fraction(n), slot: i }));
      App.showScreen('screen-game');
      App.renderCards();
    } else if (screen) {
      App.showScreen('screen-' + screen);
    }
    App.togglePalette();
    const out = {};
    for (const s of ${JSON.stringify(sel)}) out[s] = [...document.querySelectorAll(s)].map(r);
    return JSON.stringify(out);
  })()`),
);
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(32), v.map((b) => `[${b.join(',')}]`).join(' '));
page.close();
