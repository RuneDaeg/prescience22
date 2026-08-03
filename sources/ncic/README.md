# NCIC 공식 교육과정 PDF

이 폴더는 Topic Pick의 핵심 키워드를 2022 개정 교육과정 `내용 체계` 표에서 추출하기 위한
공식 원문 수집 기록을 보관합니다.

## 수집 범위

- NCIC에 게시된 현행 2022 개정 초·중등학교 교육과정 PDF 38개
- 국가교육위원회 고시 제2026-1호로 갱신된 총론·중학교·고등학교 교육과정
- 국가교육위원회 고시 제2024-3호와 교육부 고시 제2022-33호의 교과별 별책
- 총 파일 크기 약 210MB

## 다시 받기

```bash
npm run collect:ncic
```

수집기는 NCIC 세션과 CSRF 토큰을 받아 공식 첨부파일을 내려받고, 원본 온톨로지 저장소의
고정된 커밋에 기록된 파일 크기와 SHA-256을 대조합니다. 이미 검증된 파일은 다시 받지 않습니다.
강제로 새로 받으려면 다음 명령을 사용합니다.

```bash
node scripts/collect-ncic-pdfs.mjs --refresh
```

## 파일 관리

- 실제 PDF: `sources/ncic/files/` — 대용량 공식 원문이므로 Git에서 제외
- 검증 기록: `sources/ncic/collection-receipts.json` — Git에 포함
- 수집 코드: `scripts/collect-ncic-pdfs.mjs`

공식 PDF의 저작권과 이용 조건은 원 발행기관에 있습니다. PDF를 재배포하지 않고 필요한
내용 요소를 출처와 함께 파생 데이터로 정리합니다.
