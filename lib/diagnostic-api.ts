import { createHash, randomBytes, randomUUID } from "node:crypto";
import { QUESTIONS } from "../app/questions";
import { getFirebaseDb } from "./firebase-admin";
import { calculateCohortAnalytics, isFirstGradeClassName } from "./diagnostic-analytics";

export type DiagnosticClass = {
  code: string;
  name: string;
  teacherTokenHash: string;
  createdAt: number;
  schoolCode?: string;
  academicYear?: number;
  grade?: number;
  classNumber?: number;
};

export type SchoolGroup = {
  code: string;
  name: string;
  adminTokenHash: string;
  createdAt: number;
};

export type ClassPlacement = {
  schoolCode: string;
  academicYear: number;
  grade: number;
  classNumber: number;
};

export function normalizeClassCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function logDiagnosticError(scope: string, error: unknown) {
  const details = error instanceof Error
    ? { name: error.name, message: error.message, code: "code" in error ? String(error.code) : undefined }
    : { type: typeof error };
  console.error(`[diagnostic] ${scope}`, details);
}

export function validateAnswers(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  return QUESTIONS.every((question) => typeof answers[question.id] === "string" && question.options.some((option) => option.id === answers[question.id]));
}

export function makeClassCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(6), (value) => alphabet[value % alphabet.length]).join("");
}

export function makeTeacherToken() {
  return randomBytes(18).toString("hex");
}

export function makeSchoolCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(8), (value) => alphabet[value % alphabet.length]).join("");
}

export async function getDiagnosticClass(code: string) {
  const normalizedCode = normalizeClassCode(code);
  const snapshot = await (await getFirebaseDb()).collection("diagnosticClasses").doc(normalizedCode).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as DiagnosticClass;
}

export async function createDiagnosticClass(name: string, placement?: ClassPlacement) {
  const db = await getFirebaseDb();
  const teacherToken = makeTeacherToken();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeClassCode();
    const diagnosticClass: DiagnosticClass = {
      code,
      name,
      teacherTokenHash: hashValue(teacherToken),
      createdAt: Date.now(),
      ...(placement ?? {}),
    };
    try {
      await db.collection("diagnosticClasses").doc(code).create(diagnosticClass);
      return { code, name, teacherToken };
    } catch (error) {
      const collision = typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 6;
      if (!collision || attempt === 4) throw error;
    }
  }
  throw new Error("Unable to allocate a class code.");
}

export async function saveDiagnosticSubmission(diagnosticClass: DiagnosticClass, body: { studentName: string; studentNumber: string; answers: Record<string, string> }) {
  const completedAt = Date.now();
  const id = hashValue(body.studentNumber);
  await (await getFirebaseDb()).collection("diagnosticClasses").doc(diagnosticClass.code).collection("submissions").doc(id).set({
    id: randomUUID(),
    studentName: body.studentName,
    studentNumber: body.studentNumber,
    answers: body.answers,
    completedAt,
  });
  return completedAt;
}

export async function getDiagnosticSubmissions(diagnosticClass: DiagnosticClass) {
  const snapshot = await (await getFirebaseDb()).collection("diagnosticClasses").doc(diagnosticClass.code).collection("submissions").get();
  return snapshot.docs.map((document) => document.data() as {
    id: string;
    studentName: string;
    studentNumber: string;
    answers: Record<string, string>;
    completedAt: number;
  }).sort((a, b) => a.studentNumber.localeCompare(b.studentNumber, "ko", { numeric: true }));
}

export async function getClassCohortAnalytics(currentClass: DiagnosticClass) {
  const db = await getFirebaseDb();
  const classSnapshot = currentClass.schoolCode
    ? await db.collection("diagnosticClasses").where("schoolCode", "==", currentClass.schoolCode).get()
    : await db.collection("diagnosticClasses").get();
  const cohortClasses = classSnapshot.docs
    .map((document) => document.data() as DiagnosticClass)
    .filter((diagnosticClass) => currentClass.schoolCode
      ? diagnosticClass.academicYear === currentClass.academicYear && diagnosticClass.grade === currentClass.grade
      : isFirstGradeClassName(diagnosticClass.name));

  const submissionSnapshots = await Promise.all(
    cohortClasses.map((diagnosticClass) =>
      db.collection("diagnosticClasses").doc(diagnosticClass.code).collection("submissions").get(),
    ),
  );
  const submissions = submissionSnapshots.flatMap((snapshot) =>
    snapshot.docs.map((document) => document.data() as { answers: Record<string, string> }),
  );

  return calculateCohortAnalytics(submissions, cohortClasses.length);
}

export async function getSchoolGroup(code: string) {
  const normalizedCode = normalizeClassCode(code);
  const snapshot = await (await getFirebaseDb()).collection("schoolGroups").doc(normalizedCode).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as SchoolGroup;
}

export async function createSchoolGroup(name: string) {
  const db = await getFirebaseDb();
  const adminToken = makeTeacherToken();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeSchoolCode();
    const school: SchoolGroup = { code, name, adminTokenHash: hashValue(adminToken), createdAt: Date.now() };
    try {
      await db.collection("schoolGroups").doc(code).create(school);
      return { code, name, adminToken };
    } catch (error) {
      const collision = typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 6;
      if (!collision || attempt === 4) throw error;
    }
  }
  throw new Error("Unable to allocate a school code.");
}

export async function renameSchoolGroup(school: SchoolGroup, name: string) {
  await (await getFirebaseDb()).collection("schoolGroups").doc(school.code).update({ name });
  return { ...school, name };
}

export async function createSchoolClasses(
  school: SchoolGroup,
  body: { academicYear: number; grade: number; classCount: number },
) {
  const existingSnapshot = await (await getFirebaseDb()).collection("diagnosticClasses")
    .where("schoolCode", "==", school.code).get();
  const occupiedClassNumbers = new Set(
    existingSnapshot.docs
      .map((document) => document.data() as DiagnosticClass)
      .filter((diagnosticClass) => diagnosticClass.academicYear === body.academicYear && diagnosticClass.grade === body.grade)
      .map((diagnosticClass) => diagnosticClass.classNumber),
  );
  const duplicate = Array.from({ length: body.classCount }, (_, index) => index + 1)
    .find((classNumber) => occupiedClassNumbers.has(classNumber));
  if (duplicate) throw new Error(`${body.academicYear}학년도 ${body.grade}학년 ${duplicate}반이 이미 있습니다.`);

  const created = [];
  for (let classNumber = 1; classNumber <= body.classCount; classNumber += 1) {
    created.push(await createDiagnosticClass(`${body.grade}학년 ${classNumber}반`, {
      schoolCode: school.code,
      academicYear: body.academicYear,
      grade: body.grade,
      classNumber,
    }));
  }
  return created;
}

export async function linkClassToSchool(
  diagnosticClass: DiagnosticClass,
  placement: ClassPlacement,
) {
  const db = await getFirebaseDb();
  const schoolClasses = await db.collection("diagnosticClasses").where("schoolCode", "==", placement.schoolCode).get();
  const duplicate = schoolClasses.docs
    .map((document) => document.data() as DiagnosticClass)
    .find((item) => item.code !== diagnosticClass.code
      && item.academicYear === placement.academicYear
      && item.grade === placement.grade
      && item.classNumber === placement.classNumber);
  if (duplicate) throw new Error("해당 학년도·학년·반에 이미 다른 학급이 연결되어 있습니다.");
  await db.collection("diagnosticClasses").doc(diagnosticClass.code).update(placement);
  return { ...diagnosticClass, ...placement };
}

export async function getSchoolDashboard(school: SchoolGroup) {
  const db = await getFirebaseDb();
  const classSnapshot = await db.collection("diagnosticClasses").where("schoolCode", "==", school.code).get();
  const classes = classSnapshot.docs.map((document) => document.data() as DiagnosticClass);
  const submissions = await Promise.all(classes.map((diagnosticClass) => getDiagnosticSubmissions(diagnosticClass)));
  return classes.map((diagnosticClass, index) => ({
    code: diagnosticClass.code,
    name: diagnosticClass.name,
    createdAt: diagnosticClass.createdAt,
    academicYear: diagnosticClass.academicYear,
    grade: diagnosticClass.grade,
    classNumber: diagnosticClass.classNumber,
    submissions: submissions[index],
  })).sort((a, b) =>
    (b.academicYear ?? 0) - (a.academicYear ?? 0)
    || (a.grade ?? 0) - (b.grade ?? 0)
    || (a.classNumber ?? 0) - (b.classNumber ?? 0),
  );
}
