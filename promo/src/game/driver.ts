/**
 * 按帧驱动 iframe 里的游戏本体。
 *
 * iframe 里跑的是仓库根目录原封不动的 index.html + style.css + script.js。
 * 这里不重画任何界面，只做两件事：
 *   1. 把游戏状态（App.state）设成这一帧该有的样子，然后调用游戏自己的渲染函数
 *      （renderCards / updateText / updateHUD / showSettlement / calculate / showHistory …）；
 *   2. 把游戏里依赖「运行时」的东西换成按帧给值：CSS transition 全部关掉，
 *      屏幕淡入淡出、调色板展开、倒计时条、拖拽位置都由时间 t 直接算出来。
 *
 * 每一帧都从头把状态设一遍（幂等），所以 Remotion 以任何顺序、在任何标签页渲染哪一帧，
 * 画面都一样。
 */
import type { Anchor, CursorKey, GameSnap, ScreenId } from './types';
import { clamp01, easeInOut, easeOut, lerp } from '../lib/motion';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type GameApi = {
  win: any;
  doc: Document;
  App: any;
  Fraction: any;
};

const SCREENS: ScreenId[] = ['home', 'game', 'settlement', 'calculator', 'settings', 'help', 'history'];
const CARD_W = 80;
const CARD_H = 110;

export function attach(iframe: HTMLIFrameElement): GameApi {
  const win = iframe.contentWindow as any;
  const doc = iframe.contentDocument as Document;
  // script.js 顶层是 const / class，不挂在 window 上；在 iframe 的全局作用域里 eval 才拿得到
  const { App, Fraction } = win.eval('({ App, Fraction })');

  let css = '*, *::before, *::after { transition: none !important; }\n';
  // 游戏自己的 :hover / :active 规则原样复制一份，挂到 .__hover / .__active 上，
  // 这样「指针悬停在按钮上」的样子就是 style.css 写的那个样子
  for (const sheet of Array.from(doc.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules) as any[]) {
      if (typeof rule.selectorText === 'string' && /:(hover|active)\b/.test(rule.selectorText)) {
        css += rule.cssText.replace(/:hover\b/g, '.__hover').replace(/:active\b/g, '.__active') + '\n';
      }
    }
  }
  const style = doc.createElement('style');
  style.id = '__promo';
  style.textContent = css;
  doc.head.appendChild(style);
  return { win, doc, App, Fraction };
}

const byId = <T extends HTMLElement = HTMLElement>(doc: Document, id: string) => doc.getElementById(id) as T;

/** 卡槽 n 里那张卡的中心：与 App.renderCards 的居中算法一致 */
function slotCenter(doc: Document, n: number) {
  const slot = doc.querySelectorAll<HTMLElement>('.card-slot')[n];
  const area = byId(doc, 'game-area').getBoundingClientRect();
  const left = slot.offsetLeft + (slot.offsetWidth - CARD_W) / 2;
  const top = slot.offsetTop + (slot.offsetHeight - CARD_H) / 2;
  return { x: area.left + left + CARD_W / 2, y: area.top + top + CARD_H / 2 };
}

export function resolve(doc: Document, a: Anchor) {
  if ('x' in a) return { x: a.x, y: a.y };
  const base =
    'slot' in a
      ? slotCenter(doc, a.slot)
      : (() => {
          const el = doc.querySelector(a.sel);
          if (!el) throw new Error(`找不到 ${a.sel}`);
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })();
  return { x: base.x + (a.dx ?? 0), y: base.y + (a.dy ?? 0) };
}

const MOVE = 0.38;

/** 指针位置：关键帧之间用 easeInOut 移动，移动在到达时刻前 dur 秒开始 */
export function cursorAt(doc: Document, path: CursorKey[], t: number) {
  let p = resolve(doc, path[0].to);
  for (let i = 1; i < path.length; i++) {
    const k = path[i];
    const dur = k.dur ?? MOVE;
    if (t >= k.at) {
      p = resolve(doc, k.to);
      continue;
    }
    if (t > k.at - dur) {
      const q = resolve(doc, k.to);
      const e = easeInOut(clamp01((t - (k.at - dur)) / dur));
      p = { x: lerp(p.x, q.x, e), y: lerp(p.y, q.y, e) };
    }
    break;
  }
  return p;
}

export function apply(api: GameApi, s: GameSnap, cursorEl?: HTMLElement | null) {
  const { doc, App, Fraction } = api;
  const st = App.state;
  const t = s.t;

  // ---- 主题 / 语言 / 设置 ----
  if (s.theme === 'glass') doc.body.removeAttribute('data-theme');
  else doc.body.setAttribute('data-theme', s.theme);
  st.lang = s.lang;
  App.updateText();
  st.cardStyle = s.cardStyle;
  st.allowNoSolution = s.allowNoSolution;
  byId<HTMLSelectElement>(doc, 'setting-lang').value = s.lang;
  byId<HTMLSelectElement>(doc, 'setting-style').value = s.cardStyle;
  byId<HTMLInputElement>(doc, 'setting-no-sol').checked = s.allowNoSolution;

  // ---- 调色板菜单（原本 0.2s transition） ----
  App.renderPalette();
  const pm = byId(doc, 'palette-menu');
  pm.classList.toggle('show', s.palette > 0.001);
  pm.style.opacity = String(s.palette);
  pm.style.transform = `translateY(${-10 * (1 - s.palette)}px)`;

  // ---- HUD / 运算键 / 倒计时 ----
  st.stamina = s.stamina;
  st.streak = s.streak;
  App.updateHUD();
  st.activeOp = s.activeOp;
  App.updateOpIndicator();
  byId(doc, 'timer-bar').style.width = `${clamp01(s.timer) * 100}%`;

  // ---- 卡片 ----
  st.levelNums = s.levelNums.slice();
  st.currentCards = s.cards.map((c) => ({ id: c.id, val: new Fraction(c.n, c.d), slot: c.slot }));
  App.renderCards();
  if (s.highlight) {
    for (const id of s.highlight.ids) {
      const el = doc.querySelector<HTMLElement>(`.card[data-id="${id}"]`);
      if (!el) continue;
      el.classList.add('highlighted');
      // @keyframes pulse 是 CSS 动画：暂停后直接拨到这一帧该在的位置
      for (const a of el.getAnimations()) {
        a.pause();
        a.currentTime = Math.max(0, t - s.highlight.since) * 1000;
      }
    }
  }

  // ---- 结算 / 计算器 / 记录：调游戏自己的函数生成内容 ----
  if (s.settlement) {
    const z = s.settlement;
    st.levelSolutions = z.solutions.map((exp) => ({ exp }));
    st.streak = z.streak;
    st.history = z.history.slice(); // showSettlement 会往里 push 本局
    App.showSettlement(z.success, z.msg ?? '');
  } else {
    // 回到 index.html 的初始内容：结算层的布局（按钮位置）每帧都必须确定
    const title = byId(doc, 'settlement-title');
    title.textContent = 'Success!';
    title.style.color = '';
    byId(doc, 'settlement-content').innerHTML = '';
  }
  const inputs = [1, 2, 3, 4].map((i) => byId<HTMLInputElement>(doc, `calc-n${i}`));
  inputs.forEach((el, i) => (el.value = s.calc?.inputs[i] ?? ''));
  if (s.calc?.solved) App.calculate();
  else byId(doc, 'calc-output').innerHTML = '';
  if (s.history) {
    st.history = s.history.slice();
    App.showHistory();
  } else {
    byId(doc, 'history-list').innerHTML = '';
  }

  // ---- toast（提示扣体力时那条；游戏里 3s 后自己消失，这里按帧给透明度） ----
  syncToast(doc, s, t);

  // ---- 屏幕可见性（放在最后：上面的 show* 函数会改 .active） ----
  for (const n of SCREENS) {
    const el = byId(doc, `screen-${n}`);
    const o = clamp01(s.screens[n] ?? 0);
    el.classList.toggle('active', o > 0.001);
    el.style.opacity = String(o);
  }

  // ---- 悬停 / 按下 ----
  doc.querySelectorAll('.__hover, .__active').forEach((el) => el.classList.remove('__hover', '__active'));
  if (s.hover) doc.querySelector(s.hover)?.classList.add('__hover');
  if (s.press) doc.querySelector(s.press)?.classList.add('__hover', '__active');

  // ---- 指针与拖拽 ----
  const path = s.cursor;
  const cur = path?.length ? cursorAt(doc, path, t) : null;
  let down = false;
  if (s.drag && cur && path && t >= s.drag.from && t < s.drag.to) {
    const el = doc.querySelector<HTMLElement>(`.card[data-id="${s.drag.id}"]`);
    if (el) {
      const grab = cursorAt(doc, path, s.drag.from);
      el.style.left = `${parseFloat(el.style.left) + cur.x - grab.x}px`;
      el.style.top = `${parseFloat(el.style.top) + cur.y - grab.y}px`;
      el.classList.add('dragging');
      // .card 原本 transform 0.1s 过渡到 .dragging 的 scale(1.1)
      el.style.transform = `scale(${1 + 0.1 * easeOut(clamp01((t - s.drag.from) / 0.1))})`;
      App.checkOverlapHighlight(el);
      down = true;
    }
  }
  if (cursorEl) drawCursor(doc, cursorEl, path, cur, down, t);
}

/** 指针层：箭头 + 按下时的圆点 + 点击涟漪（坐标与 iframe 视口一致） */
function drawCursor(
  doc: Document,
  el: HTMLElement,
  path: CursorKey[] | undefined,
  cur: { x: number; y: number } | null,
  dragging: boolean,
  t: number,
) {
  const arrow = el.querySelector<HTMLElement>('[data-arrow]')!;
  const dot = el.querySelector<HTMLElement>('[data-dot]')!;
  const ring = el.querySelector<HTMLElement>('[data-ring]')!;
  if (!cur || !path) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  const click = [...path].reverse().find((k) => k.click && t >= k.at && t < k.at + 0.5);
  const pressing = dragging || (!!click && t < click.at + 0.14);
  arrow.style.transform = `translate(${cur.x - 3}px, ${cur.y - 2}px) scale(${pressing ? 0.9 : 1})`;
  dot.style.transform = `translate(${cur.x - 14}px, ${cur.y - 14}px)`;
  dot.style.opacity = pressing ? '1' : '0';
  if (click) {
    const p = (t - click.at) / 0.5;
    const c = resolve(doc, click.to);
    ring.style.opacity = String((1 - p) * 0.9);
    ring.style.transform = `translate(${c.x - 24}px, ${c.y - 24}px) scale(${0.35 + easeOut(p) * 1.15})`;
  } else {
    ring.style.opacity = '0';
  }
}

const TOAST_ICON: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

/** 顶部 toast：容器和卡片各留一份，内容按 snap 更新，进出场用时间算（CSS transition 已关） */
function syncToast(doc: Document, s: GameSnap, t: number) {
  const host = (doc.getElementById('app-container') ?? doc.body) as HTMLElement;
  let box = doc.getElementById('toast-container') as HTMLElement | null;
  let el = doc.getElementById('__promo_toast') as HTMLElement | null;
  if (!s.toast) {
    if (el) el.remove();
    if (box && box.childElementCount === 0) box.remove();
    return;
  }
  const z = s.toast;
  // 游戏里 3s 后收起；这里让它在提示高亮结束时（2s）开始退场，正好接上第一步操作
  const dur = 1.75;
  if (!box || box.parentElement !== host) {
    box = doc.createElement('div');
    box.id = 'toast-container';
    host.appendChild(box);
  }
  if (!el) {
    el = doc.createElement('div');
    el.id = '__promo_toast';
    el.setAttribute('role', 'alert');
    el.innerHTML = '<span class="toast-icon"></span><span class="toast-message"></span>';
    box.appendChild(el);
  }
  el.className = `toast toast-${z.type}`;
  const icon = el.querySelector('.toast-icon') as HTMLElement;
  const msg = el.querySelector('.toast-message') as HTMLElement;
  if (icon.textContent !== TOAST_ICON[z.type]) icon.textContent = TOAST_ICON[z.type];
  if (msg.textContent !== z.text) msg.textContent = z.text;
  // 进场 .3s（toast.show 的 transition）、出场也 .3s；中间保持
  const inP = easeOut(clamp01((t - z.since) / 0.3));
  const outP = easeInOut(clamp01((t - z.since - dur) / 0.3));
  el.style.opacity = String(inP * (1 - outP));
  el.style.transform = `translateY(${(1 - inP) * -20 - outP * 20}px) scale(${0.95 + 0.05 * inP})`;
  el.style.pointerEvents = 'none';
  box.style.zIndex = '9999';
}
