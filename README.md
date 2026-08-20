# PRE:SCIENCE

2022 개정 교육과정 「통합과학2」를 아직 배우지 않은 학생의 선개념을 조사하고, 교사가 학급·학교 단위의 응답을 수업 설계에 활용할 수 있도록 만든 웹앱입니다.

- 운영 사이트: [https://prescience22-seven.vercel.app](https://prescience22-seven.vercel.app)
- 교사 화면: [https://prescience22-seven.vercel.app/teacher](https://prescience22-seven.vercel.app/teacher)
- 학교 대표 교사 화면: [https://prescience22-seven.vercel.app/school](https://prescience22-seven.vercel.app/school)
- 커뮤니티 게시용 소개 글: [COMMUNITY_POST.md](./COMMUNITY_POST.md)

이 진단은 시험 점수를 산출하기 위한 도구가 아닙니다. 학생이 현재 가진 설명 모형을 확인하고, 이후 수업에서 `예측 → 증거 확인 → 설명 수정`의 흐름을 설계하기 위한 수업 전 진단 도구입니다.

## 현재 구현된 기능

### 학생

- 이름과 학번만 입력하여 학급에 참여
- 15개 성취기준에 2문항씩 배치된 총 30문항 응답
- 과학적 개념, 부분 개념, 선개념을 구분하는 선택지 구성
- 제출 후 점수나 정답을 공개하지 않아 수업 전 진단의 성격 유지
- 같은 학급에서 같은 학번으로 다시 제출하면 기존 응답 갱신

### 학급 교사

- 학급 이름을 입력하여 학생용 링크와 교사용 비밀 링크 생성
- 제출 인원과 학급 전체 과학적 개념 응답률 확인
- 같은 학교·학년의 익명화된 전체 평균과 문항별 평균 비교
- 학급에서 가장 자주 나타난 선개념 5개 확인
- 주요 선개념별 수업 전 지도 방안 제공
  - 유도할 사고 전환
  - 첫 수업 활동
  - 학생에게 던질 질문
  - 빠른 확인 방법
- 학생별 30문항 상세 응답 확인
- 긴 학생별 응답 영역 펼치기·접기
- 문항별 선택지 반응 분포와 선택지별 인원 확인
- 문항을 눌러 정답 근거, 핵심 원리, 선택지별 상세 해설 확인

### 학교 대표 교사

- 학교 그룹 생성 및 학교 이름 관리
- 여러 학급을 한꺼번에 생성
- 기존 학급을 학교 그룹에 연결
- 학교 전체 및 반별 응답 현황 확인
- 학교에 속한 다른 학급의 상세 응답 확인
- 학급별 학생 수와 과학적 개념 응답률 비교

## 진단 내용

문항은 2022 개정 교육과정 통합과학2의 15개 성취기준을 모두 다룹니다.

| 영역 | 성취기준 수 | 문항 수 | 주요 내용 |
| --- | ---: | ---: | --- |
| 변화와 다양성 | 5 | 10 | 지질시대, 진화, 산화·환원, 산·염기, 에너지 출입 |
| 환경과 에너지 | 6 | 12 | 생태계, 생태계 평형, 기후 변화, 태양 에너지, 발전, 에너지 효율 |
| 과학과 미래 사회 | 4 | 8 | 감염병, 빅데이터, 인공지능·사물인터넷, 과학 윤리·SSI |

각 선택지는 다음 세 종류 중 하나로 분류됩니다.

| `kind` | 의미 | 대시보드에서의 해석 |
| --- | --- | --- |
| `scientific` | 성취기준에 부합하는 과학적 개념 | 과학적 개념 응답 |
| `partial` | 일부는 맞지만 적용 범위나 원리가 불완전한 생각 | 부분 개념 |
| `misconception` | 학생에게 흔히 나타날 수 있는 비과학적 설명 모형 | 선개념 |

문항의 목적은 교과서 세부 내용을 미리 암기했는지 확인하는 것이 아니라, 일상 경험과 이전 학습에서 형성된 생각을 드러내는 것입니다.

## 사용 흐름

1. 교사가 `/teacher`에서 학급을 만듭니다.
2. 생성된 학생용 링크를 학생에게 공유합니다.
3. 교사용 링크는 응답을 볼 수 있는 비밀 링크이므로 교사만 보관합니다.
4. 학생은 이름과 학번을 입력하고 30문항에 응답합니다.
5. 교사는 주요 선개념, 학생별 응답, 문항별 분포를 확인합니다.
6. 학교 단위 관리가 필요하면 대표 교사가 `/school`에서 학교 그룹과 여러 학급을 생성합니다.

## 기술 구성

- Next.js 16 App Router
- React 19, TypeScript
- Firebase Admin SDK + Cloud Firestore: Vercel 운영 데이터 저장
- Vercel Git 연동: GitHub `main` 브랜치 자동 배포
- vinext + Cloudflare D1: OpenAI Sites 호환 배포 경로
- 자체 CSS 기반 반응형 학생·교사 대시보드
- Node.js 22

### 배포별 서버 경로

| 환경 | API 구현 | 데이터 저장소 |
| --- | --- | --- |
| Vercel / 로컬 Next.js | `app/api/**` | Firebase Firestore |
| OpenAI Sites / vinext | `worker/index.ts` | Cloudflare D1 |

현재 공개 운영 사이트는 Vercel과 Firebase를 사용합니다.

## 데이터와 접근 보안

Vercel 배포에서는 다음 Firestore 컬렉션을 사용합니다.

```text
diagnosticClasses/{classCode}
  submissions/{studentNumberHash}

schoolGroups/{schoolCode}
```

- 학생 이름, 학번, 선택한 답, 제출 시각이 저장됩니다.
- 같은 학번의 문서 ID에는 학번 원문 대신 SHA-256 해시를 사용합니다.
- 교사용 키와 학교 대표 키는 원문이 아니라 SHA-256 해시로 저장합니다.
- 교사용·학교 대표 링크의 `key` 값은 응답 조회 권한을 가지므로 외부에 공개하면 안 됩니다.
- Firebase 서비스 계정 비공개 키는 클라이언트에 전달되지 않고 서버에서만 사용됩니다.
- 실제 학교에서 운영할 때는 학교의 개인정보 처리 기준에 맞춰 학생과 보호자에게 수집 목적과 보관 기간을 안내해야 합니다.

## 로컬 실행

### 1. 저장소 받기

```bash
git clone https://github.com/RuneDaeg/prescience22.git
cd prescience22
npm ci
```

### 2. Firebase 환경변수 설정

프로젝트 루트에 `.env.local`을 만들고 다음 값을 입력합니다.

```dotenv
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

- `FIREBASE_CLIENT_EMAIL`에는 개인 이메일이 아니라 Firebase 서비스 계정 JSON의 `client_email` 값을 사용합니다.
- `FIREBASE_PRIVATE_KEY`에는 같은 JSON의 `private_key` 값을 사용합니다.
- 비공개 키의 줄바꿈은 실제 줄바꿈 또는 `\n` 문자열 형식을 모두 사용할 수 있습니다.
- `.env.local`은 `.gitignore`에 포함되어 있으므로 Git에 커밋하지 않습니다.

### 3. Next.js 개발 서버 실행

Firebase를 사용하는 Vercel과 같은 방식으로 확인하려면 다음 명령을 사용합니다.

```bash
npm exec next dev
```

OpenAI Sites용 vinext 환경을 확인하려면 다음 명령을 사용합니다.

```bash
npm run dev
```

### 4. 검증

```bash
npm run lint
npm run build:vercel
npm test
```

`npm test`는 vinext 배포 빌드와 화면·문항·데이터 구조 회귀 테스트를 함께 실행합니다.

## Firebase 연결 방법

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트를 만듭니다.
2. Firestore Database를 생성합니다.
3. 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성에서 서비스 계정 JSON을 받습니다.
4. JSON의 `project_id`, `client_email`, `private_key`를 각각 환경변수에 넣습니다.
5. JSON 파일 자체와 비공개 키는 저장소에 올리지 않습니다.

Firebase Admin SDK는 서버 권한으로 Firestore에 접근하므로, 이 프로젝트에서는 학생 브라우저에 Firebase 클라이언트 설정값을 노출할 필요가 없습니다.

## Vercel 배포 방법

1. Vercel에서 이 GitHub 저장소를 새 프로젝트로 가져옵니다.
2. Framework Preset은 Next.js, Root Directory는 저장소 루트로 둡니다.
3. Vercel 프로젝트의 Environment Variables에 아래 세 값을 등록합니다.
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. Production, Preview, Development 중 사용할 환경에 체크합니다.
5. 배포하거나 Redeploy를 실행합니다.

`vercel.json`이 `npm run build:vercel`을 빌드 명령으로 지정합니다. GitHub `main`에 push하면 Vercel Git 연동이 새 운영 배포를 시작합니다.

## 주요 파일

| 파일 | 역할 |
| --- | --- |
| `app/page.tsx` | 학생 입장, 신원 입력, 문항 응답, 제출 완료 화면 |
| `app/teacher/page.tsx` | 학급 생성, 교사 로그인, 학급·학생·문항 분석 |
| `app/school/page.tsx` | 학교 그룹과 여러 학급 관리, 학교 단위 분석 |
| `app/questions.ts` | 문항, 성취기준, 영역, 선택지, 선개념 분류 |
| `app/question-explanations.ts` | 핵심 원리, 정답 근거, 선택지별 해설 |
| `app/preinstruction-guidance.ts` | 선개념별 수업 전 지도 방안 |
| `app/components/question-detail-modal.tsx` | 교사용 문항·해설 팝업 |
| `lib/diagnostic-api.ts` | Firebase 학급·학교·응답 저장과 조회 |
| `lib/diagnostic-analytics.ts` | 학급·학교 평균과 문항별 응답률 계산 |
| `lib/firebase-admin.ts` | Firebase 서비스 계정 초기화 |
| `app/api/**` | Vercel용 API Route Handlers |
| `worker/index.ts` | OpenAI Sites용 API와 D1 처리 |
| `db/schema.ts` | D1 데이터베이스 스키마 |
| `drizzle/` | Sites용 데이터베이스 마이그레이션 |
| `tests/rendered-html.test.mjs` | 화면, 문항, 해설, 데이터 구조 회귀 테스트 |
| `app/globals.css` | 전체 UI와 모바일 반응형 스타일 |
| `app/layout.tsx` | 사이트 제목, 설명, 공유 이미지 메타데이터 |

## 다른 과목의 선개념 진단으로 바꾸기

이 코드는 문항 데이터와 화면·분석 로직이 분리되어 있어 다른 과목용 진단의 기반으로 사용할 수 있습니다. 기존 통합과학2 운영 데이터와 섞이지 않도록 **새 GitHub 저장소, 새 Firebase 프로젝트, 새 Vercel 프로젝트로 복제하는 방식**을 권장합니다.

현재 데이터 구조에는 `assessmentVersion`이나 `subjectId`가 없습니다. 같은 Firebase 프로젝트에서 문항만 바꾸면 과거 학급의 답안과 새 문항 ID가 맞지 않을 수 있습니다.

### 1. 새 과목의 진단 설계

먼저 다음 표를 작성한 뒤 코드를 수정하는 것이 좋습니다.

| 항목 | 작성 내용 |
| --- | --- |
| 성취기준 | 진단하려는 교육과정 코드와 핵심 개념 |
| 예상 선개념 | 학생이 수업 전에 가질 수 있는 설명 모형 |
| 관찰 상황 | 일상 경험, 자료, 그림, 짧은 현상 |
| 과학적 개념 선택지 | 성취기준에 부합하는 설명 |
| 매력적인 오답 | 정개념과 비슷하지만 핵심 원리나 적용 범위가 다른 설명 |
| 지도 방안 | 예측, 증거 확인, 설명 수정 활동 |

선개념 진단은 교과서 문장을 얼마나 외웠는지 묻기보다, 학생이 익숙한 현상을 어떤 원리로 설명하는지 묻는 문항이 적합합니다.

### 2. `app/questions.ts` 수정

`DiagnosticQuestion`의 `domain` 타입을 새 과목의 영역으로 바꾸고 `QUESTIONS` 배열을 교체합니다.

```ts
export type DiagnosticQuestion = {
  id: string;
  standard: string;
  domain: "새 과목 영역 1" | "새 과목 영역 2";
  prompt: string;
  context?: string;
  options: QuestionOption[];
};

export const QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "stable-question-id",
    standard: "<성취기준 코드>",
    domain: "새 과목 영역 1",
    prompt: "학생의 생각이 드러나는 현상 중심 질문",
    context: "필요한 경우에만 넣는 짧은 상황 또는 자료 설명",
    options: [
      {
        id: "a",
        text: "그럴듯하지만 핵심 원리가 빠진 설명",
        conception: "진단하려는 선개념 이름",
        kind: "misconception",
      },
      {
        id: "b",
        text: "과학적 개념에 부합하는 설명",
        conception: "과학적 개념 이름",
        kind: "scientific",
      },
      {
        id: "c",
        text: "일부 조건에서만 맞는 불완전한 설명",
        conception: "부분적으로 형성된 개념 이름",
        kind: "partial",
      },
      {
        id: "d",
        text: "다른 유형의 매력적인 오답",
        conception: "다른 선개념 이름",
        kind: "misconception",
      },
    ],
  },
];
```

문항 작성 규칙:

- 문항 `id`는 중복되지 않는 영문 식별자로 만들고 이후에는 가급적 변경하지 않습니다.
- 선택지 `id`는 문항 안에서 중복되지 않게 합니다.
- 문항마다 `scientific` 선택지를 정확히 하나 둡니다.
- 정답 위치가 한 글자에 몰리지 않도록 전체 문항에서 A~D를 고르게 배치합니다.
- 정답만 지나치게 길거나 전문 용어가 많아 눈에 띄지 않게 합니다.
- 하나의 오답에는 가능하면 하나의 핵심 선개념만 담습니다.
- `conception`은 대시보드에 그대로 표시되므로 짧고 구체적으로 씁니다.
- 아직 과목을 배우지 않은 학생도 상황을 이해할 수 있는 표현을 사용합니다.

### 3. 문항 해설 작성

`app/question-explanations.ts`에 모든 문항 `id`와 일치하는 해설을 추가합니다.

```ts
"stable-question-id": {
  core: "이 문항과 관련된 핵심 원리",
  whyCorrect: "과학적 개념 선택지가 옳은 이유",
  optionNotes: {
    a: "A 선택지가 그럴듯하지만 옳지 않은 이유",
    b: "B 선택지가 옳은 이유",
    c: "C 선택지에서 맞는 부분과 부족한 부분",
    d: "D 선택지의 선개념과 수정할 지점",
  },
},
```

`optionNotes`의 키는 `questions.ts`에 있는 선택지 `id`와 모두 일치해야 합니다.

### 4. 수업 전 지도 방안 작성

`app/preinstruction-guidance.ts`에도 모든 문항 `id`를 추가합니다.

```ts
"stable-question-id": {
  shift: "학생의 현재 설명에서 어떤 사고 전환을 유도할지",
  activity: "정답을 먼저 말하지 않고 시작할 짧은 예측·관찰 활동",
  prompt: "학생의 생각과 근거를 드러내는 교사 질문",
  check: "수업 뒤 생각의 변화를 확인할 짧은 문항 또는 출구 티켓",
},
```

새 과목에서도 ‘오개념을 즉시 지적하기’보다 다음 흐름을 권장합니다.

1. 학생이 먼저 결과를 예측합니다.
2. 실험, 자료, 사례 또는 반례를 확인합니다.
3. 처음 생각과 증거가 맞는지 비교합니다.
4. 학생이 자신의 설명을 다시 작성합니다.

### 5. 과목명과 화면 문구 변경

다음 파일에서 `PRE:SCIENCE`, `통합과학2`, 영역명, 문항 수와 예상 시간을 새 진단에 맞게 변경합니다.

- `app/layout.tsx`: 브라우저 제목, 설명, 공유 메타데이터
- `app/page.tsx`: 학생용 소개와 검사 정보
- `app/teacher/page.tsx`: 교사 소개와 수업 전 안내 문구
- `app/school/page.tsx`: 필요한 경우 학교 화면 문구
- `app/globals.css`: 색상과 디자인
- `public/og.png`: 링크 공유 이미지

문항 수를 바꾸면 `app/teacher/page.tsx`의 `30문항 펼치기·접기` 같은 고정 문구도 함께 바꾸거나 `QUESTIONS.length`를 사용하도록 수정합니다.

### 6. 테스트 수정

`tests/rendered-html.test.mjs`에는 현재 통합과학2 구조를 보호하는 검사가 있습니다. 다른 과목으로 바꿀 때 다음 항목을 새 설계에 맞춰 수정합니다.

- 사이트 제목과 화면 문구
- 성취기준 수와 문항 수
- 성취기준별 문항 배치 수
- 정답 위치 분포
- 대표 선개념 문구
- 모든 문항의 해설 존재 여부
- 모든 문항의 지도 방안 존재 여부

수정 후 다음 명령을 모두 통과시킵니다.

```bash
npm run lint
npm run build:vercel
npm test
```

### 7. 새 데이터베이스와 배포 연결

다른 과목용 프로젝트에서는 다음 순서를 권장합니다.

1. 이 저장소를 새 이름으로 복제합니다.
2. 새 Firebase 프로젝트와 Firestore를 만듭니다.
3. 새 Firebase 서비스 계정을 발급합니다.
4. 새 Vercel 프로젝트에 복제한 GitHub 저장소를 연결합니다.
5. 새 Firebase 환경변수 3개를 Vercel에 설정합니다.
6. 교사 화면에서 시험 학급을 하나 만들고 제출·분석 흐름을 확인합니다.
7. 시험 응답을 삭제하거나 새 운영 Firebase 프로젝트로 전환한 뒤 실제 사용을 시작합니다.

## 문항 품질 점검표

- [ ] 아직 해당 과목을 배우지 않은 학생도 질문 상황을 이해할 수 있는가?
- [ ] 단순 암기보다 학생의 설명 모형이 드러나는가?
- [ ] 과학적 개념 선택지가 정확히 하나인가?
- [ ] 오답이 실제 학생에게 나타날 수 있는 생각을 반영하는가?
- [ ] 정개념과 비슷해 보이지만 핵심 원리나 적용 범위가 다른 매력적인 오답이 있는가?
- [ ] 정답의 길이, 어조, 전문 용어가 다른 선택지와 지나치게 다른가?
- [ ] 부정 표현, 이중 부정, 말장난으로 답을 고르게 하지 않았는가?
- [ ] 정답 위치가 특정 글자에 몰리지 않았는가?
- [ ] 해설이 정답만 말하지 않고 각 선택지가 왜 맞거나 부족한지 설명하는가?
- [ ] 지도 방안이 정답 설명보다 예측·관찰·자료 해석·토의를 중심으로 하는가?
- [ ] 동료 교사 검토와 소규모 학생 예비 검사를 거쳤는가?

## Git 작업 흐름

작업 전 최신 코드를 받고 변경 파일을 확인한 뒤 필요한 파일만 커밋합니다.

```bash
git pull --rebase
git status
git diff
git add <수정한 파일>
git commit -m "변경 내용 설명"
git push
```

`.env.local`, Firebase 서비스 계정 JSON, 교사용 링크의 비밀 키는 커밋하지 않습니다.

## 콘텐츠와 재사용 시 유의사항

- 이 저장소에는 교과서 PDF 원문을 포함하지 않습니다.
- 다른 교과서나 자료를 참고해 문항을 만들 때는 원문을 복제하기보다 성취기준과 학생 선개념을 바탕으로 새 문항을 작성합니다.
- 실제 학교 배포 전 문항의 교육과정 적합성, 표현의 명확성, 개인정보 처리 방식을 해당 과목 교사와 함께 검토합니다.
- 저장소에 별도 라이선스를 추가하지 않은 상태에서 외부에 재배포할 경우에는 코드와 콘텐츠의 사용 조건을 저장소 소유자와 먼저 확인합니다.
