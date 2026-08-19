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
  const [worker, schema, migration] = await Promise.all([
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_add_diagnostic_classes.sql", import.meta.url), "utf8"),
  ]);
  assert.match(worker, /hashToken/);
  assert.match(worker, /ON CONFLICT\(class_id, student_number\)/);
  assert.match(worker, /cache-control/);
  assert.match(schema, /diagnosticClasses/);
  assert.match(schema, /diagnosticSubmissions/);
  assert.match(migration, /idx_diagnostic_submissions_class_student/);
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
  assert.match(submissionRoute, /getFirstGradeCohortAnalytics/);
  assert.match(vercel, /build:vercel/);
});

test("shows anonymized first-grade averages on teacher dashboards", async () => {
  const [analytics, teacherPage, worker] = await Promise.all([
    readFile(new URL("../lib/diagnostic-analytics.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/teacher/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(analytics, /isFirstGradeClassName/);
  assert.match(analytics, /questionRates/);
  assert.match(teacherPage, /1학년 전체 평균/);
  assert.match(teacherPage, /1학년 전체/);
  assert.match(worker, /calculateCohortAnalytics/);
});
