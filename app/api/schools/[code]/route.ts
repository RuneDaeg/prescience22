import { getSchoolDashboard, getSchoolGroup, hashValue, logDiagnosticError, renameSchoolGroup } from "../../../../lib/diagnostic-api";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ code: string }> };

function authorized(school: { adminTokenHash: string }, token: string) {
  return Boolean(token) && hashValue(token) === school.adminTokenHash;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const school = await getSchoolGroup((await params).code);
    if (!school) return Response.json({ error: "학교 그룹을 찾을 수 없습니다." }, { status: 404 });
    const token = new URL(request.url).searchParams.get("token") ?? "";
    if (!authorized(school, token)) return Response.json({ error: "학교 관리 키가 올바르지 않습니다." }, { status: 403 });
    return Response.json({
      code: school.code,
      name: school.name,
      createdAt: school.createdAt,
      classes: await getSchoolDashboard(school),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    logDiagnosticError("read-school", error);
    return Response.json({ error: "학교 대시보드를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const school = await getSchoolGroup((await params).code);
    if (!school) return Response.json({ error: "학교 그룹을 찾을 수 없습니다." }, { status: 404 });
    const body = await request.json() as { token?: unknown; name?: unknown };
    const token = typeof body.token === "string" ? body.token : "";
    if (!authorized(school, token)) return Response.json({ error: "학교 관리 키가 올바르지 않습니다." }, { status: 403 });
    const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 50) : "";
    if (name.length < 2) return Response.json({ error: "학교 이름을 확인해 주세요." }, { status: 400 });
    const updated = await renameSchoolGroup(school, name);
    return Response.json({ code: updated.code, name: updated.name }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    logDiagnosticError("rename-school", error);
    return Response.json({ error: "학교 이름을 변경하지 못했습니다." }, { status: 500 });
  }
}
