// 공용 UI 헬퍼 (HTML 문자열 생성)

import { ASSETS, avatarSrc } from './assets.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const fmtScore = (n) => (n > 0 ? `+${n}` : String(n));

// ── 에셋 자리표시 ──
// 이미지가 로드되면 표시, 없으면(404) 자리표시 유지. 재렌더 때 같은 404를 반복 요청하지 않도록 기억한다.
const missing = new Set();
const loaded = new Set();
window.__assetOk = (img) => {
  loaded.add(img.getAttribute('src'));
  img.parentNode.classList.add('loaded');
};
window.__assetErr = (img) => {
  missing.add(img.getAttribute('src'));
  img.remove();
};

function imgTag(src, alt) {
  if (missing.has(src)) return '';
  return `<img src="${src}" alt="${esc(alt)}" onload="__assetOk(this)" onerror="__assetErr(this)">`;
}

/** 일러스트 자리. cls 에 'icon' 을 주면 작은 아이콘형 자리표시 */
export function assetSlot(key, cls = '') {
  const a = ASSETS[key];
  if (!a) return '';
  return `<div class="asset-slot ${cls} ${loaded.has(a.src) ? 'loaded' : ''}" data-asset="${key}" style="--ar:${a.ratio}">
    ${imgTag(a.src, a.label)}
    <span class="asset-info"><b>${esc(a.label)}</b><small>${key} · ${a.size}</small></span>
  </div>`;
}

const AVATAR_COLORS = ['#e8b64c', '#4cc3c8', '#e5604d', '#8f7be8', '#4cc38a', '#e88fb4', '#6aa3ff', '#c9a27a'];

export function avatar(player, size = 'md') {
  const idx = player.colorIndex ?? 0;
  const src = avatarSrc(idx);
  const initial = esc([...(player.name || '?')][0]);
  return `<span class="avatar ${size} ${loaded.has(src) ? 'loaded' : ''}" style="--c:${AVATAR_COLORS[idx % 8]}" title="${esc(player.name)}">
    <span class="initial">${initial}</span>${imgTag(src, player.name)}
  </span>`;
}

// ── 입력 컴포넌트 ──
export function numberChips({ action, pid, max, value }) {
  let h = '';
  for (let i = 0; i <= max; i++) {
    h += `<button class="chip ${value === i ? 'on' : ''}" data-action="${action}" data-pid="${pid}" data-v="${i}">${i}</button>`;
  }
  return `<div class="chips">${h}</div>`;
}

export function stepper({ action, pid, key, value, min = 0, max }) {
  const attrs = `data-action="${action}" data-pid="${pid}" data-key="${key}"`;
  return `<div class="stepper">
    <button class="step" ${attrs} data-d="-1" ${value <= min ? 'disabled' : ''} aria-label="감소">−</button>
    <output>${value}</output>
    <button class="step" ${attrs} data-d="1" ${value >= max ? 'disabled' : ''} aria-label="증가">+</button>
  </div>`;
}

export function topBar({ title, back = 'home', backGame = '', right = '' }) {
  const backBtn = back
    ? `<button class="icon-btn" data-action="nav" data-to="${back}" ${backGame ? `data-game="${backGame}"` : ''} aria-label="뒤로">‹</button>`
    : '<span></span>';
  return `<header class="topbar">${backBtn}<h1>${esc(title)}</h1><div class="topbar-right">${right}</div></header>`;
}

// ── 모달/토스트 ──
const modalRoot = () => document.getElementById('modal-root');

export function confirmDialog({ title, message = '', ok = '확인', cancel = '취소', danger = false }) {
  return new Promise((resolve) => {
    const root = modalRoot();
    root.innerHTML = `<div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <h3>${esc(title)}</h3>${message ? `<p>${esc(message)}</p>` : ''}
        <div class="modal-actions">
          <button class="btn ghost" data-r="0">${esc(cancel)}</button>
          <button class="btn ${danger ? 'danger' : 'primary'}" data-r="1">${esc(ok)}</button>
        </div>
      </div></div>`;
    root.onclick = (e) => {
      const b = e.target.closest('[data-r]');
      if (!b && !e.target.classList.contains('modal-backdrop')) return;
      root.innerHTML = '';
      root.onclick = null;
      resolve(b?.dataset.r === '1');
    };
  });
}

/** "요-호-호!" 비드 공개 카운트다운 */
export function yoHoHo() {
  const root = modalRoot();
  const words = ['요', '호', '호!'];
  let i = 0;
  root.innerHTML = `<div class="yohoho"><span></span></div>`;
  const span = root.querySelector('span');
  const step = () => {
    if (i >= words.length) {
      setTimeout(() => (root.innerHTML = ''), 600);
      return;
    }
    span.textContent = words[i++];
    span.classList.remove('pop');
    void span.offsetWidth;
    span.classList.add('pop');
    navigator.vibrate?.(60);
    setTimeout(step, 700);
  };
  step();
}

let toastTimer;
export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

export function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
