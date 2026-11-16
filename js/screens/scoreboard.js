import { scorePlayerRound, standings } from '../rules.js';
import { avatar, esc, fmtScore, topBar } from '../ui.js';

function getGame(ctx) {
  return ctx.params.gameId ? ctx.store.getGame(ctx.params.gameId) : ctx.store.getActiveGame();
}

export default {
  render(ctx) {
    const game = getGame(ctx);
    if (!game) return `<main class="screen">${topBar({ title: '점수표' })}<section class="card"><p>게임을 찾을 수 없어요.</p></section></main>`;

    const live = game.status === 'in_progress';
    const pids = game.playerIds;
    const players = pids.map((id) => ctx.store.getPlayer(id));
    const st = Object.fromEntries(standings(game).map((s) => [s.playerId, s]));

    const rows = game.rounds
      .map((r, i) => {
        const n = i + 1;
        const done = !!r.confirmedAt;
        const cur = live && n === game.currentRound;
        const cells = pids
          .map((id) => {
            if (!done) return `<td class="empty">·</td>`;
            const res = scorePlayerRound(n, r.bids[id], r.tricks[id], r.bonuses[id]);
            return `<td class="${res.success ? 'ok' : 'fail'}"><b>${fmtScore(res.total)}</b><small>${r.bids[id]}/${r.tricks[id]}${res.bonus ? ' ★' : ''}</small></td>`;
          })
          .join('');
        return `<tr class="${done ? 'done' : ''} ${cur ? 'current' : ''}" ${done ? `data-action="editRound" data-n="${n}"` : ''}>
          <th>${n}${cur ? '<i>진행</i>' : ''}</th>${cells}</tr>`;
      })
      .join('');

    return `<main class="screen scoreboard">
      ${topBar({ title: '점수표', back: live ? 'round' : 'history' })}
      <div class="table-wrap">
        <table class="score-table">
          <thead><tr><th>R</th>${players.map((p) => `<th>${avatar(p, 'sm')}<span>${esc(p.name)}</span></th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><th>합계</th>${pids
            .map((id) => `<td class="${st[id].rank === 1 ? 'lead' : ''}"><b>${st[id].total}</b><small>${st[id].rank}위</small></td>`)
            .join('')}</tr></tfoot>
        </table>
      </div>
      <p class="hint center">칸: 점수 · 비드/트릭 · ★보너스 — 확정된 라운드를 누르면 수정할 수 있어요</p>
      <div class="stack">
        ${live ? `<button class="btn primary" data-action="nav" data-to="round">게임으로 돌아가기</button>` : ''}
        <button class="btn ghost" data-action="nav" data-to="home">홈</button>
      </div>
    </main>`;
  },

  actions: {
    editRound(el, ctx) {
      const game = getGame(ctx);
      ctx.go('round', { gameId: game.id, roundNumber: +el.dataset.n });
    },
  },
};
