import { createSchoolClasses, getDiagnosticClass, getSchoolGroup, hashValue, linkClassToSchool, logDiagnosticError } from "../../../../../lib/diagnostic-api";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ code: string }> };

function validPlacement(value: { academicYear?: unknown; grade?: unknown; classNumber?: unknown }) {
  return Number.isInteger(value.academicYear) && Number(value.academicYear) >= 2022 && Number(value.academicYear) <= 2100
    && Number.isInteger(value.grade) && Number(value.grade) >= 1 && Number(value.grade) <= 3
    && Number.isInteger(value.classNumber) && Number(value.classNumber) >= 1 && Number(value.classNumber) <= 30;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const school = await getSchoolGroup((await params).code);
    if (!school) return Response.json({ error: "학교 그룹을 찾을 수 없습니다." }, { status: 404 });
    const body = await request.json() as { token?: unknown; academicYear?: unknown; grade?: unknown; classCount?: unknown };
    const token = typeof body.token === "string" ? body.token : "";
    if (!token || hashValue(token) !== school.adminTokenHash) return Response.json({ error: "학교 관리 키가 올바르지 않습니다." }, { status: 403 });
    if (!Number.isInteger(body.academicYear) || Number(body.academicYear) < 2022 || Number(body.academicYear) > 2100
      || !Number.isInteger(body.grade) || Number(body.grade) < 1 || Number(body.grade) > 3
      || !Number.isInteger(body.classCount) || Number(body.classCount) < 1 || Number(body.classCount) > 30) {
      return Response.json({ error: "학년도, 학년, 반 개수를 확인해 주세요." }, { status: 400 });
    }
    const classes = await createSchoolClasses(school, {
      academicYear: Number(body.academicYear),
      grade: Number(body.grade),
      classCount: Number(body.classCount),
    });
    return Response.json({ classes }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    logDiagnosticError("bulk-create-classes", error);
    return Response.json({ error: "학급을 일괄 생성하지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const school = await getSchoolGroup((await params).code);
    if (!school) return Response.json({ error: "학교 그룹을 찾을 수 없습니다." }, { status: 404 });
    const body = await request.json() as {
      token?: unknown;
      classCode?: unknown;
      classToken?: unknown;
      academicYear?: unknown;
      grade?: unknown;
      classNumber?: unknown;
    };
    const token = typeof body.token === "string" ? body.token : "";
    if (!token || hashValue(token) !== school.adminTokenHash) return Response.json({ error: "학교 관리 키가 올바르지 않습니다." }, { status: 403 });
    if (!validPlacement(body)) return Response.json({ error: "학년도, 학년, 반을 확인해 주세요." }, { status: 400 });
    const diagnosticClass = await getDiagnosticClass(typeof body.classCode === "string" ? body.classCode : "");
    if (!diagnosticClass) return Response.json({ error: "학급을 찾을 수 없습니다." }, { status: 404 });
    const classToken = typeof body.classToken === "string" ? body.classToken : "";
    if (!classToken || hashValue(classToken) !== diagnosticClass.teacherTokenHash) {
      return Response.json({ error: "학급 교사용 키가 올바르지 않습니다." }, { status: 403 });
    }
    const linked = await linkClassToSchool(diagnosticClass, {
      schoolCode: school.code,
      academicYear: Number(body.academicYear),
      grade: Number(body.grade),
      classNumber: Number(body.classNumber),
    });
    return Response.json({ code: linked.code, name: linked.name }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    logDiagnosticError("link-class", error);
    return Response.json({ error: "기존 학급을 연결하지 못했습니다." }, { status: 500 });
  }
}
