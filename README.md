# Topic Pick

2022 개정 교육과정의 중학교·고등학교 과목을 선택하고 공식 내용 체계의 `지식·이해` 요소를 무작위로 뽑아,
학생이 10분 동안 조사한 뒤 1분 동안 설명하도록 돕는 수업용 웹사이트입니다.

- 운영 사이트: <https://physics-pick-korea.kmo4102.chatgpt.site>
- 기본 브랜치: `main`
- 현재 공개 범위: 소유자 전용 비공개

## 주요 기능

- 중학교 24과목과 고등학교 759과목 전체 지원(직업계 전문교과 포함)
- 전체 과목에서 과목과 주제를 한 번에 무작위로 뽑는 기능
- 학교급 → 교과군 → 과목 선택
- 선택한 과목의 공식 `지식·이해` 내용 요소에서 짧은 명사형 키워드를 무작위로 추첨
- 공식 내용 요소가 아직 연결되지 않은 과목은 교육과정 영역명을 안전하게 사용
- 키워드와 NCIC 원문 문서·페이지 출처를 함께 표시
- 10분 자료 조사 → 1분 설명 자동 전환 타이머
- 일시정지, 발표 단계 건너뛰기, 다음 라운드
- 모바일·태블릿·교실 화면 대응
- 키보드 단축키: `R` 다시 뽑기, `Space` 타이머 시작·일시정지

## 교육과정 데이터

과목 및 영역 구조는 MIT 라이선스의
[DECK6/korean-secondary-learning-map](https://github.com/DECK6/korean-secondary-learning-map)에서
가져온 후보 데이터입니다. 공식 승인 제품이 아니며 과목 개설, 선수 관계 또는 진로 적합성을
판단하는 용도로 사용하지 않습니다. 키워드는 NCIC에서 수집한 2022 개정 교과별 교육과정 PDF의
학년(군)별 내용 요소 중 `지식·이해` 항목을 사용합니다. 자세한 수집 기록은
[`sources/ncic/README.md`](./sources/ncic/README.md), 라이선스 고지는 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)를 참고하세요.

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

Windows PowerShell에서 환경 변수 형식 때문에 명령이 실행되지 않으면
[개발 문서](./DEVELOPMENT.md)의 Windows 명령을 사용하세요.

## 주요 파일

- `app/page.tsx`: 과목 선택, 추첨, 타이머, 전체 화면
- `app/curriculum-data.ts`: 생성된 과목·영역 데이터
- `scripts/sync-curriculum.mjs`: 원본 저장소에서 데이터를 갱신하는 스크립트
- `scripts/extract-ncic-content-elements.py`: 공식 PDF에서 `지식·이해` 내용 요소 추출
- `sources/ncic/content-elements.json`: 검증 후 사이트에 반영하는 공식 내용 요소
- `app/globals.css`: 색상, 레이아웃, 반응형 디자인
- `app/layout.tsx`: 제목, 설명, 공유 미리보기 메타데이터
- `public/og.png`: 링크 공유용 이미지
- `.openai/hosting.json`: Sites 프로젝트 연결 정보

다른 컴퓨터에서 이어서 작업하는 방법과 개발 과정은
[DEVELOPMENT.md](./DEVELOPMENT.md)에 정리되어 있습니다.
