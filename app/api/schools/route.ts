import { createSchoolGroup, logDiagnosticError } from "../../../lib/diagnostic-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 50) : "";
    if (name.length < 2) return Response.json({ error: "학교 이름을 확인해 주세요." }, { status: 400 });
    return Response.json(await createSchoolGroup(name), { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    logDiagnosticError("create-school", error);
    return Response.json({ error: "학교 그룹을 만들지 못했습니다." }, { status: 500 });
  }
}
