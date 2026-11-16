import { assetSlot, esc, fmtDate, topBar } from '../ui.js';

export default {
  render({ store }) {
    const games = store.listGames({ status: 'finished' });
    const name = (id) => esc(store.getPlayer(id).name);

    return `<main class="screen history">
      ${topBar({ title: '게임 기록' })}
      ${
        games.length
          ? `<ul class="game-list">${games
              .map((g) => {
                const top = g.result?.standings?.[0];
                return `<li><button class="game-item" data-action="nav" data-to="scoreboard" data-game="${g.id}">
                  <span class="date">${fmtDate(g.finishedAt)}</span>
                  <span class="players">${g.playerIds.map(name).join(' · ')}</span>
                  <span class="win">🏆 ${(g.result?.winnerIds ?? []).map(name).join(', ')} <b>${top?.total ?? ''}</b></span>
                </button></li>`;
              })
              .join('')}</ul>`
          : `${assetSlot('emptyHistory', 'empty')}<p class="empty-note">아직 끝난 게임이 없어요.</p>`
      }
      <section class="card muted-card">
        ${assetSlot('statsComingSoon', 'soon')}
        <h2>참여자별 기록 <span class="badge">준비 중</span></h2>
        <p class="hint">승률, 평균 점수, 비드 성공률 등을 추후 제공할 예정이에요. 지금 진행하는 게임도 모두 기록에 포함돼요.</p>
      </section>
    </main>`;
  },
};
