// 用仓库里真实的 script.js 跑求解器，把片子要用的数字算出来写进 src/generated/solver.json。
//
// 片子里所有「解」「路径数」「哈希」都来自这里，不手写：
//   - solutions：Solver.solve() 的原样输出（exp 字段）
//   - paths：递归回溯里每一条算到 24 的路径（去重之前），带它的 formatAST 与 getHash
//
// 统计路径的办法是在源码副本里 `let key = getHash(ast);` 这一行后面插一句记录，
// 断言这一行恰好出现一次；源码改了导致插不进去就直接报错，不会悄悄算错。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '../../script.js'), 'utf8');
const HOOK = 'let key = getHash(ast);';
if (src.split(HOOK).length !== 2) throw new Error(`script.js 里找不到唯一的「${HOOK}」，求解器结构变了`);
const patched = src.replace(HOOK, `${HOOK} globalThis.__paths.push({ exp: formatAST(ast), key });`);

const ctx = vm.createContext({ window: {}, document: {}, console });
ctx.globalThis = ctx;
const { Solver, Fraction, App, I18N, THEMES } = vm.runInContext(`${patched}\n;({ Solver, Fraction, App, I18N, THEMES })`, ctx);

const run = (nums) => {
  ctx.__paths = [];
  const sols = Solver.solve(nums).map((s) => s.exp);
  return { nums, solutions: sols, paths: ctx.__paths.map((p) => ({ exp: p.exp, key: p.key })) };
};

// 片子里出现的每一道题（顺序 = 卡槽 0..3）
const PUZZLES = {
  hook: [3, 8, 3, 8],
  speed: [6, 2, 1, 3],
  noSolution: [1, 1, 2, 5],
  timeout: [1, 2, 7, 7],
  calc: [1, 2, 3, 4],
};

const out = { generatedFrom: 'script.js', puzzles: {} };
for (const [k, nums] of Object.entries(PUZZLES)) {
  const r = run(nums);
  out.puzzles[k] = {
    nums,
    solutions: r.solutions,
    pathCount: r.paths.length,
    // 去重镜头只要 calc 那题的全部路径；其余题只留数量
    paths: k === 'calc' ? r.paths : undefined,
  };
}
if (out.puzzles.noSolution.solutions.length !== 0) throw new Error('noSolution 那题其实有解');
if (out.puzzles.hook.solutions.length !== 1) throw new Error('hook 那题应该恰好一个解');

// 片子里演示的拖拽合并：drag 拖到 onto 上、按住 key。
// 规则照抄 App.performOp：w 乘、a 加、s 除（被拖的是被除数）、d 大减小；新卡占 onto 的卡槽。
// 运算本身用 script.js 的 Fraction，所以 8/3、1/3 这些分数卡上的字就是游戏会显示的字。
const MERGES = {
  hook: [
    { drag: 1, onto: 0, key: 's' },
    { drag: 2, onto: 100, key: 'd' },
    { drag: 3, onto: 101, key: 's' },
  ],
  speed: [
    { drag: 1, onto: 0, key: 'a' },
    { drag: 3, onto: 100, key: 'w' },
    { drag: 2, onto: 101, key: 'w' },
  ],
};
const SYM = { w: '×', a: '+', s: '÷', d: '−' };
const cardOut = (c) => ({ id: c.id, n: c.val.n, d: c.val.d, slot: c.slot, text: c.val.toString() });
out.merges = {};
for (const [k, steps] of Object.entries(MERGES)) {
  let cards = PUZZLES[k].map((n, i) => ({ id: i, val: new Fraction(n), slot: i }));
  const rows = [];
  steps.forEach((s, i) => {
    const c1 = cards.find((c) => c.id === s.drag);
    const c2 = cards.find((c) => c.id === s.onto);
    if (!c1 || !c2) throw new Error(`${k} 第 ${i + 1} 步找不到卡`);
    let res;
    if (s.key === 'w') res = c1.val.mul(c2.val);
    if (s.key === 'a') res = c1.val.add(c2.val);
    if (s.key === 's') res = c1.val.div(c2.val);
    if (s.key === 'd') res = c1.val.val() > c2.val.val() ? c1.val.sub(c2.val) : c2.val.sub(c1.val);
    // 算式的书写顺序：除法 = 被拖的 ÷ 目标；减法 = 大 − 小；加乘交换律无所谓，写成「目标 op 被拖的」
    const swap = s.key === 'd' ? c2.val.val() > c1.val.val() : s.key === 'a' || s.key === 'w';
    const [big, small] = swap ? [c2, c1] : [c1, c2];
    const id = 100 + i;
    cards = cards.filter((c) => c.id !== c1.id && c.id !== c2.id).concat([{ id, val: res, slot: c2.slot }]);
    rows.push({
      ...s,
      dragSlot: c1.slot,
      ontoSlot: c2.slot,
      result: res.toString(),
      trace: `${big.val.toString()} ${SYM[s.key]} ${small.val.toString()} = ${res.toString()}`,
      cardsAfter: cards.map(cardOut),
    });
  });
  const last = cards[cards.length - 1];
  if (cards.length !== 1 || last.val.n !== 24 * last.val.d) throw new Error(`${k} 的合并没有算到 24`);
  out.merges[k] = { start: PUZZLES[k].map((n, i) => cardOut({ id: i, val: new Fraction(n), slot: i })), steps: rows };
}

// 游戏记录：和 App.showSettlement 往 history 里 push 的结构一致
const P = out.puzzles;
out.history = [
  { q: P.hook.nums.join(','), res: 'Win', success: true, sols: P.hook.solutions },
  { q: P.speed.nums.join(','), res: 'Win', success: true, sols: P.speed.solutions },
  { q: P.noSolution.nums.join(','), res: 'Win', success: true, sols: P.noSolution.solutions },
  { q: P.timeout.nums.join(','), res: 'Loss', success: false, sols: P.timeout.solutions },
];

// 错题导出：调 App.exportMarkdown('wrong')，把它塞进 Blob 的 Markdown 和下载文件名收下来
// （Date.now 固定成 2026-10-31 00:00 UTC，文件名才每次一样）
let md = '';
let mdName = '';
ctx.Blob = class {
  constructor(parts) {
    md = parts.join('');
  }
};
ctx.URL = { createObjectURL: () => 'blob:promo' };
ctx.document = {
  createElement: () => ({ click() {}, set download(v) { mdName = v; } }),
  body: { appendChild() {}, removeChild() {} },
};
vm.runInContext('Date.now = () => 1793404800000;', ctx);
App.state.history = out.history;
App.exportMarkdown('wrong');
if (!md.startsWith('# 24 Point Game History')) throw new Error('exportMarkdown 没有产出 Markdown');
out.markdown = { name: mdName, text: md };

// 打印页：直接调 App.printCards('all')，把它 window.open 出来写进去的整页 HTML 收下来
let printed = '';
ctx.window.open = () => ({ document: { write: (h) => (printed += h), close: () => {} } });
App.state.history = out.history;
App.printCards('all');
if (!printed.includes('print-card')) throw new Error('printCards 没有产出打印页');
out.printHtml = printed;

out.themes = THEMES.map((t) => ({ id: t.id, name: t.name, dot: t.vars['--bg-body'] || '#a1c4fd' }));
out.langs = Object.keys(I18N).map((k) => ({ id: k, start: I18N[k].start_game, intro: I18N[k].introduction }));

const dst = path.join(here, '../src/generated/solver.json');
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, JSON.stringify(out, null, 1) + '\n');
for (const [k, p] of Object.entries(out.puzzles)) {
  console.log(`  ${k.padEnd(10)} [${p.nums}]  唯一解 ${p.solutions.length}  路径 ${p.pathCount}  ${p.solutions[0] ?? '无解'}`);
}
console.log(`→ ${path.relative(process.cwd(), dst)}`);
