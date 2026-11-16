import {
  BONUS_TYPES, buildResult, cardsForRound, dealerIndex, firstPlayerIndex,
  rawBonus, scorePlayerRound, seatOrder, totalsByPlayer,
} from '../rules.js';
import { assetSlot, avatar, confirmDialog, esc, fmtScore, numberChips, stepper, toast, topBar, yoHoHo } from '../ui.js';
import { detectRoundEvents, playCutscenes, victoryEvent } from '../cutscenes.js';

const MAX_ROUND_CUTSCENES = 2;

// 화면 로컬 상태 (저장하지 않음)
let openBonus = new Set();
let editBid = new Set();
let timer = null; // { left, id }
let wakeLock = null;

const TIMER_SEC = 60;

function resolve(ctx) {
  const game = ctx.params.gameId ? ctx.store.getGame(ctx.params.gameId) : ctx.store.getActiveGame();
  if (!game) return null;
  const editing = ctx.params.roundNumber != null;
  const n = editing ? ctx.params.roundNumber : game.currentRound;
  return { game, n, editing, phase: editing ? 'result' : game.phase, r: game.rounds[n - 1], cards: cardsForRound(n) };
}

function resetLocal() {
  openBonus = new Set();
  editBid = new Set();
  stopTimer();
}

function stopTimer() {
  if (timer) clearInterval(timer.id);
  timer = null;
}

function timerLabel() {
  if (!timer) return '⏱ 타이머';
  if (timer.left <= 0) return '⏱ 시간 종료';
  return `⏱ ${timer.left}초`;
}

async function keepAwake() {
  try {
    wakeLock = await navigator.wakeLock?.request('screen');
  } catch {
    /* 미지원/거부 시 무시 */
  }
}
const onVisible = () => document.visibilityState === 'visible' && keepAwake();

function save(ctx, s) {
  if (s.game.status === 'finished') s.game.result = buildResult(s.game);
  ctx.store.saveGame(s.game);
  ctx.rerender();
}

function badges(game, n, pid) {
  const dealer = game.playerIds[dealerIndex(game, n)];
  const first = game.playerIds[firstPlayerIndex(game, n)];
  return `${pid === first ? '<span class="badge first">선</span>' : ''}${pid === dealer ? '<span class="badge">딜러</span>' : ''}`;
}

function bidView(s, ctx) {
  const { game, n, r, cards } = s;
  const order = seatOrder(game, n);
  const totals = totalsByPlayer(game, n);
  const allSet = order.every((id) => r.bids[id] != null);
  const sum = order.reduce((a, id) => a + (r.bids[id] ?? 0), 0);

  const list = order
    .map((pid) => {
      const p = ctx.store.getPlayer(pid);
      const b = r.bids[pid];
      return `<li class="pcard">
        <div class="pcard-head">${avatar(p)}
          <div class="pname">${esc(p.name)} ${badges(game, n, pid)}<small>누적 ${totals[pid]}</small></div>
          <span class="pill ${b == null ? 'muted' : 'on'}">비드 ${b ?? '?'}</span>
        </div>
        ${numberChips({ action: 'setBid', pid, max: cards, value: b })}
      </li>`;
    })
    .join('');

  return `<div class="tools">
      <button class="btn ghost sm" data-action="yohoho">요-호-호! 카운트다운</button>
      <button class="btn ghost sm" id="timer" data-action="timer">${timerLabel()}</button>
    </div>
    <ul class="plist">${list}</ul>
    <footer class="action-bar">
      <div class="sum">비드 합계 <b>${sum}</b> / 카드 ${cards}</div>
      <button class="btn primary" data-action="confirmBids" ${allSet ? '' : 'disabled'}>비드 확정</button>
    </footer>`;
}

function resultView(s, ctx) {
  const { game, n, r, cards, editing } = s;
  const order = seatOrder(game, n);
  const totals = totalsByPlayer(game, n);
  const sum = order.reduce((a, id) => a + (r.tricks[id] ?? 0), 0);
  const isLast = n === game.settings.totalRounds;

  const list = order
    .map((pid) => {
      const p = ctx.store.getPlayer(pid);
      const b = r.bids[pid];
      const t = r.tricks[pid];
      const bon = r.bonuses[pid] || {};
      const res = scorePlayerRound(n, b, t, bon);
      const bonusRaw = rawBonus(bon);
      const open = openBonus.has(pid);
      return `<li class="pcard ${res ? (res.success ? 'ok' : 'fail') : ''}">
        <div class="pcard-head">${avatar(p)}
          <div class="pname">${esc(p.name)} ${badges(game, n, pid)}<small>누적 ${totals[pid]}${res ? ` → ${totals[pid] + res.total}` : ''}</small></div>
          <button class="pill" data-action="toggleBidEdit" data-pid="${pid}" title="비드 수정">비드 ${b ?? '?'} ✎</button>
          <span class="score ${res ? (res.success ? 'ok' : 'fail') : ''}">${res ? fmtScore(res.total) : '–'}</span>
        </div>
        ${editBid.has(pid) || b == null ? `<div class="row-label">비드</div>${numberChips({ action: 'setBid', pid, max: cards, value: b })}` : ''}
        <div class="row-label">획득 트릭</div>
        ${numberChips({ action: 'setTricks', pid, max: cards, value: t })}
        <button class="bonus-toggle" data-action="toggleBonus" data-pid="${pid}">
          보너스 ${bonusRaw ? `<b>${fmtScore(bonusRaw)}</b>` : ''} <span>${open ? '▲' : '▼'}</span>
        </button>
        ${
          open
            ? `<div class="bonus-panel">${BONUS_TYPES.map(
                (bt) => `<div class="bonus-row">${assetSlot(bt.icon, 'icon')}
                  <span class="bl">${bt.label}<small>개당 +${bt.points}</small></span>
                  ${stepper({ action: 'bonus', pid, key: bt.key, value: bon[bt.key] || 0, max: bt.max })}
                </div>`,
              ).join('')}</div>`
            : ''
        }
        ${res && !res.success && bonusRaw ? '<p class="hint warn">비드 실패 — 보너스는 반영되지 않아요</p>' : ''}
      </li>`;
    })
    .join('');

  const sumOk = sum === cards;
  return `<ul class="plist">${list}</ul>
    <footer class="action-bar">
      <div class="sum ${sumOk ? '' : 'warn'}">트릭 합계 <b>${sum}</b> / 카드 ${cards}</div>
      ${editing ? '' : '<button class="btn ghost" data-action="backToBid">← 비드</button>'}
      <button class="btn primary" data-action="confirmResult">${editing ? '수정 저장' : isLast ? '게임 종료' : '라운드 확정'}</button>
    </footer>`;
}

export default {
  enter() {
    resetLocal();
    keepAwake();
    document.addEventListener('visibilitychange', onVisible);
  },

  leave() {
    resetLocal();
    wakeLock?.release?.();
    wakeLock = null;
    document.removeEventListener('visibilitychange', onVisible);
  },

  render(ctx) {
    const s = resolve(ctx);
    if (!s) {
      return `<main class="screen">${topBar({ title: '라운드' })}
        <section class="card"><p>진행 중인 게임이 없어요.</p><button class="btn primary" data-action="nav" data-to="home">홈으로</button></section></main>`;
    }
    const { game, n, phase, cards, editing } = s;
    const P = (i) => ctx.store.getPlayer(game.playerIds[i]).name;

    return `<main class="screen round">
      ${topBar({
        title: editing ? `${n}라운드 수정` : `${n}라운드`,
        back: editing ? 'scoreboard' : 'home',
        backGame: editing ? game.id : '',
        right: `<button class="btn ghost sm" data-action="nav" data-to="scoreboard" data-game="${game.id}">점수표</button>`,
      })}
      <section class="round-banner">
        ${assetSlot('roundBanner', 'banner')}
        <div class="round-meta">
          <div class="round-no">ROUND <b>${n}</b><span>/ ${game.settings.totalRounds}</span></div>
          <div class="round-sub">카드 ${cards}장 · 딜러 ${esc(P(dealerIndex(game, n)))} · 선 ${esc(P(firstPlayerIndex(game, n)))}</div>
          <div class="phase-tabs"><span class="${phase === 'bid' ? 'on' : ''}">1 비드</span><span class="${phase === 'result' ? 'on' : ''}">2 결과</span></div>
        </div>
      </section>
      ${phase === 'bid' ? bidView(s, ctx) : resultView(s, ctx)}
    </main>`;
  },

  actions: {
    setBid(el, ctx) {
      const s = resolve(ctx);
      s.r.bids[el.dataset.pid] = +el.dataset.v;
      save(ctx, s);
    },
    setTricks(el, ctx) {
      const s = resolve(ctx);
      s.r.tricks[el.dataset.pid] = +el.dataset.v;
      save(ctx, s);
    },
    bonus(el, ctx) {
      const s = resolve(ctx);
      const { pid, key } = el.dataset;
      const max = BONUS_TYPES.find((b) => b.key === key).max;
      const bon = (s.r.bonuses[pid] ||= {});
      bon[key] = Math.min(max, Math.max(0, (bon[key] || 0) + +el.dataset.d));
      save(ctx, s);
    },
    toggleBonus(el, ctx) {
      const pid = el.dataset.pid;
      openBonus.has(pid) ? openBonus.delete(pid) : openBonus.add(pid);
      ctx.rerender();
    },
    toggleBidEdit(el, ctx) {
      const pid = el.dataset.pid;
      editBid.has(pid) ? editBid.delete(pid) : editBid.add(pid);
      ctx.rerender();
    },
    async yohoho() {
      if (!(await playCutscenes([{ key: 'yohoho' }]))) yoHoHo(); // 영상이 없거나 컷신을 끄면 글자 카운트다운
    },
    timer(el) {
      if (timer) return stopTimer(), (el.textContent = timerLabel());
      timer = { left: TIMER_SEC };
      timer.id = setInterval(() => {
        timer.left--;
        const btn = document.getElementById('timer');
        if (btn) btn.textContent = timerLabel();
        if (timer.left <= 0) {
          clearInterval(timer.id);
          navigator.vibrate?.([200, 100, 200]);
        }
      }, 1000);
      el.textContent = timerLabel();
    },
    confirmBids(_, ctx) {
      const s = resolve(ctx);
      stopTimer();
      s.game.phase = 'result';
      ctx.store.saveGame(s.game);
      ctx.rerender();
      window.scrollTo(0, 0);
    },
    backToBid(_, ctx) {
      const s = resolve(ctx);
      s.game.phase = 'bid';
      ctx.store.saveGame(s.game);
      ctx.rerender();
    },
    async confirmResult(_, ctx) {
      const s = resolve(ctx);
      const { game, n, r, cards, editing } = s;
      if (game.playerIds.some((id) => r.bids[id] == null || r.tricks[id] == null)) {
        return toast('모든 플레이어의 비드와 트릭을 입력하세요');
      }
      const sum = game.playerIds.reduce((a, id) => a + r.tricks[id], 0);
      if (sum !== cards) {
        const ok = await confirmDialog({
          title: '트릭 합계가 맞지 않아요',
          message: `획득 트릭 합계 ${sum}개, 이번 라운드 카드 ${cards}장. 그래도 확정할까요?`,
          ok: '그래도 확정',
        });
        if (!ok) return;
      }
      r.confirmedAt = Date.now();

      if (editing) {
        if (game.status === 'finished') game.result = buildResult(game);
        ctx.store.saveGame(game);
        toast(`${n}라운드 수정 완료`);
        return ctx.back();
      }
      const events = detectRoundEvents(game, n);
      if (n < game.settings.totalRounds) {
        game.currentRound = n + 1;
        game.phase = 'bid';
        ctx.store.saveGame(game);
        resetLocal();
        ctx.rerender();
        window.scrollTo(0, 0);
        const scenes = events.slice(0, MAX_ROUND_CUTSCENES);
        if (n + 1 === game.settings.totalRounds) scenes.push({ key: 'final-round', caption: '마지막 라운드!' });
        await playCutscenes(scenes);
        toast(`${n}라운드 점수 반영 완료`);
      } else {
        ctx.store.finishGame(game, buildResult(game));
        await playCutscenes([...events.slice(0, 1), victoryEvent(game)]);
        ctx.go('end', { gameId: game.id }, { replace: true });
      }
    },
  },
};
