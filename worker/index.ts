/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { QUESTIONS } from "../app/questions";
import { calculateCohortAnalytics, isFirstGradeClassName } from "../lib/diagnostic-analytics";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

type TributeRow = { id: string; name: string | null; message: string | null; created_at: number };

async function ensureTributeSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS tributes (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      message TEXT,
      created_at INTEGER NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_tributes_created_at ON tributes (created_at)"),
  ]);
}

async function tributeSnapshot(db: D1Database, cursor?: { createdAt: number; id: string } | null) {
  const messageQuery = cursor
    ? db.prepare(`SELECT id, name, message, created_at FROM tributes
        WHERE message IS NOT NULL AND (created_at < ? OR (created_at = ? AND id < ?))
        ORDER BY created_at DESC, id DESC LIMIT 13`).bind(cursor.createdAt, cursor.createdAt, cursor.id)
    : db.prepare(`SELECT id, name, message, created_at FROM tributes
        WHERE message IS NOT NULL ORDER BY created_at DESC, id DESC LIMIT 13`);
  const [countResult, messageResult] = await db.batch([
    db.prepare("SELECT COUNT(*) AS count FROM tributes"),
    messageQuery,
  ]);
  const count = (countResult.results?.[0] as { count?: number } | undefined)?.count ?? 0;
  const rows = (messageResult.results ?? []) as unknown as TributeRow[];
  const pageRows = rows.slice(0, 12);
  const lastRow = pageRows.at(-1);
  return {
    flowerCount: count,
    messages: pageRows.map((row) => ({ id: row.id, name: row.name ?? "익명의 조문객", message: row.message ?? "", createdAt: row.created_at })),
    nextCursor: rows.length > 12 && lastRow ? `${lastRow.created_at}:${lastRow.id}` : null,
  };
}

async function handleTributes(request: Request, db: D1Database) {
  await ensureTributeSchema(db);

  if (request.method === "GET") {
    const rawCursor = new URL(request.url).searchParams.get("cursor");
    let cursor: { createdAt: number; id: string } | null = null;
    if (rawCursor) {
      const separator = rawCursor.indexOf(":");
      const createdAt = Number(rawCursor.slice(0, separator));
      const id = rawCursor.slice(separator + 1);
      if (separator < 1 || !Number.isSafeInteger(createdAt) || !id) {
        return Response.json({ error: "Invalid cursor" }, { status: 400 });
      }
      cursor = { createdAt, id };
    }
    return Response.json(await tributeSnapshot(db, cursor), { headers: { "cache-control": "no-store" } });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: { allow: "GET, POST" } });
  }

  let body: { name?: unknown; message?: unknown };
  try {
    body = await request.json() as { name?: unknown; message?: unknown };
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 100) : null;
  if (body.message !== undefined && !message) return Response.json({ error: "Message is required" }, { status: 400 });

  await db.prepare("INSERT INTO tributes (id, name, message, created_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), name || null, message || null, Date.now())
    .run();
  return Response.json(await tributeSnapshot(db), { status: 201, headers: { "cache-control": "no-store" } });
}

type DiagnosticClassRow = { id: string; code: string; name: string; teacher_token_hash: string; created_at: number };
type DiagnosticSubmissionRow = { id: string; student_name: string; student_number: string; answers_json: string; completed_at: number };

async function ensureDiagnosticSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS diagnostic_classes (
      id TEXT PRIMARY KEY NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      teacher_token_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_diagnostic_classes_code ON diagnostic_classes (code)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS diagnostic_submissions (
      id TEXT PRIMARY KEY NOT NULL,
      class_id TEXT NOT NULL REFERENCES diagnostic_classes(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      student_number TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      completed_at INTEGER NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_diagnostic_submissions_class_student ON diagnostic_submissions (class_id, student_number)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_diagnostic_submissions_class_completed ON diagnostic_submissions (class_id, completed_at)"),
  ]);
}

function normalizeClassCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

function makeClassCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

function makeTeacherToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

async function readClass(db: D1Database, code: string) {
  return db.prepare("SELECT id, code, name, teacher_token_hash, created_at FROM diagnostic_classes WHERE code = ?")
    .bind(normalizeClassCode(code)).first<DiagnosticClassRow>();
}

async function handleCreateClass(request: Request, db: D1Database) {
  let body: { name?: unknown };
  try { body = await request.json() as { name?: unknown }; }
  catch { return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 40) : "";
  if (name.length < 2) return Response.json({ error: "학급 이름을 확인해 주세요." }, { status: 400 });

  const teacherToken = makeTeacherToken();
  const teacherTokenHash = await hashToken(teacherToken);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeClassCode();
    try {
      await db.prepare("INSERT INTO diagnostic_classes (id, code, name, teacher_token_hash, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(crypto.randomUUID(), code, name, teacherTokenHash, Date.now()).run();
      return Response.json({ code, name, teacherToken }, { status: 201, headers: { "cache-control": "no-store" } });
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  return Response.json({ error: "학급을 만들지 못했습니다." }, { status: 500 });
}

function validateAnswers(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  return QUESTIONS.every((question) => typeof answers[question.id] === "string" && question.options.some((option) => option.id === answers[question.id]));
}

async function handleStudentSubmission(request: Request, db: D1Database, diagnosticClass: DiagnosticClassRow) {
  let body: { studentName?: unknown; studentNumber?: unknown; answers?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
  const studentName = typeof body.studentName === "string" ? body.studentName.replace(/\s+/g, " ").trim().slice(0, 20) : "";
  const studentNumber = typeof body.studentNumber === "string" ? body.studentNumber.replace(/\s+/g, "").trim().slice(0, 12) : "";
  if (studentName.length < 2 || !studentNumber || !validateAnswers(body.answers)) {
    return Response.json({ error: "이름, 학번과 모든 문항의 응답을 확인해 주세요." }, { status: 400 });
  }
  const completedAt = Date.now();
  await db.prepare(`INSERT INTO diagnostic_submissions (id, class_id, student_name, student_number, answers_json, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(class_id, student_number) DO UPDATE SET student_name = excluded.student_name, answers_json = excluded.answers_json, completed_at = excluded.completed_at`)
    .bind(crypto.randomUUID(), diagnosticClass.id, studentName, studentNumber, JSON.stringify(body.answers), completedAt).run();
  return Response.json({ ok: true, completedAt }, { status: 201, headers: { "cache-control": "no-store" } });
}

async function handleTeacherDashboard(request: Request, db: D1Database, diagnosticClass: DiagnosticClassRow) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token || await hashToken(token) !== diagnosticClass.teacher_token_hash) {
    return Response.json({ error: "교사용 키가 올바르지 않습니다." }, { status: 403 });
  }
  const [result, classResult, cohortSubmissionResult] = await db.batch([
    db.prepare(`SELECT id, student_name, student_number, answers_json, completed_at
      FROM diagnostic_submissions WHERE class_id = ? ORDER BY student_number ASC, completed_at DESC`).bind(diagnosticClass.id),
    db.prepare("SELECT id, name FROM diagnostic_classes"),
    db.prepare("SELECT class_id, answers_json FROM diagnostic_submissions"),
  ]);
  const firstGradeClassIds = new Set(
    (classResult.results as Array<{ id: string; name: string }> ?? [])
      .filter((row) => isFirstGradeClassName(row.name))
      .map((row) => row.id),
  );
  const cohortSubmissions = (cohortSubmissionResult.results as Array<{ class_id: string; answers_json: string }> ?? [])
    .filter((row) => firstGradeClassIds.has(row.class_id))
    .map((row) => ({ answers: JSON.parse(row.answers_json) as Record<string, string> }));
  return Response.json({
    code: diagnosticClass.code,
    name: diagnosticClass.name,
    createdAt: diagnosticClass.created_at,
    submissions: (result.results as unknown as DiagnosticSubmissionRow[] ?? []).map((row) => ({
      id: row.id,
      studentName: row.student_name,
      studentNumber: row.student_number,
      answers: JSON.parse(row.answers_json) as Record<string, string>,
      completedAt: row.completed_at,
    })),
    cohort: calculateCohortAnalytics(cohortSubmissions, firstGradeClassIds.size),
  }, { headers: { "cache-control": "no-store" } });
}

async function handleDiagnosticApi(request: Request, db: D1Database, url: URL) {
  await ensureDiagnosticSchema(db);
  if (url.pathname === "/api/classes") {
    if (request.method === "POST") return handleCreateClass(request, db);
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 405, headers: { allow: "POST" } });
  }
  const match = url.pathname.match(/^\/api\/classes\/([A-Za-z0-9]+)(\/submissions)?$/);
  if (!match) return Response.json({ error: "경로를 찾을 수 없습니다." }, { status: 404 });
  const diagnosticClass = await readClass(db, match[1]);
  if (!diagnosticClass) return Response.json({ error: "학급을 찾을 수 없습니다." }, { status: 404 });
  if (!match[2] && request.method === "GET") {
    return Response.json({ code: diagnosticClass.code, name: diagnosticClass.name }, { headers: { "cache-control": "no-store" } });
  }
  if (match[2] && request.method === "POST") return handleStudentSubmission(request, db, diagnosticClass);
  if (match[2] && request.method === "GET") return handleTeacherDashboard(request, db, diagnosticClass);
  return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 405 });
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/classes" || url.pathname.startsWith("/api/classes/")) {
      return handleDiagnosticApi(request, env.DB, url);
    }

    if (url.pathname === "/api/tributes") {
      return handleTributes(request, env.DB);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
