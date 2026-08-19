# PRE:SCIENCE

2022 개정 교육과정 「통합과학2」 수업 전에 학생의 선개념을 진단하고, 교사가 학급의 응답 경향을 확인하는 웹앱입니다.

## 주요 흐름

- 교사가 학급을 만들면 학생용 링크와 교사용 비밀 링크가 생성됩니다.
- 학생은 학생용 링크에서 이름과 학번만 입력하고 30개 진단 문항에 응답합니다.
- 30개 문항은 `[10통과2-01-01]`부터 `[10통과2-03-04]`까지 15개 성취기준에 2개씩 연결됩니다.
- 교사 대시보드에서 제출 인원, 과학적 개념 응답률, 자주 나타난 선개념, 문항별 선택지 분포를 확인할 수 있습니다.
- 같은 학번으로 다시 제출하면 기존 응답이 최신 응답으로 갱신됩니다.

## 데이터와 접근

Vercel 배포에서는 서버 전용 Firebase Admin SDK를 통해 Firestore에 학급과 응답을 저장합니다. Sites 배포에서는 연결된 D1을 사용합니다. 두 환경 모두 교사용 키는 원문이 아니라 SHA-256 해시로 저장되며, 교사용 링크를 가진 사람만 해당 학급의 응답을 조회할 수 있습니다.

Vercel과 로컬 Next.js 실행에는 다음 값을 환경변수로 설정합니다.

```text
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

각 줄은 `KEY=value` 형식이어야 합니다. `FIREBASE_CLIENT_EMAIL`은 Firebase 서비스 계정 이메일, `FIREBASE_PRIVATE_KEY`는 서비스 계정 JSON에 포함된 PEM 비공개 키를 사용합니다. 비공개 키는 저장소에 커밋하지 않습니다.

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm ci
npm run dev
```

검증:

```bash
npm test
```

## 주요 파일

- `app/page.tsx`: 학생 입장 및 진단 화면
- `app/teacher/page.tsx`: 학급 생성 및 교사 대시보드
- `app/questions.ts`: 30개 진단 문항과 선개념 분류
- `worker/index.ts`: 학급·응답 API와 교사용 키 검증
- `db/schema.ts`: 데이터베이스 스키마
- `drizzle/0001_add_diagnostic_classes.sql`: 배포용 마이그레이션
