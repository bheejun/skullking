# 애니메이션 컷신 기획 · 제작 지시문

앱이 이미 알고 있는 정보(비드, 트릭, 보너스 개수, 누적 점수)만으로 자동 판정할 수 있는 순간을 골랐습니다.
**에셋 제작 쪽은 아래 「공통 규격」과 각 컷신의 「프롬프트」만 보면 됩니다.**

---

## 1. 컷신 목록 한눈에 보기

| # | 파일 키 | 장면 | 나오는 시점 | 판정 조건 | 우선순위 | 길이 |
|---|---|---|---|---|---|---|
| 1 | `voyage-start` | 출항 | 새 게임 → "게임 시작"을 누른 직후 | 게임당 1회 | – | 2.5초 |
| 2 | `final-round` | 마지막 라운드 | 마지막 라운드(10R) 비드 화면 진입 | 게임당 1회 | – | 2초 |
| 3 | `yohoho` | 요-호-호! 비드 공개 | "요-호-호!" 버튼 (선택 기능) | 버튼을 눌렀을 때 | – | 2.1초 |
| 4 | `mermaid-vs-king` | 인어가 스컬킹을 잡음 | 라운드 확정 직후 | 누군가 `인어로 스컬킹 획득` ≥ 1 | 1 | 3초 |
| 5 | `king-vs-pirates` | 스컬킹이 해적을 쓸어감 | 라운드 확정 직후 | 누군가 `스컬킹으로 해적 획득` ≥ 1 | 2 | 3초 |
| 6 | `total-wipeout` | 전원 비드 실패 (난파) | 라운드 확정 직후 | 모든 플레이어 비드 실패 | 3 | 2.5초 |
| 7 | `bold-bid` | 대담한 비드 성공 | 라운드 확정 직후 | 비드 5 이상을 정확히 성공 | 4 | 2.5초 |
| 8 | `pirate-vs-mermaid` | 해적이 인어를 낚아챔 | 라운드 확정 직후 | 누군가 `해적으로 인어 획득` ≥ 1 | 5 | 2초 |
| 9 | `zero-hero` | 0 비드 생존 | 라운드 확정 직후 | 7라운드 이상에서 비드 0 성공 | 6 | 2초 |
| 10 | `lead-change` | 선두 교체 | 라운드 확정 직후 | 3라운드 이후, 확정 전 단독 1위와 확정 후 1위가 다름 | 7 | 2초 |
| 11 | `victory` | 우승 | 마지막 라운드 확정 → 종료 화면 진입 직전 | 게임당 1회 | – | 4초 |

### 재생 규칙 (앱 구현 기준)

- 한 라운드에 조건이 여러 개 맞으면 **우선순위가 높은 순서로 최대 2개**만 재생하고, 나머지는 생략합니다.
- 마지막 라운드에서는 라운드 컷신을 최대 1개만 재생하고 바로 `victory`로 넘어갑니다.
- 화면을 탭하면 언제든 건너뜁니다. 설정에서 컷신을 끌 수 있고, 기기가 "동작 줄이기"로 설정되어 있으면 정지 이미지만 표시합니다.
- **플레이어 이름과 점수는 앱이 영상 위에 글자로 올립니다.** 영상 안에는 글자를 넣지 않습니다.
- 영상 파일이 없으면 정지 이미지(포스터)를 확대·페이드 효과로 보여 주고, 포스터도 없으면 컷신을 생략합니다.

---

## 2. 공통 규격 (제작 쪽 필독)

| 항목 | 규격 |
|---|---|
| 형식 | **MP4 (H.264)**, 오디오 없음 |
| 화면비 / 크기 | **1:1 정사각, 1080×1080** (폰 세로, 태블릿 가로 모두 가운데에 띄움) |
| 프레임 | 30fps |
| 길이 | 표의 길이 ±0.5초 |
| 용량 | 1개당 **1.5MB 이하** (권장 800KB 안팎) |
| 배경 | 불투명. **가장자리 약 8%는 앱 배경색 `#0f1a24`로 자연스럽게 어두워지게** (앱에서 어두운 배경 위에 띄우므로 경계가 보이지 않게) |
| 하단 여백 | **아래 25%는 비교적 단순하게** 둡니다. 앱이 이곳에 이름과 점수 자막을 올립니다. |
| 시작 / 끝 | 첫 프레임은 어둡게 시작해서 빠르게 등장합니다. 마지막 0.3초는 **정지한 결정적 장면을 유지**합니다(앱이 페이드아웃). |
| 반복 | 반복 재생하지 않음 (한 번만 재생) |
| 금지 | 글자, 숫자, 로고, 워터마크, 공식 카드 그림 모방 |
| 포스터 | 영상마다 **결정적 장면 1장을 WebP 1080×1080**으로 함께 제작 (동작 줄이기와 영상 실패 시 사용) |

### 파일 위치

```
assets/cutscenes/<파일키>.mp4
assets/cutscenes/<파일키>.webp   ← 포스터
```

예: `assets/cutscenes/mermaid-vs-king.mp4`, `assets/cutscenes/mermaid-vs-king.webp`

### 등장 캐릭터 일관성

기존 일러스트와 같은 캐릭터 설정을 씁니다. 모든 컷에 같은 외형을 유지하세요.

- **스컬킹**: 친근한 아이보리 해골, 청록 보석이 박힌 금관, 남색과 금색 선장 코트 (`avatar-03`, `winner` 참고)
- **인어**: 청록 머리카락과 청록 비늘 꼬리, 조개 머리장식 (`avatar-02` 참고)
- **해적**: 빨간 두건, 안대, 덥수룩한 수염 (`bonus-pirate` 아이콘 참고)
- **배**: 아이보리 돛, 금빛 선실 불빛을 가진 범선 (`home-hero` 참고)

---

## 3. 프롬프트

모든 프롬프트 앞에 아래 **공통 스타일 문장**을 붙이세요.

> **STYLE:** Original pirate companion boardgame animation. Hand-painted storybook gouache look, bold readable silhouettes, subtle brush texture, playful premium feel. Palette: deep navy #0f1a24, antique gold #e8b64c, ivory, teal. Square 1:1 1080x1080, 30fps, no audio. Edges vignette smoothly into solid #0f1a24. Keep the bottom 25% of the frame visually calm for overlay captions. Absolutely no text, letters, numbers, logos or watermark. Single continuous shot, ends holding a still hero pose for the final 0.3s.

---

### 1. `voyage-start` — 출항 (2.5초)

**연출 의도:** 게임 시작의 설렘. 짧고 경쾌하게.

**PROMPT:**
> Camera starts low on calm moonlit teal water at night, then the ivory sails of a wooden pirate ship snap open and fill with wind; golden cabin lights flicker on; the ship surges forward toward the camera, spray glittering gold. Ends on the ship's bow heroically framed under a full golden moon.

**포스터:** 돛이 가득 부푼 배가 정면으로 다가오는 장면

---

### 2. `final-round` — 마지막 라운드 (2초)

**연출 의도:** 긴장감 고조. 이제 마지막.

**PROMPT:**
> Close-up of an antique brass hourglass on a dark navy captain's table; the last grains of golden sand fall; storm clouds and lightning flash in the background window; a candle flame flares. Ends on the hourglass with one glowing grain about to drop.

**포스터:** 모래가 거의 다 떨어진 모래시계

---

### 3. `yohoho` — 요-호-호! (2.1초, 선택 기능)

**연출 의도:** 모두가 동시에 비드를 공개하는 박자 맞추기. 3박자(0.7초 간격)가 분명해야 합니다.

**PROMPT:**
> Three rhythmic beats exactly 0.7 seconds apart: on each beat a gloved pirate fist pounds a wooden table and golden coins jump, with a shockwave ring of gold dust; the third beat is the biggest, coins burst upward and a cutlass spins into frame. Ends with coins suspended mid-air.

**포스터:** 공중에 뜬 금화와 내려친 주먹

> 앱은 이 영상의 3박자에 맞춰 "요 · 호 · 호!" 글자를 띄웁니다. 박자 간격을 꼭 지켜 주세요.

---

### 4. `mermaid-vs-king` — 인어가 스컬킹을 잡음 (3초) ★가장 극적인 장면

**연출 의도:** 대역전. 가장 강한 카드가 인어에게 당하는 순간. 놀라움과 통쾌함.

**PROMPT:**
> The Skull King (friendly ivory skull, gold crown with teal gems, navy-gold captain coat) stands proudly on a ship deck laughing; suddenly a teal wave rises behind him and the mermaid (flowing teal hair, teal scaled tail, shell hair ornament) leaps out of it, gracefully snatching the gold crown off his head; his jaw drops comically. Ends with the mermaid holding the crown aloft against the moon, droplets sparkling, the Skull King's surprised face in the foreground.

**포스터:** 왕관을 높이 든 인어와 놀란 스컬킹

**자막(앱):** "{이름} — 인어가 스컬킹을 잡았다! +40"

---

### 5. `king-vs-pirates` — 스컬킹이 해적을 쓸어감 (3초)

**연출 의도:** 압도적인 힘. 해적들이 줄줄이 날아갑니다.

**PROMPT:**
> The Skull King raises a glowing golden cutlass; a sweeping arc of golden light blasts across the deck and several cartoon pirates (red bandanas, eyepatches, bushy beards) tumble overboard comically, hats flying; their hats rain down around the king. Ends with the Skull King in a triumphant pose, cutlass raised, pirate hats scattered at his feet.

**포스터:** 칼을 든 스컬킹과 흩어진 해적 모자들

**자막(앱):** "{이름} — 스컬킹이 해적 {n}명을 잡았다! +{30×n}"

---

### 6. `total-wipeout` — 전원 비드 실패 (2.5초)

**연출 의도:** 모두가 망한 웃픈 순간. 비극이 아니라 코믹하게.

**PROMPT:**
> A small pirate ship hits a rock in a comic storm; the hull cracks and the ship slowly tips; a few barrels and a parrot float away; a tiny white flag pops up from the crow's nest. Lighthearted slapstick tone, not scary. Ends on the half-sunk ship with the little white flag waving.

**포스터:** 반쯤 가라앉은 배와 흰 깃발

**자막(앱):** "전원 난파! 아무도 비드를 맞히지 못했다"

---

### 7. `bold-bid` — 대담한 비드 성공 (2.5초)

**연출 의도:** 큰 승부를 걸어서 해낸 사람에 대한 찬사.

**PROMPT:**
> A heavy wooden treasure chest bursts open; a fountain of gold coins and jewels shoots upward and rains down in slow motion, catching moonlight; a pirate captain's hat lands perfectly on top of the pile. Ends on the overflowing chest crowned with the hat, coins still glinting.

**포스터:** 모자가 얹힌 넘치는 보물상자

**자막(앱):** "{이름} — 비드 {n} 적중! +{20×n}"

---

### 8. `pirate-vs-mermaid` — 해적이 인어를 낚아챔 (2초)

**연출 의도:** 짧고 재치 있게. (4번보다 덜 극적으로)

**PROMPT:**
> A grinning pirate (red bandana, eyepatch, bushy beard) casts a golden fishing net from the ship's rail; the net splashes and pulls up the mermaid, who is more annoyed than scared, arms crossed, tail flicking water at him. Playful, gentle tone. Ends on the pirate's proud grin and the mermaid's pouting face in the net.

**포스터:** 그물 속에서 뾰로통한 인어와 의기양양한 해적

**자막(앱):** "{이름} — 해적이 인어를 낚았다! +20"

---

### 9. `zero-hero` — 0 비드 생존 (2초)

**연출 의도:** 카드가 많은 판에서 한 트릭도 먹지 않고 버텨낸 생존 감각.

**PROMPT:**
> In a dark misty sea, cannonballs splash all around a tiny rowboat; the boat's lone pirate ducks each splash with exaggerated dodges; the mist clears and the boat sits completely untouched, the pirate tipping his hat calmly. Ends on the calm, untouched rowboat in a ring of settling ripples.

**포스터:** 물보라 사이에서 멀쩡한 작은 보트

**자막(앱):** "{이름} — 0 비드 생존! +{10×라운드}"

---

### 10. `lead-change` — 선두 교체 (2초)

**연출 의도:** 순위 판도가 바뀌었음을 알리는 짧은 전환.

**PROMPT:**
> At the top of a ship's mast, a navy pirate flag is swiftly pulled down and a new golden flag with an abstract crown emblem is hoisted, unfurling dramatically in the wind against the moon. Ends on the golden flag fully unfurled and fluttering.

**포스터:** 돛대 꼭대기에서 펄럭이는 금빛 깃발

**자막(앱):** "선두 교체! {이름} 1위"

---

### 11. `victory` — 우승 (4초)

**연출 의도:** 게임 전체의 마무리. 가장 화려하게. 기존 `winner.png` 일러스트로 자연스럽게 이어지면 좋습니다.

**PROMPT:**
> Night harbor celebration: golden fireworks burst over the sea; the ship's cannons fire bursts of gold confetti; the camera pushes in on an open treasure chest overflowing with coins, flanked by golden laurel branches; the friendly crowned Skull King rises from behind the chest and gives a big cheerful salute. Ends in a composition matching the winner illustration: crowned skull above the treasure chest within gold laurels, sparks twinkling.

**포스터:** 영상의 마지막 장면. 기존 `winner` 일러스트를 그대로 쓰려면 `assets/illustrations/winner.webp`를 `assets/cutscenes/victory.webp`로 복사하세요. (종료 화면에도 같은 그림이 나오므로 별도 제작을 권장)

**자막(앱):** "{이름} 우승! {점수}점"

---

## 4. 제작 우선순위 제안

한 번에 다 만들기 어려우면 이 순서로 만드세요. 앞쪽이 체감 효과가 큽니다.

1. `victory` — 모든 게임에서 반드시 1번 나옴
2. `mermaid-vs-king`, `king-vs-pirates` — 스컬킹다운 명장면
3. `voyage-start`, `final-round` — 게임 흐름의 시작과 클라이맥스
4. 나머지

파일이 없는 컷신은 앱에서 자동으로 생략되므로, 만든 것부터 하나씩 넣어도 됩니다.

## 5. 넣은 파일 확인하기

앱의 **홈 → 설정 → 컷신 미리보기**에서 컷신마다 ▶ 재생을 누르면 예시 자막과 함께 바로 볼 수 있습니다.
영상이 있으면 영상, 포스터만 있으면 포스터(천천히 확대), 둘 다 없으면 점선 자리표시가 나옵니다.

- 관련 코드: `js/cutscenes.js` (목록, 발동 조건, 재생기)
- 영상 준비가 2.5초 안에 끝나지 않으면(느린 네트워크) 포스터로 대신 보여줍니다.
- 요-호-호 영상이 없거나 컷신을 끄면, 기존처럼 글자 카운트다운이 나옵니다.
