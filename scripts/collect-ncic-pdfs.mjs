import { createHash } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(root, "sources", "ncic", "files");
const receiptPath = join(root, "sources", "ncic", "collection-receipts.json");
const upstreamCommit = "68e62283cfc337e2de643a3cd1b0334e411acf54";
const upstreamBase = `https://raw.githubusercontent.com/DECK6/korean-secondary-learning-map/${upstreamCommit}/sources/official`;
const refresh = process.argv.includes("--refresh");

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "topic-pick-ncic-source-collector/1.0" } });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

async function atomicWrite(path, content) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, path);
}

async function openSession(catalog) {
  const response = await fetch(catalog.sessionPage, {
    headers: { "User-Agent": "topic-pick-ncic-source-collector/1.0" },
  });
  if (!response.ok) throw new Error(`NCIC session page failed: ${response.status}`);
  const html = await response.text();
  const csrf = html.match(/meta name="_csrf" content="([^"]+)"/)?.[1];
  const cookie = response.headers.get("set-cookie")
    ?.split(",")
    .map((part) => part.trim().split(";")[0])
    .join("; ");
  if (!csrf || !cookie) throw new Error("NCIC session did not provide CSRF token and cookies");
  return { csrf, cookie };
}

async function downloadSource(catalog, source, session, destination) {
  const body = new URLSearchParams({
    _csrf: session.csrf,
    filePath: source.filePath,
    fileName: source.storedName,
    fileOrg: source.originalName,
    fileIdx: source.attachmentNo,
    fileTbl: "NCIS_ORG_ATTACH_TYPE",
  });
  const response = await fetch(catalog.downloadEndpoint, {
    method: "POST",
    redirect: "follow",
    headers: {
      Cookie: session.cookie,
      Referer: catalog.sessionPage,
      "User-Agent": "topic-pick-ncic-source-collector/1.0",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-TOKEN": session.csrf,
    },
    body,
  });
  if (!response.ok) throw new Error(`${source.id}: NCIC download failed with ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    throw new Error(`${source.id}: response is not a PDF (${response.headers.get("content-type")})`);
  }
  await atomicWrite(destination, bytes);
  return bytes;
}

async function existingBytes(path) {
  try {
    await stat(path);
    return new Uint8Array(await readFile(path));
  } catch {
    return null;
  }
}

await mkdir(outputDirectory, { recursive: true });
const [catalog, expectedReceipts] = await Promise.all([
  fetchJson(`${upstreamBase}/source-catalog.json`),
  fetchJson(`${upstreamBase}/source-receipts.json`),
]);
const expectedById = new Map(expectedReceipts.sources.map((source) => [source.id, source]));
const session = await openSession(catalog);
const collected = [];

for (const [index, source] of catalog.sources.entries()) {
  const destination = join(outputDirectory, `${source.id}.pdf`);
  const expected = expectedById.get(source.id);
  if (!expected) throw new Error(`${source.id}: expected receipt missing`);
  let bytes = refresh ? null : await existingBytes(destination);
  if (!bytes || sha256(bytes) !== expected.sha256) {
    bytes = await downloadSource(catalog, source, session, destination);
  }
  const actualHash = sha256(bytes);
  if (actualHash !== expected.sha256 || bytes.length !== expected.bytes) {
    throw new Error(`${source.id}: downloaded file does not match the official source receipt`);
  }
  collected.push({
    id: source.id,
    annex: source.annex,
    originalName: source.originalName,
    governingNotice: source.governingNotice,
    attachmentNo: source.attachmentNo,
    bytes: bytes.length,
    pdfPages: expected.pdfPages,
    sha256: actualHash,
    ncicDownloadPage: catalog.sessionPage,
    localFile: `sources/ncic/files/${source.id}.pdf`,
  });
  console.log(`${String(index + 1).padStart(2, "0")}/${catalog.sources.length} 별책 ${source.annex}: ${source.originalName}`);
  if (index < catalog.sources.length - 1) await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));
}

const result = {
  collectedAt: new Date().toISOString(),
  upstreamRepository: "https://github.com/DECK6/korean-secondary-learning-map",
  upstreamCommit,
  ncicDownloadEndpoint: catalog.downloadEndpoint,
  sourceCount: collected.length,
  totalBytes: collected.reduce((sum, source) => sum + source.bytes, 0),
  sources: collected,
};
await mkdir(dirname(receiptPath), { recursive: true });
await atomicWrite(receiptPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`수집 완료: ${result.sourceCount}개 PDF, ${result.totalBytes} bytes`);
