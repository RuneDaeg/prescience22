# Physics Pick

2022 개정 교육과정의 일반 선택 과목 **물리학**에서 핵심 키워드를 무작위로 뽑고,
학생이 10분 동안 조사한 뒤 1분 동안 설명할 수 있도록 돕는 수업용 웹사이트입니다.

- 운영 사이트: <https://physics-pick-korea.kmo4102.chatgpt.site>
- 기본 브랜치: `main`
- 현재 공개 범위: 소유자 전용 비공개

## 주요 기능

- 물리학 핵심 키워드 15개 무작위 추첨
- `힘과 에너지`, `전기와 자기`, `빛과 물질` 영역별 필터
- 키워드별 설명 질문과 핵심어 제공
- 10분 자료 조사 → 1분 설명 자동 전환 타이머
- 일시정지, 발표 단계 건너뛰기, 다음 라운드
- 모바일·태블릿·교실 화면 대응
- 키보드 단축키: `R` 다시 뽑기, `Space` 타이머 시작·일시정지

## 빠른 실행

필요 환경: Node.js `22.13.0` 이상

```bash
npm ci
npm run dev
```

배포 전 확인:

```bash
npm run build
```

Windows PowerShell에서 환경 변수 형식 때문에 `npm run dev` 또는 `npm run build`가
실행되지 않으면 [개발 문서](./DEVELOPMENT.md)의 Windows 명령을 사용하세요.

## 주요 파일

- `app/page.tsx`: 키워드 데이터, 추첨, 타이머, 전체 화면
- `app/globals.css`: 색상, 레이아웃, 반응형 디자인
- `app/layout.tsx`: 제목, 설명, 공유 미리보기 메타데이터
- `public/og.png`: 링크 공유용 이미지
- `.openai/hosting.json`: Sites 프로젝트 연결 정보

다른 컴퓨터에서 이어서 작업하는 방법과 개발 과정은
[DEVELOPMENT.md](./DEVELOPMENT.md)에 정리되어 있습니다.
