// 일러스트/아이콘 에셋 목록.
// 지정된 경로(src)에 파일을 넣으면 자동으로 표시되고, 없으면 점선 자리표시가 보인다.
// 전체 목록과 규격은 docs/ASSETS.md 참고.

export const ASSETS = {
  // 홈
  logo: { label: '메인 로고', size: '1200×480', ratio: '5/2', src: 'assets/illustrations/logo.webp' },
  homeHero: { label: '홈 메인 일러스트', size: '1200×900', ratio: '4/3', src: 'assets/illustrations/home-hero.webp' },

  // 라운드
  roundBanner: { label: '라운드 배너 배경', size: '1200×400', ratio: '3/1', src: 'assets/illustrations/round-banner.webp' },

  // 결과/기록
  winner: { label: '우승 일러스트', size: '1000×1000', ratio: '1/1', src: 'assets/illustrations/winner.webp' },
  emptyHistory: { label: '기록 없음 일러스트', size: '800×600', ratio: '4/3', src: 'assets/illustrations/empty-history.webp' },
  statsComingSoon: { label: '참여자 통계 준비중 일러스트', size: '800×400', ratio: '2/1', src: 'assets/illustrations/stats-soon.webp' },

  // 보너스 아이콘 (정사각, 투명 배경)
  icon_std14: { label: '일반 14', size: '128×128', ratio: '1/1', src: 'assets/icons/bonus-std14.webp' },
  icon_black14: { label: '검은 14', size: '128×128', ratio: '1/1', src: 'assets/icons/bonus-black14.webp' },
  icon_mermaid: { label: '인어', size: '128×128', ratio: '1/1', src: 'assets/icons/bonus-mermaid.webp' },
  icon_pirate: { label: '해적', size: '128×128', ratio: '1/1', src: 'assets/icons/bonus-pirate.webp' },
  icon_skullking: { label: '스컬킹', size: '128×128', ratio: '1/1', src: 'assets/icons/bonus-skullking.webp' },
  icon_loot: { label: '약탈', size: '128×128', ratio: '1/1', src: 'assets/icons/bonus-loot.webp' },
};

// 플레이어 기본 아바타 (colorIndex 0~7 → avatar-01 ~ avatar-08). 없으면 이니셜 원형 표시.
export const avatarSrc = (colorIndex) => `assets/avatars/avatar-${String(colorIndex + 1).padStart(2, '0')}.webp`;
