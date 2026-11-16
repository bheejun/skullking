// 애니메이션 컷신: 목록, 발동 조건 판정, 재생기.
// 영상(assets/cutscenes/<key>.mp4) → 포스터(<key>.webp) → 생략 순으로 대체한다. 규격은 docs/CUTSCENES.md.

import { store } from './store.js';
import { scorePlayerRound, standings, totalsByPlayer } from './rules.js';
import { esc } from './ui.js';

const DIR = 'assets/cutscenes';
const STILL_MS = 2400; // 포스터만 있을 때 표시 시간
const LOAD_TIMEOUT_MS = 2500; // 영상 준비가 이보다 늦으면 포스터로 대체

export const CUTSCENES = {
  'voyage-start': { title: '출항', when: '게임 시작 직후', sample: '' },
  'final-round': { title: '마지막 라운드', when: '마지막 라운드 시작', sample: '마지막 라운드!' },
  yohoho: { title: '요-호-호!', when: '비드 공개 버튼', beats: ['요', '호', '호!'], beatMs: 700 },
  'mermaid-vs-king': { title: '인어가 스컬킹을 잡음', when: '인어로 스컬킹 획득', priority: 1, sample: '영희 — 인어가 스컬킹을 잡았다! +40' },
  'king-vs-pirates': { title: '스컬킹이 해적을 쓸어감', when: '스컬킹으로 해적 획득', priority: 2, sample: '철수 — 스컬킹이 해적 2명을 잡았다! +60' },
  'total-wipeout': { title: '전원 비드 실패', when: '모든 플레이어 비드 실패', priority: 3, sample: '전원 난파! 아무도 비드를 맞히지 못했다' },
  'bold-bid': { title: '대담한 비드 성공', when: '비드 5 이상 성공', priority: 4, sample: '민수 — 비드 6 적중! +120' },
  'pirate-vs-mermaid': { title: '해적이 인어를 낚아챔', when: '해적으로 인어 획득', priority: 5, sample: '철수 — 해적이 인어를 낚았다! +20' },
  'zero-hero': { title: '0 비드 생존', when: '7라운드 이후 비드 0 성공', priority: 6, sample: '영희 — 0 비드 생존! +80' },
  'lead-change': { title: '선두 교체', when: '3라운드 이후 1위가 바뀜', priority: 7, sample: '선두 교체! 민수 1위' },
  victory: { title: '우승', when: '게임 종료', sample: '철수 우승! 810점' },
};

// ── 발동 조건 판정 ──

/** 확정된 n라운드에서 발생한 컷신 (우선순위 순, 같은 종류는 하나로 합침) */
export function detectRoundEvents(game, n) {
  const r = game.rounds[n - 1];
  const name = (id) => store.getPlayer(id).name;
  const found = new Map(); // key → captions[]
  const add = (key, caption) => found.set(key, [...(found.get(key) ?? []), caption]);
  const pts = (ok, p) => (ok ? ` +${p}` : '');

  const results = game.playerIds.map((id) => ({ id, bid: r.bids[id], bon: r.bonuses[id] || {}, res: scorePlayerRound(n, r.bids[id], r.tricks[id], r.bonuses[id]) }));

  for (const { id, bid, bon, res } of results) {
    if (!res) continue;
    if (bon.skByMermaid) add('mermaid-vs-king', `${name(id)} — 인어가 스컬킹을 잡았다!${pts(res.success, 40)}`);
    if (bon.pirateBySK) add('king-vs-pirates', `${name(id)} — 스컬킹이 해적 ${bon.pirateBySK}명을 잡았다!${pts(res.success, 30 * bon.pirateBySK)}`);
    if (bon.mermaidByPirate) add('pirate-vs-mermaid', `${name(id)} — 해적이 인어를 낚았다!${pts(res.success, 20 * bon.mermaidByPirate)}`);
    if (res.success && bid >= 5) add('bold-bid', `${name(id)} — 비드 ${bid} 적중! +${res.total}`);
    if (res.success && bid === 0 && n >= 7) add('zero-hero', `${name(id)} — 0 비드 생존! +${res.total}`);
  }

  if (results.every((x) => x.res && !x.res.success)) add('total-wipeout', '전원 난파! 아무도 비드를 맞히지 못했다');

  if (n >= 3) {
    const before = totalsByPlayer(game, n);
    const max = Math.max(...Object.values(before));
    const prevLeaders = game.playerIds.filter((id) => before[id] === max);
    const now = standings(game).filter((s) => s.rank === 1);
    if (prevLeaders.length === 1 && now.length === 1 && now[0].playerId !== prevLeaders[0]) {
      add('lead-change', `선두 교체! ${name(now[0].playerId)} 1위`);
    }
  }

  return [...found]
    .map(([key, captions]) => ({ key, caption: captions.join('\n') }))
    .sort((a, b) => CUTSCENES[a.key].priority - CUTSCENES[b.key].priority);
}

export function victoryEvent(game) {
  const st = game.result?.standings ?? standings(game);
  const winners = st.filter((s) => s.rank === 1);
  return { key: 'victory', caption: `${winners.map((w) => store.getPlayer(w.playerId).name).join(', ')} 우승! ${winners[0].total}점` };
}

// ── 미디어 로드 ──

const missing = new Set();
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src || missing.has(src)) return resolve(null);
    const img = new Image();
    img.onload = () => resolve({ type: 'image', el: img });
    img.onerror = () => {
      missing.add(src);
      resolve(null);
    };
    img.src = src;
  });
}

async function loadPoster(key) {
  return (await loadImage(`${DIR}/${key}.webp`)) ?? (await loadImage(CUTSCENES[key].poster));
}

function loadVideo(key) {
  const src = `${DIR}/${key}.mp4`;
  return new Promise((resolve) => {
    if (missing.has(src)) return resolve(null);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('playsinline', '');
    const timer = setTimeout(() => done(null), LOAD_TIMEOUT_MS);
    function done(result) {
      clearTimeout(timer);
      v.oncanplay = v.onerror = null;
      resolve(result);
    }
    v.oncanplay = () => done({ type: 'video', el: v });
    v.onerror = () => {
      missing.add(src);
      done(null);
    };
    v.src = src;
  });
}

async function loadMedia(key) {
  if (!reducedMotion()) {
    const video = await loadVideo(key);
    if (video) return video;
  }
  return loadPoster(key);
}

function placeholder(key) {
  const el = document.createElement('div');
  el.className = 'asset-slot cs-placeholder';
  el.innerHTML = `<span class="asset-info"><b>${esc(CUTSCENES[key].title)} 컷신</b><small>${DIR}/${key}.mp4 · 1080×1080</small></span>`;
  return { type: 'placeholder', el };
}

// ── 재생 ──

let overlay = null;

function openOverlay() {
  if (overlay) return overlay;
  const root = document.getElementById('cutscene-root');
  root.innerHTML = `<div class="cutscene" role="dialog" aria-label="컷신">
      <div class="cs-stage"><div class="cs-media"></div><div class="cs-caption"></div></div>
      <button class="cs-skip">건너뛰기 ›</button>
    </div>`;
  const el = root.firstElementChild;
  overlay = { el, media: el.querySelector('.cs-media'), caption: el.querySelector('.cs-caption'), onTap: null, onSkip: null };
  el.addEventListener('click', (e) => {
    if (e.target.closest('.cs-skip')) overlay?.onSkip?.();
    else overlay?.onTap?.();
  });
  void el.offsetWidth; // 페이드인 시작점 확정 (rAF는 백그라운드 탭에서 멈출 수 있음)
  el.classList.add('show');
  return overlay;
}

function closeOverlay() {
  if (!overlay) return Promise.resolve();
  const { el } = overlay;
  overlay = null;
  el.classList.remove('show');
  return new Promise((r) => setTimeout(() => (el.remove(), r()), 250));
}

function showOne(ui, item, media) {
  const def = CUTSCENES[item.key];
  ui.media.replaceChildren(media.el);
  ui.media.className = `cs-media ${media.type}`;
  ui.caption.textContent = '';
  ui.caption.classList.remove('show', 'beat');

  return new Promise((resolve) => {
    const timers = [];
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      if (media.type === 'video') media.el.pause();
      resolve(result);
    };
    ui.onTap = () => finish('next');
    ui.onSkip = () => finish('skipAll');

    // 자막: 박자형(요-호-호) 또는 일반
    if (def.beats) {
      ui.caption.classList.add('beat');
      def.beats.forEach((word, i) =>
        timers.push(setTimeout(() => {
          ui.caption.textContent = word;
          ui.caption.classList.remove('show');
          void ui.caption.offsetWidth;
          ui.caption.classList.add('show');
          navigator.vibrate?.(60);
        }, i * def.beatMs)),
      );
    } else if (item.caption) {
      ui.caption.textContent = item.caption;
      timers.push(setTimeout(() => ui.caption.classList.add('show'), 400));
    }

    if (media.type === 'video') {
      const v = media.el;
      v.currentTime = 0;
      v.onended = () => timers.push(setTimeout(() => finish('next'), 300));
      v.play().catch(() => timers.push(setTimeout(() => finish('next'), STILL_MS)));
      timers.push(setTimeout(() => finish('next'), ((v.duration || 5) + 1.5) * 1000)); // 안전장치
    } else {
      const ms = def.beats ? def.beats.length * def.beatMs + 500 : STILL_MS;
      timers.push(setTimeout(() => finish('next'), ms));
    }
  });
}

/**
 * 컷신을 순서대로 재생. 재생한 개수를 돌려준다(0이면 아무것도 안 나옴).
 * preview: 설정 끔·파일 없음과 관계없이 재생하고, 파일이 없으면 자리표시를 보여준다.
 */
export async function playCutscenes(items, { preview = false } = {}) {
  if (!items.length || (!preview && !store.getSettings().cutscenes)) return 0;
  let played = 0;
  for (const item of items) {
    const media = (await loadMedia(item.key)) ?? (preview ? placeholder(item.key) : null);
    if (!media) continue;
    const ui = openOverlay();
    played++;
    if ((await showOne(ui, item, media)) === 'skipAll') break;
  }
  await closeOverlay();
  return played;
}
