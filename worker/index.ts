/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

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
