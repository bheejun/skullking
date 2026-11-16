import { BONUS_TYPES } from '../rules.js';
import { assetSlot, topBar } from '../ui.js';

export default {
  render() {
    return `<main class="screen rules">
      ${topBar({ title: '규칙 요약' })}
      <section class="card">
        <h2>진행</h2>
        <ul class="bullets">
          <li>총 10라운드, n라운드에는 각자 카드 n장을 받습니다.</li>
          <li>카드를 확인한 뒤 모두 동시에 “요-호-호!” 하며 이길 트릭 수를 비드합니다.</li>
          <li>딜러 왼쪽 사람이 선, 라운드마다 딜러는 왼쪽으로 넘어갑니다.</li>
        </ul>
      </section>
      <section class="card">
        <h2>점수</h2>
        <table class="rule-table">
          <tr><th></th><th>성공</th><th>실패</th></tr>
          <tr><th>비드 1 이상</th><td>비드 × 20 + 보너스</td><td>차이 × −10</td></tr>
          <tr><th>비드 0</th><td>라운드 × 10</td><td>라운드 × −10</td></tr>
        </table>
      </section>
      <section class="card">
        <h2>보너스 <small class="muted">비드 성공 시에만</small></h2>
        <ul class="bonus-legend">${BONUS_TYPES.map(
          (b) => `<li>${assetSlot(b.icon, 'icon')}<span>${b.label}</span><b>+${b.points}</b></li>`,
        ).join('')}</ul>
      </section>
    </main>`;
  },
};
