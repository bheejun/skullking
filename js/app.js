// 앱 진입점: 화면 라우팅 + 이벤트 위임

import { store } from './store.js';
import home from './screens/home.js';
import setup from './screens/setup.js';
import round from './screens/round.js';
import scoreboard from './screens/scoreboard.js';
import end from './screens/end.js';
import rules from './screens/rules.js';
import history from './screens/history.js';
import settings from './screens/settings.js';

const screens = { home, setup, round, scoreboard, end, rules, history, settings };
const appEl = document.getElementById('app');

let route = { name: 'home', params: {} };

const ctx = {
  store,
  get params() {
    return route.params;
  },
  go,
  back: () => window.history.back(),
  rerender: render,
};

function enter(next) {
  screens[route.name]?.leave?.(ctx);
  route = next;
  screens[route.name]?.enter?.(ctx);
  window.scrollTo(0, 0);
  render();
}

function go(name, params = {}, { replace = false } = {}) {
  const state = { name, params };
  if (replace) window.history.replaceState(state, '');
  else window.history.pushState(state, '');
  enter(state);
}

function render() {
  const screen = screens[route.name] ?? screens.home;
  appEl.innerHTML = screen.render(ctx);
  screen.mounted?.(ctx);
}

// 공용 액션 + 화면별 액션 위임
const commonActions = {
  nav: (el) => go(el.dataset.to, el.dataset.game ? { gameId: el.dataset.game } : {}),
  back: () => ctx.back(),
};

appEl.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const name = el.dataset.action;
  const fn = screens[route.name].actions?.[name] ?? commonActions[name];
  if (fn) {
    e.preventDefault();
    fn(el, ctx, e);
  }
});

appEl.addEventListener('submit', (e) => {
  const fn = screens[route.name].actions?.[e.target.dataset.submit];
  if (fn) {
    e.preventDefault();
    fn(e.target, ctx, e);
  }
});

window.addEventListener('popstate', (e) => enter(e.state ?? { name: 'home', params: {} }));

window.history.replaceState(route, '');
enter(route);

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
