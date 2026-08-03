# Topic Pick 개발 및 인수인계 문서

이 문서는 다른 노트북이나 데스크톱에서도 프로젝트의 의도와 구조를 빠르게 파악하고,
수정한 내용을 안전하게 Git에 반영할 수 있도록 작성한 기록입니다.

## 1. 프로젝트 목표

수업에서 학생이 여러 교과의 핵심 개념을 단순히 암기하는 대신 짧은 시간 안에 조사하고 자신의
말로 설명하도록 돕는 것이 목표입니다.

기본 활동 흐름은 다음과 같습니다.

1. 학교급, 교과군, 과목을 선택합니다.
2. 선택한 과목의 공식 `지식·이해` 내용 요소에서 짧은 키워드 한 개를 무작위로 뽑습니다.
3. 학생이 10분 동안 정의, 특징, 사례를 조사합니다.
4. 조사 시간이 끝나면 타이머가 자동으로 1분 설명 단계로 바뀝니다.
5. 발표가 끝나면 다음 주제와 다음 라운드를 시작합니다.

## 2. 교육과정 데이터

과목과 영역은 `DECK6/korean-secondary-learning-map`의 `v0.5.0-candidate` 데이터를
정적 파일로 축약해 사용합니다. 중학교 전체 24과목과 고등학교 공통·일반·진로·융합 선택
759과목을 모두 포함하며, 직업계 전문교과도 선택할 수 있습니다.

| 영역 | 키워드 |
| --- | --- |
| 힘과 에너지 | 평형과 안정성, 뉴턴 운동 법칙, 일-에너지 정리, 역학적 에너지 보존, 열과 에너지 전환 |
| 전기와 자기 | 전기장과 전위차, 축전기, 자성체, 전류의 자기 작용, 전자기 유도 |
| 빛과 물질 | 중첩과 간섭, 굴절, 빛과 물질의 이중성, 에너지띠와 반도체, 광속 불변 |

키워드는 NCIC 공식 교과별 교육과정 PDF의 학년(군)별 내용 체계 중 `지식·이해` 열에서 추출합니다.
긴 수행 문장은 제외하고 1분 설명에 알맞은 짧은 명사형 항목만 사용합니다. 공식 항목이 아직
과목 ID와 연결되지 않은 경우에는 성취기준 문장 대신 해당 과목의 교육과정 영역명을 사용합니다.
화면에는 키워드와 원문 PDF의 식별자·페이지를 함께 표시합니다.
원본 데이터와 라이선스 정보는 `THIRD_PARTY_NOTICES.md`에 기록합니다.

## 3. 기술 구성

- React 19
- Next.js 호환 구조
- vinext + Vite
- TypeScript
- Tailwind CSS 4와 프로젝트 전용 CSS
- OpenAI Sites / Cloudflare Workers 호환 배포

별도의 데이터베이스나 런타임 외부 API는 사용하지 않습니다. 과목 데이터는 빌드에 포함되고 모든 주제와 타이머 상태는
브라우저 안에서 관리되므로 개인정보가 저장되지 않습니다.

## 4. 화면과 상태 설계

타이머는 네 가지 상태를 가집니다.

| 상태 | 의미 | 기본 시간 |
| --- | --- | --- |
| `ready` | 주제를 뽑은 뒤 시작 대기 | 10:00 표시 |
| `research` | 자료 조사 진행 | 10분 |
| `present` | 학생 설명 진행 | 1분 |
| `done` | 발표 완료 | 00:00 |

브라우저 탭이 잠시 백그라운드로 이동해도 시간이 크게 어긋나지 않도록 단순히 초를
차감하지 않고 종료 예정 시각(`endAt`)과 현재 시각의 차이를 계산합니다. 조사 종료 시
발표 단계로 자동 전환되며 짧은 알림음이 재생됩니다.

## 5. 폴더 구조

```text
app/
  curriculum-data.ts 생성된 과목·영역 데이터
  globals.css       전체 디자인과 반응형 스타일
  layout.tsx        한국어 문서 설정과 공유 메타데이터
  page.tsx          과목 선택, 주제 추첨, 타이머, 사용자 화면
scripts/
  extract-ncic-content-elements.py 공식 PDF 내용 요소 추출기
  sync-curriculum.mjs 원본 데이터 동기화 스크립트
sources/ncic/
  content-elements.json 사이트에 사용하는 공식 지식·이해 요소
public/
  og.png            SNS·메신저 링크 공유 이미지
.openai/
  hosting.json      Sites 프로젝트 ID와 논리적 리소스 선언
build/
  sites-vite-plugin.ts
worker/
  index.ts          Cloudflare Worker 진입점
```

`dist/`, `.next/`, `node_modules/`, `.wrangler/`는 생성 결과물이므로 Git에 커밋하지 않습니다.

## 6. 다른 컴퓨터에서 시작하기

### 준비물

- Git
- Node.js `22.13.0` 이상
- npm
- 같은 Sites 프로젝트에 접근할 수 있는 Codex 계정

Sites 소스 저장소 주소는 다음과 같습니다. 주소 자체에는 인증 정보가 포함되어 있지 않습니다.

```text
https://git.chatgpt-team.site/5b05309f-f35f-4047-b78a-7cbd03d9abcc/appgprj_6a6f76fc0cf881919f3e77b106020bdf.git
```

Sites 저장소 인증은 만료 시간이 짧은 임시 자격을 사용합니다. 토큰을 이 문서, 원격 URL,
Git 설정 또는 `.env`에 저장하지 마세요. 새 컴퓨터에서 Codex로 프로젝트를 열고
“Sites 저장소에서 최신 `main`을 받아줘”라고 요청하면 새 자격으로 받을 수 있습니다.

일반적인 설치 절차:

```bash
git clone <Sites 저장소 주소> physics-pick
cd physics-pick
npm ci
```

장기간 여러 컴퓨터에서 일반 Git 클라이언트만 사용하려면 별도의 비공개 GitHub 저장소를
백업 원격으로 연결하는 방법이 더 편리합니다. GitHub 저장소를 만들었다면 다음처럼 연결합니다.

```bash
git remote add origin <GitHub 저장소 주소>
git push -u origin main
```

## 7. 로컬 실행

### macOS / Linux

```bash
npm ci
npm run dev
```

### Windows PowerShell

프로젝트의 기본 npm 스크립트는 Unix 환경 변수 문법을 사용합니다. Windows에서 해당
문법 오류가 발생하면 다음 명령을 사용합니다.

```powershell
npm.cmd ci
$env:WRANGLER_LOG_PATH='.wrangler\wrangler.log'
npm.cmd exec vinext dev
```

개발 서버가 출력한 `Local` 주소를 브라우저에서 엽니다.

## 8. 수정할 때 확인할 사항

### 교육과정 데이터 갱신

1. `DECK6/korean-secondary-learning-map`을 별도 폴더에 최신 상태로 받습니다.
2. 프로젝트 루트에서 `node scripts/sync-curriculum.mjs <원본 저장소 경로>`를 실행합니다.
3. 생성된 `app/curriculum-data.ts`와 가져온 커밋·릴리스 정보를 확인합니다.
4. 공식 PDF를 다시 수집했다면 `extract-ncic-content-elements.py`를 실행해 `sources/ncic/content-elements.json`을 갱신합니다.
5. 빌드와 과목 선택 동작을 검증한 뒤 함께 커밋합니다.

생성 파일은 직접 편집하지 않습니다. 공식 내용 요소의 짧은 키워드 필터와 교육과정 영역 대체 규칙은
`scripts/sync-curriculum.mjs`에서 관리합니다. PDF 수집·검증 방법은 `sources/ncic/README.md`를 참고합니다.

### 타이머 수정

- 조사 시간은 `600`초입니다.
- 발표 시간은 `60`초입니다.
- 시간 숫자를 바꿀 때 `setSeconds`, `endAt`, 진행률 계산의 전체 시간도 함께 확인합니다.
- 조사 종료 후 `startPresentation()`이 호출되는 자동 전환을 유지합니다.

### 디자인 수정

- 주요 색상은 `app/globals.css`의 `:root` 변수에서 관리합니다.
- 모바일 기준점은 `900px`, `620px`입니다.
- 발표 단계는 보라색, 완료 단계는 초록색으로 타이머 패널이 바뀝니다.
- 애니메이션은 `prefers-reduced-motion` 설정을 존중해야 합니다.

## 9. 검증

코드를 수정한 뒤 반드시 배포용 빌드를 확인합니다.

macOS / Linux:

```bash
npm run build
```

Windows PowerShell:

```powershell
$env:WRANGLER_LOG_PATH='.wrangler\wrangler.log'
npm.cmd exec vinext build
```

빌드가 성공하면 아래 기능을 직접 확인합니다.

- 중학교·고등학교 전환과 교과군·과목 선택
- 선택한 과목의 주제 추첨
- 연속 추첨 시 같은 주제 반복 방지
- 조사 타이머 시작·정지·재개
- 조사에서 발표로 자동 전환
- 발표 종료와 다음 라운드
- `R`, `Space` 단축키
- 모바일 너비에서 버튼과 타이머가 겹치지 않는지 확인

## 10. Git 작업 흐름

작업을 시작하기 전에 최신 `main`을 받습니다.

```bash
git switch main
git pull --rebase
```

수정 후에는 변경 범위를 확인하고 의미 있는 단위로 커밋합니다.

```bash
git status
git diff
git add <수정한 파일>
git commit -m "변경 내용을 설명하는 메시지"
git push
```

Sites 원격으로 푸시할 때는 임시 쓰기 자격이 필요하므로 Codex에서 “git push 해줘”라고
요청하는 방식이 안전합니다. Codex는 자격을 Git 설정에 저장하지 않고 해당 푸시에만 사용합니다.

주의: **Git push와 사이트 배포는 서로 다른 작업입니다.** 소스만 푸시해도 운영 사이트가
자동으로 바뀌지는 않습니다. 운영 화면까지 갱신하려면 빌드 성공 후 Codex에
“최신 버전을 Sites에 배포해줘”라고 요청합니다.

## 11. 최초 개발 기록

### 2026-08-03

- vinext 기반 Sites 프로젝트 초기화
- 2022 개정 교육과정 물리학 내용 요소 15개 정리
- 영역별 필터와 중복 방지 무작위 추첨 구현
- 키워드별 설명 질문과 핵심어 제공
- 10분 조사와 1분 발표 타이머 구현
- 조사 종료 후 발표 단계 자동 전환 및 알림음 추가
- 교실 프로젝터와 모바일을 고려한 반응형 화면 제작
- 링크 공유용 `og.png` 제작 및 메타데이터 연결
- 빌드 검증 후 Sites에 비공개 배포
- 운영 주소: <https://physics-pick-korea.kmo4102.chatgpt.site>

초기 구현 커밋:

```text
6acb1c8 Build Physics Pick classroom timer
```

### 2026-08-03 — 다과목 확장

- `DECK6/korean-secondary-learning-map` 후보 릴리스 데이터 도입
- 중학교 24과목, 고등학교 759과목 전체 선택 기능 추가
- 전체 과목에서 과목과 주제를 한 번에 무작위로 뽑는 기능 추가
- 학교급·교과군·과목 선택 UI와 과목별 영역 추첨 구현
- 원본 커밋과 릴리스 ID를 생성 데이터에 기록하는 동기화 스크립트 추가
- MIT 라이선스와 후보 데이터의 한계를 제3자 고지에 명시
- Physics Pick을 Topic Pick으로 확장하고 공유 이미지·메타데이터 교체

### 2026-08-03 — 공식 내용 요소 적용

- NCIC의 2022 개정 교과별 교육과정 PDF 38개 수집 기록과 무결성 정보 추가
- 학년(군)별 내용 체계의 `지식·이해` 열에서 키워드를 추출하는 재현 가능한 스크립트 추가
- 긴 성취기준 문장 기반 주제를 짧은 공식 내용 요소 키워드로 교체
- 연결되지 않은 과목은 교육과정 영역명을 사용하도록 대체 규칙 추가

## 12. 다음 개선 후보

- 교사가 조사·발표 시간을 직접 설정하는 기능
- 발표 순서와 학생 이름 관리
- 이미 나온 주제 기록 및 전체 초기화
- 수업용 전체 화면 모드
- 학생들이 함께 접근할 수 있는 공개 또는 허용 목록 기반 공유 설정
- 별도의 비공개 GitHub 백업 원격 연결

새로운 기능을 추가했다면 이 문서의 개발 기록과 관련 사용법도 함께 갱신합니다.
