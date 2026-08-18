import { createDiagnosticClass } from "../../../lib/diagnostic-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { name?: unknown };
  try { body = await request.json() as { name?: unknown }; }
  catch { return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 40) : "";
  if (name.length < 2) return Response.json({ error: "학급 이름을 확인해 주세요." }, { status: 400 });
  try {
    return Response.json(await createDiagnosticClass(name), { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "학급을 만들지 못했습니다. Firebase 설정을 확인해 주세요." }, { status: 500 });
  }
}
