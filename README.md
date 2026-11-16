# 스컬킹 점수판 (웹앱)

보드게임 스컬킹을 실물 카드로 할 때 **한 대의 폰이나 태블릿**으로 비드·트릭·보너스를 입력하면 점수를 자동으로 계산해 주는 웹앱입니다.
빌드 과정이 없는 정적 사이트(HTML/CSS/JS)라서 GitHub Pages, Netlify, Vercel 같은 무료 호스팅에 폴더를 그대로 올리면 됩니다.

## 실행 (로컬)

```bash
npx http-server -p 5173 -c-1
```

브라우저에서 http://localhost:5173 을 엽니다. ES 모듈을 쓰기 때문에 `index.html`을 파일로 직접 열면 동작하지 않습니다.

## 기능

- 참가자 등록(2~8명): 좌석 순서와 첫 딜러를 정하고, 최근 플레이어는 한 번 탭으로 추가
- 라운드 진행: 비드 → 결과(트릭, 보너스) 2단계 입력. 딜러와 선 플레이어를 자동으로 돌려줌
- 기본 규칙 점수 자동 계산과 실시간 미리보기, 트릭 합계 검증
- 비드 공개용 "요-호-호!" 카운트다운, 60초 타이머, 화면 꺼짐 방지(Wake Lock)
- 점수표: 라운드별 점수·비드/트릭 표시, 확정된 라운드를 탭하면 수정 가능
- 게임 종료 화면과 순위, 같은 멤버로 다시 하기
- 게임 기록: 끝난 게임 목록. 참여자별 통계는 예정
- 진행 중인 게임 중단(삭제): 홈 또는 점수표 화면
- 애니메이션 컷신: 명장면(인어가 스컬킹을 잡음, 선두 교체, 우승 등)이 나오면 자동 재생. 설정에서 끄기와 미리보기 가능 → docs/CUTSCENES.md
- 데이터는 브라우저에 자동 저장되므로 새로고침해도 이어하기 가능. PWA로 홈 화면 추가와 오프라인 사용 지원

## 구조

```
index.html              진입점
css/style.css           스타일 (디자인 토큰은 :root)
js/app.js               화면 라우팅 + 이벤트 위임
js/rules.js             점수 규칙 (순수 함수)
js/store.js             저장소 (localStorage, 스키마 버전 관리)
js/assets.js            일러스트 에셋 목록 → docs/ASSETS.md
js/ui.js                공용 UI 헬퍼
js/screens/*.js         화면별 render + actions
assets/                 일러스트, 아이콘, 아바타 (직접 넣기)
sw.js, manifest.webmanifest  PWA
```

## 데이터 모델 (참여자별 이력 확장 대비)

`localStorage['skullking:data']`

```js
{
  schemaVersion: 1,
  players: { [id]: { id, name, colorIndex, avatar, createdAt, lastPlayedAt } },
  games: {
    [id]: {
      id, createdAt, updatedAt, finishedAt,
      status: 'in_progress' | 'finished' | 'abandoned',
      settings: { ruleSet: 'basic', totalRounds: 10 },
      playerIds: [...],            // 좌석 순서
      firstDealerIndex, currentRound, phase: 'bid' | 'result',
      rounds: [{ bids: {pid: n}, tricks: {pid: n}, bonuses: {pid: {std14, black14, ...}}, confirmedAt }],
      result: { standings: [{ playerId, total, rank }], winnerIds }   // 종료 시 스냅샷
    }
  },
  activeGameId
}
```

- 플레이어는 게임과 분리된 엔티티라서 같은 사람이 여러 게임에 참여하면 같은 id로 이어집니다.
- 라운드에는 원본 입력(비드, 트릭, 보너스 개수)만 저장하고 점수는 `rules.js`로 매번 다시 계산합니다. 그래서 규칙을 고치거나 통계를 추가해도 과거 기록을 그대로 다시 분석할 수 있습니다.
- `store.gamesForPlayer(pid)`로 참여자별 게임 목록을 바로 얻을 수 있습니다. 승률, 평균 점수, 비드 성공률 같은 통계는 여기서 계산하면 됩니다.
- 나중에 서버나 클라우드 동기화로 옮길 때는 `store.js`의 인터페이스만 유지하고 내부 구현을 바꾸면 됩니다.

## 점수 규칙 (기본)

| | 성공 | 실패 |
|---|---|---|
| 비드 1 이상 | 비드 × 20 + 보너스 | 차이 × −10 |
| 비드 0 | 라운드 × 10 | 라운드 × −10 |

보너스는 비드에 성공했을 때만 반영됩니다: 일반 14(+10), 검은 14(+20), 해적으로 인어(+20), 스컬킹으로 해적(+30), 인어로 스컬킹(+40), 약탈 동맹(+20).
