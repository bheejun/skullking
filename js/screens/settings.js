import { CUTSCENES, playCutscenes } from '../cutscenes.js';
import { esc, topBar } from '../ui.js';

export default {
  render({ store }) {
    const on = store.getSettings().cutscenes;
    return `<main class="screen settings">
      ${topBar({ title: '설정' })}
      <section class="card">
        <div class="setting-row">
          <div><h2>컷신 재생</h2><p class="hint">명장면이 나오면 짧은 애니메이션을 보여줘요. 화면을 탭하면 건너뛸 수 있어요.</p></div>
          <button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-action="toggleCutscenes" aria-label="컷신 재생"><span></span></button>
        </div>
      </section>
      <section class="card">
        <h2>컷신 미리보기</h2>
        <p class="hint">영상이 없으면 포스터 이미지로, 둘 다 없으면 자리표시로 보여줘요. 규격: docs/CUTSCENES.md</p>
        <ul class="cs-list">${Object.entries(CUTSCENES)
          .map(
            ([key, c]) => `<li>
              <div><b>${esc(c.title)}</b><small>${esc(c.when)} · ${key}</small></div>
              <button class="btn ghost sm" data-action="preview" data-key="${key}">▶ 재생</button>
            </li>`,
          )
          .join('')}</ul>
      </section>
    </main>`;
  },

  actions: {
    toggleCutscenes(_, ctx) {
      ctx.store.updateSettings({ cutscenes: !ctx.store.getSettings().cutscenes });
      ctx.rerender();
    },
    preview(el) {
      const key = el.dataset.key;
      playCutscenes([{ key, caption: CUTSCENES[key].sample }], { preview: true });
    },
  },
};
