import { standings } from '../rules.js';
import { assetSlot, avatar, esc, topBar } from '../ui.js';

export default {
  render(ctx) {
    const game = ctx.store.getGame(ctx.params.gameId);
    if (!game) return `<main class="screen">${topBar({ title: '게임 종료' })}</main>`;
    const st = standings(game);
    const winners = st.filter((s) => s.rank === 1).map((s) => ctx.store.getPlayer(s.playerId).name);

    return `<main class="screen end">
      ${topBar({ title: '게임 종료' })}
      ${assetSlot('winner', 'winner')}
      <h2 class="winner-name">${winners.map(esc).join(', ')} 승리!</h2>
      <ol class="rank-list">${st
        .map((s) => {
          const p = ctx.store.getPlayer(s.playerId);
          return `<li class="${s.rank === 1 ? 'first' : ''}"><span class="rank">${s.rank}</span>${avatar(p)}<span class="pname">${esc(p.name)}</span><b>${s.total}</b></li>`;
        })
        .join('')}</ol>
      <div class="stack">
        <button class="btn" data-action="nav" data-to="scoreboard" data-game="${game.id}">점수표 보기</button>
        <button class="btn primary" data-action="rematch">같은 멤버로 새 게임</button>
        <button class="btn ghost" data-action="nav" data-to="home">홈</button>
      </div>
    </main>`;
  },

  actions: {
    rematch(_, ctx) {
      const game = ctx.store.getGame(ctx.params.gameId);
      ctx.go('setup', { playerIds: game.playerIds });
    },
  },
};
