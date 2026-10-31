// 游戏界面回归截图：打开仓库根目录的 index.html（游戏本体），调游戏自己的函数切到各个画面，
// 逐张截 #app-container。另外把「错题导出」的 Markdown 和「全部打印」的整页 HTML 收下来，
// 打印页单独渲染成一张图。输出到 out/ui/。
//
// 用法： node script/ui-shots.mjs            （2 倍像素，看细节）
//        SCALE=1 node script/ui-shots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openPage } from './lib/cdp.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '../..');
const dst = path.join(here, '../out/ui');
fs.mkdirSync(dst, { recursive: true });
const scale = Number(process.env.SCALE ?? 2);

const page = await openPage({ scale });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href, 1200);

// 页面里准备一些工具：不启动计时器，直接摆状态
await page.evaluate(`(() => {
  window.__setLevel = (nums) => {
    App.state.levelNums = nums.slice();
    App.state.levelSolutions = Solver.solve(nums);
    App.state.currentCards = nums.map((n, i) => ({ id: i, val: new Fraction(n), slot: i }));
    App.state.penaltyPaid = false;
  };
  window.__history = [
    { q: '3,8,3,8', res: 'Win', success: true, sols: Solver.solve([3, 8, 3, 8]).map((s) => s.exp) },
    { q: '6,2,1,3', res: 'Win', success: true, sols: Solver.solve([6, 2, 1, 3]).map((s) => s.exp) },
    { q: '1,1,2,5', res: 'Win', success: true, sols: [] },
    { q: '1,2,7,7', res: 'Loss', success: false, sols: Solver.solve([1, 2, 7, 7]).map((s) => s.exp) },
  ];
  // 截图时不要过渡动画
  const st = document.createElement('style');
  st.textContent = '*, *::before, *::after { transition: none !important; animation-play-state: paused !important; }';
  document.head.appendChild(st);
  return true;
})()`);

const box = JSON.parse(
  await page.evaluate(`JSON.stringify((() => { const b = document.getElementById('app-container').getBoundingClientRect(); return { x: b.left - 24, y: b.top - 24, width: b.width + 48, height: b.height + 48 }; })())`),
);

const shots = {
  home: `App.showHome()`,
  settings: `App.showSettings()`,
  help: `App.showHelp()`,
  'game-hint': `__setLevel([3, 8, 3, 8]); App.state.stamina = 10; App.state.streak = 0; App.updateHUD(); App.showScreen('screen-game'); App.useHint()`,
  'game-fraction': `__setLevel([3, 8, 3, 8]);
    App.state.currentCards = [{ id: 100, val: new Fraction(8, 3), slot: 0 }, { id: 2, val: new Fraction(3), slot: 2 }, { id: 3, val: new Fraction(8), slot: 3 }];
    App.showScreen('screen-game'); App.renderCards()`,
  'game-fraction-magic': `document.body.setAttribute('data-theme', 'dark'); App.state.cardStyle = 'magic';
    App.state.currentCards = [{ id: 101, val: new Fraction(1, 3), slot: 0 }, { id: 3, val: new Fraction(8), slot: 3 }];
    App.showScreen('screen-game'); App.renderCards()`,
  'game-fraction-colorful': `document.body.removeAttribute('data-theme'); App.state.cardStyle = 'colorful';
    App.state.currentCards = [{ id: 100, val: new Fraction(8, 3), slot: 0 }, { id: 2, val: new Fraction(3), slot: 2 }, { id: 3, val: new Fraction(8), slot: 3 }];
    App.showScreen('screen-game'); App.renderCards(); App.state.cardStyle = 'modern'`,
  'settle-win': `__setLevel([3, 8, 3, 8]); App.state.history = []; App.state.streak = 1; App.state.stamina = 9; App.showScreen('screen-game'); App.renderCards(); App.showSettlement(true)`,
  'settle-timeout': `__setLevel([1, 2, 7, 7]); App.state.history = []; App.state.streak = 0; App.state.stamina = 7; App.showScreen('screen-game'); App.renderCards(); App.showSettlement(false, I18N.zh.timeout)`,
  calculator: `App.showCalculator(); [1, 2, 3, 4].forEach((n, i) => (document.getElementById('calc-n' + (i + 1)).value = n)); App.calculate()`,
  'calculator-hard': `App.showCalculator(); [3, 3, 8, 8].forEach((n, i) => (document.getElementById('calc-n' + (i + 1)).value = n)); App.calculate()`,
  history: `App.state.history = __history.slice(); App.showHistory()`,
};

for (const [name, js] of Object.entries(shots)) {
  // 上一张（提示那张）弹的 toast 游戏里 3s 后才消失，截图之间清掉，别串到下一张
  await page.evaluate(`(() => { document.querySelectorAll('.screen').forEach((e) => e.classList.remove('active')); document.getElementById('screen-settlement').classList.remove('active'); const tc = document.getElementById('toast-container'); if (tc) tc.remove(); ${js}; return true; })()`);
  await page.sleep(120);
  await page.screenshot(path.join(dst, `${name}.png`), box);
  console.log(`  ${name}.png`);
}

// 错题导出：拦下 Blob 和下载文件名
const md = JSON.parse(
  await page.evaluate(`(() => {
    let text = '', name = '';
    const B = window.Blob;
    window.Blob = function (parts) { text = parts.join(''); return new B(parts); };
    const ce = document.createElement.bind(document);
    document.createElement = (tag) => { const el = ce(tag); if (tag === 'a') el.click = () => (name = el.download); return el; };
    App.state.history = __history.slice();
    App.exportMarkdown('wrong');
    window.Blob = B; document.createElement = ce;
    return JSON.stringify({ text, name });
  })()`),
);
fs.writeFileSync(path.join(dst, 'export-wrong.md'), md.text);
console.log(`  export-wrong.md  (${md.name})`);

// 全部打印：拦下 window.open 写进去的整页 HTML，另存后单独渲染
const html = await page.evaluate(`(() => {
  let out = '';
  const o = window.open;
  window.open = () => ({ document: { write: (h) => (out += h), close() {} } });
  App.state.history = __history.slice();
  App.printCards('all');
  window.open = o;
  return out;
})()`);
const printFile = path.join(dst, 'print-all.html');
fs.writeFileSync(printFile, html.replace('<head>', '<head><script>window.print = function () {};</script>'));
await page.send('Emulation.setDeviceMetricsOverride', { width: 794, height: 1123, deviceScaleFactor: scale, mobile: false });
await page.goto(pathToFileURL(printFile).href, 900);
await page.screenshot(path.join(dst, 'print-all.png'));
console.log('  print-all.png');

page.close();
