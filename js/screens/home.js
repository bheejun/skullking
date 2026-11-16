import { assetSlot, confirmDialog } from '../ui.js';

export default {
  render({ store }) {
    const active = store.getActiveGame();
    return `<main class="screen home">
      ${assetSlot('logo', 'logo')}
      ${assetSlot('homeHero', 'hero')}
      <div class="stack">
        ${
          active
            ? `<button class="btn primary big" data-action="resume">
                 이어하기 <small>${active.currentRound} / ${active.settings.totalRounds} 라운드 · ${active.playerIds.length}명</small>
               </button>`
            : ''
        }
        <button class="btn ${active ? '' : 'primary big'}" data-action="newGame">새 게임</button>
        <div class="row">
          <button class="btn ghost" data-action="nav" data-to="rules">규칙 요약</button>
          <button class="btn ghost" data-action="nav" data-to="history">게임 기록</button>
        </div>
      </div>
    </main>`;
  },

  actions: {
    resume: (_, ctx) => ctx.go('round'),
    async newGame(_, ctx) {
      if (ctx.store.getActiveGame()) {
        const ok = await confirmDialog({
          title: '진행 중인 게임이 있어요',
          message: '새 게임을 시작하면 진행 중인 게임은 중단됩니다.',
          ok: '새로 시작',
          danger: true,
        });
        if (!ok) return;
        ctx.store.abandonActive();
      }
      ctx.go('setup');
    },
  },
};
