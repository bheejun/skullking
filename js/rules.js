// 스컬킹 기본 규칙 — 점수 계산 순수 함수 모음 (UI/저장소와 무관)

export const RULESET = 'basic';
export const DEFAULT_TOTAL_ROUNDS = 10;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

// 보너스 종류. 비드에 성공했을 때만 점수에 반영된다.
// icon: assets.js 의 에셋 키
export const BONUS_TYPES = [
  { key: 'std14', label: '일반 14 획득', points: 10, max: 3, icon: 'icon_std14' },
  { key: 'black14', label: '검은 14 획득', points: 20, max: 1, icon: 'icon_black14' },
  { key: 'mermaidByPirate', label: '해적으로 인어 획득', points: 20, max: 2, icon: 'icon_mermaid' },
  { key: 'pirateBySK', label: '스컬킹으로 해적 획득', points: 30, max: 5, icon: 'icon_pirate' },
  { key: 'skByMermaid', label: '인어로 스컬킹 획득', points: 40, max: 1, icon: 'icon_skullking' },
  { key: 'loot', label: '약탈 동맹 성공', points: 20, max: 2, icon: 'icon_loot' },
];

/** n라운드에 나눠주는 카드 수 */
export function cardsForRound(n) {
  return n;
}

/** n라운드의 딜러 좌석 인덱스 (라운드마다 왼쪽으로 이동) */
export function dealerIndex(game, n) {
  return (game.firstDealerIndex + n - 1) % game.playerIds.length;
}

/** n라운드의 선 플레이어 좌석 인덱스 (딜러 왼쪽) */
export function firstPlayerIndex(game, n) {
  return (dealerIndex(game, n) + 1) % game.playerIds.length;
}

/** 선 플레이어부터 시작하는 좌석 순서 */
export function seatOrder(game, n) {
  const ids = game.playerIds;
  const start = firstPlayerIndex(game, n);
  return ids.map((_, i) => ids[(start + i) % ids.length]);
}

export function rawBonus(bonuses = {}) {
  return BONUS_TYPES.reduce((sum, b) => sum + (bonuses[b.key] || 0) * b.points, 0);
}

/**
 * 한 플레이어의 한 라운드 점수.
 * - 비드 0 성공: +10×라운드, 실패: −10×라운드
 * - 비드 1+ 성공: +20×비드 (+보너스), 실패: −10×차이
 */
export function scorePlayerRound(n, bid, tricks, bonuses = {}) {
  if (bid == null || tricks == null) return null;
  const success = bid === tricks;
  let base;
  if (bid === 0) base = success ? 10 * n : -10 * n;
  else base = success ? 20 * bid : -10 * Math.abs(bid - tricks);
  const bonusRaw = rawBonus(bonuses);
  const bonus = success ? bonusRaw : 0;
  return { success, base, bonus, bonusRaw, total: base + bonus };
}

/** 확정된 라운드 기준 플레이어별 누적 점수. exceptRound 지정 시 해당 라운드 제외 */
export function totalsByPlayer(game, exceptRound = null) {
  const totals = Object.fromEntries(game.playerIds.map((id) => [id, 0]));
  game.rounds.forEach((r, i) => {
    const n = i + 1;
    if (!r.confirmedAt || n === exceptRound) return;
    for (const id of game.playerIds) {
      const res = scorePlayerRound(n, r.bids[id], r.tricks[id], r.bonuses[id]);
      if (res) totals[id] += res.total;
    }
  });
  return totals;
}

/** 순위표 (동점 공동 순위) */
export function standings(game) {
  const totals = totalsByPlayer(game);
  const list = game.playerIds
    .map((playerId) => ({ playerId, total: totals[playerId] }))
    .sort((a, b) => b.total - a.total);
  list.forEach((row, i) => {
    row.rank = i > 0 && row.total === list[i - 1].total ? list[i - 1].rank : i + 1;
  });
  return list;
}

/** 게임 종료 시 저장할 결과 스냅샷 (이력/통계용) */
export function buildResult(game) {
  const st = standings(game);
  return {
    standings: st,
    winnerIds: st.filter((s) => s.rank === 1).map((s) => s.playerId),
  };
}
