import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { conceptsFromContentElement } from "../scripts/concept-extraction.mjs";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Physics Pick classroom tool", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Physics Pick \| 물리학 10분 탐구, 1분 설명<\/title>/i);
  assert.match(html, /PHYSICS PICK/);
  assert.match(html, /물리 개념을/);
  assert.match(html, /물리학 관련 전체 과목에서 뽑기/);
  assert.match(html, /중학교/);
  assert.match(html, /고등학교/);
  assert.match(html, /통합과학1/);
  assert.match(html, /물리학 관련[\s\S]*8[\s\S]*개 과정/);
  assert.match(html, /역학과 에너지/);
  assert.match(html, /전자기와 양자/);
  assert.doesNotMatch(html, /공통국어1/);
  assert.match(html, /키워드 뽑기/);
  assert.match(html, /10분 조사 시작/);
  assert.match(html, /파트/);
  assert.match(html, /내 키워드/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("splits official content elements into one-minute concept keywords", () => {
  assert.deepEqual(
    conceptsFromContentElement("광합성과 세포호흡의 전자 전달계"),
    ["광합성", "세포호흡", "세포호흡의 전자 전달계"],
  );
  assert.deepEqual(
    conceptsFromContentElement("미토콘드리아의 구조와 기능"),
    ["미토콘드리아", "미토콘드리아의 구조", "미토콘드리아의 기능"],
  );
});

test("keeps curriculum provenance and the physics-only course catalog", async () => {
  const [page, physicsData, data, curatedText, notice, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/physics-curriculum-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/curriculum-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../sources/curated-keywords.json", import.meta.url), "utf8"),
    readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PHYSICS_COURSES/);
  assert.match(page, /topic\.name/);
  assert.match(physicsData, /중력에 의한 운동/);
  assert.match(physicsData, /에너지 효율과 신재생에너지/);
  assert.match(physicsData, /고급 물리학/);
  assert.match(physicsData, /물리학 실험/);
  assert.match(physicsData, /전지의 병렬연결/);
  assert.match(physicsData, /저항의 직렬연결/);
  assert.match(physicsData, /물체를 보는 원리/);
  assert.match(physicsData, /물체의 색이 다른 이유/);
  assert.doesNotMatch(physicsData, /자석의 극/);
  assert.match(physicsData, /SI 단위계/);
  assert.match(physicsData, /물질량\(몰\)/);
  assert.match(physicsData, /아날로그 정보/);
  assert.match(physicsData, /반도체의 성질을 이용한 소재/);
  assert.match(physicsData, /충격 완화장치/);
  assert.match(physicsData, /충격량과 스포츠/);
  assert.doesNotMatch(physicsData, /몰질량/);
  assert.match(physicsData, /수소 핵융합/);
  assert.match(physicsData, /질량-에너지 동등성/);
  assert.match(physicsData, /운동 에너지의 전기 에너지 전환/);
  assert.match(physicsData, /신재생에너지 기술/);
  assert.doesNotMatch(physicsData, /지구의 에너지 흐름/);
  assert.doesNotMatch(physicsData, /에너지 효율의 중요성/);
  assert.doesNotMatch(physicsData, /투입 에너지/);
  assert.doesNotMatch(physicsData, /유용한 에너지/);
  assert.match(data, /DECK6\/korean-secondary-learning-map/);
  assert.match(data, /68e62283cfc337e2de643a3cd1b0334e411acf54/);
  assert.match(data, /kr-2022-middle-v0\.5\.0-candidate/);
  assert.match(data, /kr-2022-high-v0\.5\.0-candidate/);
  assert.match(notice, /MIT License/);
  assert.match(notice, /Copyright \(c\) 2026 DECK/);
  assert.match(packageJson, /"sync:curriculum"/);

  const courseCount = (data.match(/"id": "kr\.course\.2022\./g) ?? []).length;
  assert.equal(courseCount, 72);
  assert.match(data, /"sourceLabel": "NCIC · kr-nec-2024-3-annex9 · p\.82"/);
  assert.match(data, /"name": "원소 형성"/);
  assert.match(data, /"domain": "교육과정 영역"/);
  assert.doesNotMatch(data, /"standardSummary":/);
  assert.doesNotMatch(data, /비교하여 공통점과 차이점을/);

  const curated = JSON.parse(curatedText);
  const physics = curated.courses.find((course) => course.course === "물리학");
  const keywords = physics.sections.flatMap((section) => section.keywords);
  assert.ok(keywords.includes("충격량과 운동량의 관계"));
  assert.ok(keywords.includes("전자기 유도"));
  assert.ok(keywords.includes("시간 팽창"));
  assert.ok(!keywords.includes("전기 안전"));
  assert.ok(!keywords.includes("전기 신호 입력 장치"));
  assert.ok(!keywords.includes("열역학 제2법칙"));

  const chemistry = curated.courses.find((course) => course.course === "화학");
  const chemistryKeywords = chemistry.sections.flatMap((section) => section.keywords);
  assert.ok(chemistryKeywords.includes("르샤틀리에 원리"));
  assert.ok(chemistryKeywords.includes("중화 적정"));
  assert.ok(!chemistryKeywords.includes("용액의 희석"));
  assert.ok(!chemistryKeywords.includes("용액 제조"));
  assert.ok(!chemistryKeywords.includes("미지 용액"));
  assert.ok(!chemistryKeywords.includes("미지 용액의 농도"));
  assert.ok(!chemistryKeywords.includes("뷰렛"));
  assert.ok(!chemistryKeywords.includes("피펫"));
  assert.ok(!chemistryKeywords.includes("부피 플라스크"));

  const biology = curated.courses.find((course) => course.course === "생명과학");
  const biologyKeywords = biology.sections.flatMap((section) => section.keywords);
  assert.ok(biologyKeywords.includes("유전자 재조합"));
  assert.ok(biologyKeywords.includes("3역 분류 체계"));
  assert.ok(biologyKeywords.includes("계통수의 가지점"));
  assert.ok(!biologyKeywords.includes("유전적 재조합"));
  assert.ok(!biologyKeywords.includes("역"));
  assert.ok(!biologyKeywords.includes("계"));
  assert.ok(!biologyKeywords.includes("문"));

  const earthScience = curated.courses.find((course) => course.course === "지구과학");
  const earthScienceKeywords = earthScience.sections.flatMap((section) => section.keywords);
  assert.ok(earthScienceKeywords.includes("엘니뇨-남방진동"));
  assert.ok(earthScienceKeywords.includes("동일과정의 원리"));
  assert.ok(earthScienceKeywords.includes("H-R도"));
  assert.ok(earthScienceKeywords.includes("허블-르메트르 법칙"));
  assert.ok(!earthScienceKeywords.includes("천구 좌표계"));
  assert.ok(!earthScienceKeywords.includes("표준 우주 모형"));
  assert.ok(!earthScienceKeywords.includes("핵반응 메커니즘"));

  const integratedSocial = curated.courses.find((course) => course.course === "통합사회1");
  const integratedSocialKeywords = integratedSocial.sections.flatMap((section) => section.keywords);
  assert.equal(integratedSocial.sections.length, 13);
  assert.ok(integratedSocialKeywords.includes("역사적 배경과 시대적 맥락"));
  assert.ok(integratedSocialKeywords.includes("인간 중심주의와 생태 중심주의의 차이"));
  assert.ok(integratedSocialKeywords.includes("문화 상대주의와 보편윤리의 조화"));
  assert.ok(integratedSocialKeywords.includes("정보화와 공간적 제약의 감소"));
  assert.ok(integratedSocialKeywords.includes("지역의 지속가능성"));
  assert.match(page, /topic-pick-custom-keywords-v1/);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /교사 직접 추가 · 이 기기 저장/);
  assert.match(page, /브라우저에만 저장/);
});
