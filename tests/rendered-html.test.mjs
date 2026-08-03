import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

test("server-renders the Topic Pick classroom tool", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Topic Pick \| 전 과목 10분 탐구, 1분 설명<\/title>/i);
  assert.match(html, /TOPIC PICK/);
  assert.match(html, /모든 과목을/);
  assert.match(html, /과목 \+ 주제 한 번에 뽑기/);
  assert.match(html, /중학교/);
  assert.match(html, /고등학교/);
  assert.match(html, /공통국어1/);
  assert.match(html, /키워드 먼저 뽑기/);
  assert.match(html, /내용 요소 키워드/);
  assert.match(html, /공식 지식·이해/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps curriculum provenance and the generated course catalog", async () => {
  const [page, data, notice, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/curriculum-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /CURRICULUM_COURSES/);
  assert.match(page, /topic\.name/);
  assert.match(data, /DECK6\/korean-secondary-learning-map/);
  assert.match(data, /68e62283cfc337e2de643a3cd1b0334e411acf54/);
  assert.match(data, /kr-2022-middle-v0\.5\.0-candidate/);
  assert.match(data, /kr-2022-high-v0\.5\.0-candidate/);
  assert.match(notice, /MIT License/);
  assert.match(notice, /Copyright \(c\) 2026 DECK/);
  assert.match(packageJson, /"sync:curriculum"/);

  const courseCount = (data.match(/"id": "kr\.course\.2022\./g) ?? []).length;
  assert.equal(courseCount, 783);
  assert.match(data, /"sourceLabel": "NCIC · kr-nec-2024-3-annex9 · p\.82"/);
  assert.match(data, /"name": "원소 형성"/);
  assert.match(data, /"domain": "교육과정 영역"/);
  assert.doesNotMatch(data, /"standardSummary":/);
  assert.doesNotMatch(data, /비교하여 공통점과 차이점을/);
});
