import { MAX_PLAYERS, MIN_PLAYERS, DEFAULT_TOTAL_ROUNDS } from '../rules.js';
import { avatar, esc, toast, topBar } from '../ui.js';
import { playCutscenes } from '../cutscenes.js';

let draft = null; // { seats: [playerId], firstDealerIndex }

export default {
  enter(ctx) {
    draft = { seats: [...(ctx.params.playerIds ?? [])], firstDealerIndex: 0 };
  },

  render({ store }) {
    const seats = draft.seats.map((id) => store.getPlayer(id));
    const saved = store.listPlayers().filter((p) => !draft.seats.includes(p.id));
    const full = seats.length >= MAX_PLAYERS;

    return `<main class="screen setup">
      ${topBar({ title: '새 게임' })}

      <section class="card">
        <h2>참가자 <span class="muted">${seats.length} / ${MAX_PLAYERS}</span></h2>
        <p class="hint">앉은 순서(시계 방향)대로 정렬하고, 첫 라운드 딜러를 선택하세요.</p>
        ${
          seats.length
            ? `<ol class="seat-list">${seats
                .map(
                  (p, i) => `<li>
                <span class="seat-no">${i + 1}</span>${avatar(p)}
                <span class="pname">${esc(p.name)}</span>
                <button class="pill ${draft.firstDealerIndex === i ? 'on' : ''}" data-action="dealer" data-i="${i}">딜러</button>
                <span class="seat-ctrl">
                  <button class="icon-btn sm" data-action="move" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="위로">↑</button>
                  <button class="icon-btn sm" data-action="move" data-i="${i}" data-d="1" ${i === seats.length - 1 ? 'disabled' : ''} aria-label="아래로">↓</button>
                  <button class="icon-btn sm" data-action="remove" data-i="${i}" aria-label="삭제">✕</button>
                </span>
              </li>`,
                )
                .join('')}</ol>`
            : `<p class="empty-note">아직 참가자가 없어요.</p>`
        }

        <form class="add-form" data-submit="add">
          <input name="name" maxlength="12" placeholder="이름 입력" autocomplete="off" ${full ? 'disabled' : ''}>
          <button class="btn" ${full ? 'disabled' : ''}>추가</button>
        </form>

        ${
          saved.length && !full
            ? `<div class="saved"><div class="row-label">최근 플레이어</div><div class="chips">${saved
                .map((p) => `<button class="chip person" data-action="addSaved" data-pid="${p.id}">${avatar(p, 'xs')}${esc(p.name)}</button>`)
                .join('')}</div></div>`
            : ''
        }
      </section>

      <section class="card muted-card">
        <p>기본 규칙 · ${DEFAULT_TOTAL_ROUNDS}라운드 · 라운드 수만큼 카드 배분</p>
      </section>

      <footer class="action-bar">
        <div class="sum">${seats.length < MIN_PLAYERS ? `최소 ${MIN_PLAYERS}명 필요` : `${seats.length}명 준비 완료`}</div>
        <button class="btn primary" data-action="start" ${seats.length < MIN_PLAYERS ? 'disabled' : ''}>게임 시작</button>
      </footer>
    </main>`;
  },

  mounted() {
    if (draft.seats.length === 0) document.querySelector('.add-form input')?.focus();
  },

  actions: {
    add(form, ctx) {
      const name = form.name.value.trim();
      if (!name) return;
      const p = ctx.store.addPlayer(name);
      if (draft.seats.includes(p.id)) return toast('이미 추가된 이름이에요');
      draft.seats.push(p.id);
      ctx.rerender();
      document.querySelector('.add-form input')?.focus();
    },
    addSaved(el, ctx) {
      if (draft.seats.length >= MAX_PLAYERS) return;
      draft.seats.push(el.dataset.pid);
      ctx.rerender();
    },
    remove(el, ctx) {
      const i = +el.dataset.i;
      draft.seats.splice(i, 1);
      if (draft.firstDealerIndex >= draft.seats.length) draft.firstDealerIndex = 0;
      ctx.rerender();
    },
    move(el, ctx) {
      const i = +el.dataset.i;
      const j = i + +el.dataset.d;
      const s = draft.seats;
      [s[i], s[j]] = [s[j], s[i]];
      if (draft.firstDealerIndex === i) draft.firstDealerIndex = j;
      else if (draft.firstDealerIndex === j) draft.firstDealerIndex = i;
      ctx.rerender();
    },
    dealer(el, ctx) {
      draft.firstDealerIndex = +el.dataset.i;
      ctx.rerender();
    },
    start(_, ctx) {
      ctx.store.createGame({ playerIds: draft.seats, firstDealerIndex: draft.firstDealerIndex });
      ctx.go('round', {}, { replace: true });
      playCutscenes([{ key: 'voyage-start' }]);
    },
  },
};
