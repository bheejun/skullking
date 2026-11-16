# 에셋 목록 (일러스트 / 아이콘)

아래 경로에 파일을 넣으면 앱에 **자동으로 표시**됩니다. 파일이 없으면 금색 점선 자리표시에 에셋 이름과 키가 보입니다.
경로나 규격을 바꾸려면 `js/assets.js`를 수정하세요.

- 형식: 앱에서는 용량이 작은 **WebP**를 사용합니다(앱 아이콘만 PNG). 새 그림은 PNG로 받아 WebP(품질 80 안팎)로 변환해서 넣으세요. 원본 PNG는 `originals/` 폴더에 보관하며, 이 폴더는 GitHub에 올라가지 않습니다.
- 확장자를 바꾸면 `js/assets.js`의 `src`도 같이 수정해야 합니다.
- 크기: 표의 크기는 권장 원본 크기입니다(고해상도 화면 기준 2배). 비율은 지켜 주세요.
- 배경: 앱 배경색은 짙은 남색(`#0f1a24`)이고, 강조색은 금색(`#e8b64c`)입니다.

## 일러스트

| 키 | 파일 경로 | 권장 크기 (비율) | 표시 위치 | 설명 |
|---|---|---|---|---|
| `logo` | `assets/illustrations/logo.webp` | 1200×480 (5:2) | 홈 맨 위 | 앱 타이틀 로고 |
| `homeHero` | `assets/illustrations/home-hero.webp` | 1200×900 (4:3) | 홈, 로고 아래 | 메인 분위기 일러스트 |
| `roundBanner` | `assets/illustrations/round-banner.webp` | 1200×400 (3:1) | 라운드 화면 상단 배너 배경 | 글자가 위에 올라가므로 왼쪽은 어둡고 단순하게 |
| `winner` | `assets/illustrations/winner.webp` | 1000×1000 (1:1) | 게임 종료 화면 | 우승 축하 일러스트 |
| `emptyHistory` | `assets/illustrations/empty-history.webp` | 800×600 (4:3) | 기록 화면 (기록 없을 때) | 빈 상태 일러스트 |
| `statsComingSoon` | `assets/illustrations/stats-soon.webp` | 800×400 (2:1) | 기록 화면 하단 | "참여자별 기록 준비 중" 안내 |

## 보너스 아이콘 (정사각, 투명 배경)

| 키 | 파일 경로 | 크기 | 의미 |
|---|---|---|---|
| `icon_std14` | `assets/icons/bonus-std14.webp` | 128×128 | 일반 무늬 14 획득 (+10) |
| `icon_black14` | `assets/icons/bonus-black14.webp` | 128×128 | 검은 14 획득 (+20) |
| `icon_mermaid` | `assets/icons/bonus-mermaid.webp` | 128×128 | 해적으로 인어 획득 (+20) |
| `icon_pirate` | `assets/icons/bonus-pirate.webp` | 128×128 | 스컬킹으로 해적 획득 (+30) |
| `icon_skullking` | `assets/icons/bonus-skullking.webp` | 128×128 | 인어로 스컬킹 획득 (+40) |
| `icon_loot` | `assets/icons/bonus-loot.webp` | 128×128 | 약탈 동맹 성공 (+20) |

아이콘은 화면에 40×40px로 표시되므로 작게 줄여도 알아볼 수 있는 단순한 실루엣이 좋습니다.

## 플레이어 아바타 (원형으로 잘림)

| 파일 경로 | 크기 | 설명 |
|---|---|---|
| `assets/avatars/avatar-01.webp` ~ `avatar-08.webp` | 256×256 | 기본 아바타 8종. 플레이어를 등록한 순서대로 1→8번이 돌아가며 배정됩니다. 파일이 없으면 색상 원 안에 이름 첫 글자가 표시됩니다. |

## 앱 아이콘 (홈 화면 추가용)

| 파일 경로 | 크기 | 설명 |
|---|---|---|
| `assets/icons/app-192.png` | 192×192 | 기본 아이콘 / 파비콘 |
| `assets/icons/app-512.png` | 512×512 | 고해상도 아이콘 |
| `assets/icons/app-512-maskable.png` | 512×512 | 안드로이드 마스커블 아이콘. 중요한 내용은 가운데 80% 안에 두세요. |

> 저작권 주의: 공식 카드 일러스트나 로고는 쓰지 말고 직접 제작한 그림을 사용하세요.
