import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the student diagnostic entry", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>PRE:SCIENCE \| 통합과학2 선개념 진단<\/title>/i);
  assert.match(html, /통합과학2 선개념 진단/);
  assert.match(html, /학급에 들어가기/);
  assert.match(html, /변화와 다양성/);
  assert.match(html, /환경과 에너지/);
  assert.match(html, /과학과 미래 사회/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the teacher studio", async () => {
  const response = await render("/teacher");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /TEACHER STUDIO/);
  assert.match(html, /새 학급 만들기/);
  assert.match(html, /기존 학급 열기/);
  assert.match(html, /학교 대표 교사/);
});

test("server-renders the school representative studio", async () => {
  const response = await render("/school");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /SCHOOL STUDIO/);
  assert.match(html, /학교 그룹 만들기/);
  assert.match(html, /반별 상세 응답/);
});

test("covers all 15 Integrated Science 2 achievement standards with two questions each", async () => {
  const questions = await readFile(new URL("../app/questions.ts", import.meta.url), "utf8");
  const standards = questions.match(/10통과2-\d{2}-\d{2}/g) ?? [];
  assert.equal(standards.length, 30);
  assert.equal(new Set(standards).size, 15);
  for (const standard of new Set(standards)) {
    assert.equal(standards.filter((value) => value === standard).length, 2, `${standard} should have exactly two questions`);
  }
  assert.match(questions, /필요에 의해 변이가 발생함/);
  assert.match(questions, /오존층 파괴를 지구온난화의 직접 원인/);
  assert.match(questions, /빅데이터는 항상 객관적이고 정확함/);
  assert.match(questions, /SSI와 과학 윤리/);
});

test("balances scientific answer positions across the diagnostic", async () => {
  const questions = await readFile(new URL("../app/questions.ts", import.meta.url), "utf8");
  const questionBlocks = [...questions.matchAll(/id: "[^"]+", standard: "10통과2-[^"]+", domain: "[^"]+",[\s\S]*?options: \[\s*([\s\S]*?)\s*\],\s*\},/g)];
  const answers = questionBlocks.map((block) => {
    const options = [...block[1].matchAll(/\{ id: "([a-d])", text: .*kind: "(scientific|misconception|partial)" \}/g)];
    assert.equal(options.length, 4);
    assert.equal(new Set(options.map((option) => option[1])).size, 4);
    return "abcd"[options.findIndex((option) => option[2] === "scientific")];
  });
  const counts = Object.fromEntries(["a", "b", "c", "d"].map((id) => [id, answers.filter((answer) => answer === id).length]));

  assert.equal(answers.length, 30);
  assert.deepEqual(counts, { a: 8, b: 8, c: 7, d: 7 });
  assert.doesNotMatch(answers.join(""), /(a{3}|b{3}|c{3}|d{3})/);
});

test("stores classroom submissions with protected teacher access", async () => {
  const [worker, schema, migration, schoolMigration] = await Promise.all([
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_add_diagnostic_classes.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0002_add_school_groups.sql", import.meta.url), "utf8"),
  ]);
  assert.match(worker, /hashToken/);
  assert.match(worker, /ON CONFLICT\(class_id, student_number\)/);
  assert.match(worker, /cache-control/);
  assert.match(schema, /diagnosticClasses/);
  assert.match(schema, /diagnosticSubmissions/);
  assert.match(migration, /idx_diagnostic_submissions_class_student/);
  assert.match(schema, /schoolGroups/);
  assert.match(schoolMigration, /school_groups/);
  assert.match(worker, /handleSchoolDashboard/);
});

test("provides Firebase-backed Next.js routes for Vercel", async () => {
  const [firebaseAdmin, diagnosticApi, classRoute, submissionRoute, vercel] = await Promise.all([
    readFile(new URL("../lib/firebase-admin.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/diagnostic-api.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/classes/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/classes/[code]/submissions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ]);
  assert.match(firebaseAdmin, /FIREBASE_PROJECT_ID/);
  assert.match(firebaseAdmin, /firebase-admin\/firestore/);
  assert.match(diagnosticApi, /diagnosticClasses/);
  assert.match(diagnosticApi, /teacherTokenHash/);
  assert.match(classRoute, /createDiagnosticClass/);
  assert.match(submissionRoute, /validateAnswers/);
  assert.match(submissionRoute, /getClassCohortAnalytics/);
  assert.match(vercel, /build:vercel/);
});

test("shows anonymized school-grade averages on teacher dashboards", async () => {
  const [analytics, teacherPage, worker] = await Promise.all([
    readFile(new URL("../lib/diagnostic-analytics.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/teacher/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(analytics, /isFirstGradeClassName/);
  assert.match(analytics, /questionRates/);
  assert.match(teacherPage, /같은 학교·학년 평균/);
  assert.match(teacherPage, /같은 학교·학년/);
  assert.match(worker, /calculateCohortAnalytics/);
});

test("teacher dashboards expose question choices and explanations", async () => {
  const [teacherPage, schoolPage, modal, questions, explanations] = await Promise.all([
    readFile(new URL("../app/teacher/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/school/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/question-detail-modal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/questions.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/question-explanations.ts", import.meta.url), "utf8"),
  ]);
  assert.match(teacherPage, /QuestionDetailModal/);
  assert.match(schoolPage, /QuestionDetailModal/);
  assert.match(modal, /question-option-details/);
  assert.match(modal, /과학적 개념 선택지는/);
  assert.match(modal, /핵심 원리/);
  assert.match(modal, /정답 근거/);
  assert.match(modal, /optionNotes/);
  assert.match(modal, /aria-modal="true"/);

  const questionIds = [...questions.matchAll(/id: "([^"]+)", standard:/g)].map((match) => match[1]);
  assert.equal(questionIds.length, 30);
  assert.equal((explanations.match(/^    whyCorrect:/gm) ?? []).length, 30);
  assert.equal((explanations.match(/^    optionNotes:/gm) ?? []).length, 30);
  for (const id of questionIds) {
    assert.ok(
      explanations.includes(`  "${id}": {`) || explanations.includes(`  ${id}: {`),
      `${id} should have a detailed explanation`,
    );
  }
});

test("teacher dashboards provide student-by-student answer details", async () => {
  const [teacherPage, styles] = await Promise.all([
    readFile(new URL("../app/teacher/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(teacherPage, /selectedSubmissionId/);
  assert.match(teacherPage, /학생별 상세 응답/);
  assert.match(teacherPage, /학생 선택/);
  assert.match(teacherPage, /selectedSubmission\.answers\[question\.id\]/);
  assert.match(teacherPage, /setSelectedQuestion\(question\)/);
  assert.match(teacherPage, /<details className="panel student-response-panel">/);
  assert.match(teacherPage, /<summary className="panel-title student-response-heading student-response-toggle">/);
  assert.match(teacherPage, /30문항 펼치기·접기/);
  assert.doesNotMatch(teacherPage, /<details className="panel student-response-panel" open/);
  assert.match(styles, /\.student-answer-row/);
  assert.match(styles, /\.student-answer-row\.scientific/);
  assert.match(styles, /\.student-response-panel\[open\] \.student-response-toggle/);
  assert.match(styles, /\.student-response-toggle-label/);
});

test("top classroom preconceptions include pre-instruction teaching guidance", async () => {
  const [questions, teacherPage, guidance, styles] = await Promise.all([
    readFile(new URL("../app/questions.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/teacher/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/preinstruction-guidance.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const questionIds = [...questions.matchAll(/id: "([^"]+)", standard:/g)].map((match) => match[1]);

  assert.equal(questionIds.length, 30);
  assert.equal((guidance.match(/^    shift:/gm) ?? []).length, 30);
  assert.equal((guidance.match(/^    activity:/gm) ?? []).length, 30);
  assert.equal((guidance.match(/^    prompt:/gm) ?? []).length, 30);
  assert.equal((guidance.match(/^    check:/gm) ?? []).length, 30);
  for (const id of questionIds) {
    assert.ok(
      guidance.includes(`  "${id}": {`) || guidance.includes(`  ${id}: {`),
      `${id} should have pre-instruction teaching guidance`,
    );
  }
  assert.match(teacherPage, /PREINSTRUCTION_GUIDANCE/);
  assert.match(teacherPage, /통합과학2 수업 전/);
  assert.match(teacherPage, /수업 전 지도 방안/);
  assert.match(teacherPage, /사고 전환/);
  assert.match(teacherPage, /첫 활동/);
  assert.match(teacherPage, /학생에게 던질 질문/);
  assert.match(teacherPage, /빠른 확인/);
  assert.match(styles, /\.teaching-guidance/);
  assert.match(styles, /\.guidance-grid/);
  assert.match(styles, /\.dashboard-grid>\* \{ min-width:0; \}/);
  assert.match(styles, /grid-template-columns:minmax\(0,1fr\)/);
});
