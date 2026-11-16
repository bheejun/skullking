// 로컬 저장소 (localStorage). 플레이어와 게임을 분리 저장해 추후 참여자별 이력/통계에 활용한다.
// 나중에 서버/클라우드로 옮길 때는 이 모듈의 인터페이스만 유지하면 된다.

import { DEFAULT_TOTAL_ROUNDS, RULESET } from './rules.js';

const KEY = 'skullking:data';
const SCHEMA_VERSION = 1;

const empty = () => ({ schemaVersion: SCHEMA_VERSION, players: {}, games: {}, activeGameId: null });

function migrate(d) {
  if (!d || typeof d !== 'object' || !d.schemaVersion) return empty();
  // 향후 스키마 변경 시 여기서 버전별 변환
  return d;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

let data = load();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('저장 실패', e);
  }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const store = {
  // ── 플레이어 ──
  getPlayer(id) {
    return data.players[id] ?? { id, name: '(알 수 없음)', colorIndex: 0 };
  },

  listPlayers() {
    return Object.values(data.players).sort(
      (a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0) || a.name.localeCompare(b.name, 'ko'),
    );
  },

  /** 같은 이름이 있으면 재사용 */
  addPlayer(name) {
    const trimmed = name.trim();
    const existing = Object.values(data.players).find((p) => p.name === trimmed);
    if (existing) return existing;
    const p = {
      id: uid(),
      name: trimmed,
      colorIndex: Object.keys(data.players).length % 8,
      avatar: null, // 추후 아바타 선택 기능용
      createdAt: Date.now(),
      lastPlayedAt: null,
    };
    data.players[p.id] = p;
    persist();
    return p;
  },

  // ── 게임 ──
  getGame(id) {
    return data.games[id] ?? null;
  },

  getActiveGame() {
    return data.activeGameId ? data.games[data.activeGameId] ?? null : null;
  },

  createGame({ playerIds, firstDealerIndex = 0, totalRounds = DEFAULT_TOTAL_ROUNDS }) {
    const now = Date.now();
    const game = {
      id: uid(),
      createdAt: now,
      updatedAt: now,
      finishedAt: null,
      status: 'in_progress', // in_progress | finished | abandoned
      settings: { ruleSet: RULESET, totalRounds },
      playerIds: [...playerIds], // 좌석 순서 (시계 방향)
      firstDealerIndex,
      currentRound: 1,
      phase: 'bid', // bid | result
      rounds: Array.from({ length: totalRounds }, () => ({
        bids: {}, // { playerId: number }
        tricks: {}, // { playerId: number }
        bonuses: {}, // { playerId: { std14: n, ... } }
        confirmedAt: null,
      })),
      result: null, // 종료 시 { standings, winnerIds }
    };
    data.games[game.id] = game;
    data.activeGameId = game.id;
    for (const id of playerIds) if (data.players[id]) data.players[id].lastPlayedAt = now;
    persist();
    return game;
  },

  saveGame(game) {
    game.updatedAt = Date.now();
    data.games[game.id] = game;
    persist();
  },

  finishGame(game, result) {
    game.status = 'finished';
    game.finishedAt = Date.now();
    game.result = result;
    if (data.activeGameId === game.id) data.activeGameId = null;
    for (const id of game.playerIds) if (data.players[id]) data.players[id].lastPlayedAt = game.finishedAt;
    this.saveGame(game);
  },

  abandonActive() {
    const g = this.getActiveGame();
    if (g) {
      g.status = 'abandoned';
      g.updatedAt = Date.now();
    }
    data.activeGameId = null;
    persist();
  },

  listGames({ status } = {}) {
    return Object.values(data.games)
      .filter((g) => !status || g.status === status)
      .sort((a, b) => (b.finishedAt || b.updatedAt) - (a.finishedAt || a.updatedAt));
  },

  /** 특정 플레이어가 참여한 게임 (추후 참여자별 이력 화면용) */
  gamesForPlayer(playerId, { status = 'finished' } = {}) {
    return this.listGames({ status }).filter((g) => g.playerIds.includes(playerId));
  },
};
