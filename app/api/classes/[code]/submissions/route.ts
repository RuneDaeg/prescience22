import { getDiagnosticClass, getDiagnosticSubmissions, hashValue, saveDiagnosticSubmission, validateAnswers } from "../../../../../lib/diagnostic-api";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const diagnosticClass = await getDiagnosticClass((await params).code);
    if (!diagnosticClass) return Response.json({ error: "학급을 찾을 수 없습니다." }, { status: 404 });
    const token = new URL(request.url).searchParams.get("token") ?? "";
    if (!token || hashValue(token) !== diagnosticClass.teacherTokenHash) {
      return Response.json({ error: "교사용 키가 올바르지 않습니다." }, { status: 403 });
    }
    return Response.json({
      code: diagnosticClass.code,
      name: diagnosticClass.name,
      createdAt: diagnosticClass.createdAt,
      submissions: await getDiagnosticSubmissions(diagnosticClass),
    }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "학급 응답을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const diagnosticClass = await getDiagnosticClass((await params).code);
    if (!diagnosticClass) return Response.json({ error: "학급을 찾을 수 없습니다." }, { status: 404 });
    const body = await request.json() as { studentName?: unknown; studentNumber?: unknown; answers?: unknown };
    const studentName = typeof body.studentName === "string" ? body.studentName.replace(/\s+/g, " ").trim().slice(0, 20) : "";
    const studentNumber = typeof body.studentNumber === "string" ? body.studentNumber.replace(/\s+/g, "").trim().slice(0, 12) : "";
    if (studentName.length < 2 || !studentNumber || !validateAnswers(body.answers)) {
      return Response.json({ error: "이름, 학번과 모든 문항의 응답을 확인해 주세요." }, { status: 400 });
    }
    const completedAt = await saveDiagnosticSubmission(diagnosticClass, { studentName, studentNumber, answers: body.answers });
    return Response.json({ ok: true, completedAt }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "응답을 저장하지 못했습니다." }, { status: 500 });
  }
}
