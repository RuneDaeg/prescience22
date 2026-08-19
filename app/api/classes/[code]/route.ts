import { getDiagnosticClass, logDiagnosticError } from "../../../../lib/diagnostic-api";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const diagnosticClass = await getDiagnosticClass((await params).code);
    if (!diagnosticClass) return Response.json({ error: "학급을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ code: diagnosticClass.code, name: diagnosticClass.name }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    logDiagnosticError("read-class", error);
    return Response.json({ error: "학급 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}
