import { createHash, randomBytes, randomUUID } from "node:crypto";
import { QUESTIONS } from "../app/questions";
import { getFirebaseDb } from "./firebase-admin";
import { calculateCohortAnalytics, isFirstGradeClassName } from "./diagnostic-analytics";

export type DiagnosticClass = {
  code: string;
  name: string;
  teacherTokenHash: string;
  createdAt: number;
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

export async function getDiagnosticClass(code: string) {
  const normalizedCode = normalizeClassCode(code);
  const snapshot = await (await getFirebaseDb()).collection("diagnosticClasses").doc(normalizedCode).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as DiagnosticClass;
}

export async function createDiagnosticClass(name: string) {
  const db = await getFirebaseDb();
  const teacherToken = makeTeacherToken();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeClassCode();
    const diagnosticClass: DiagnosticClass = { code, name, teacherTokenHash: hashValue(teacherToken), createdAt: Date.now() };
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

export async function getFirstGradeCohortAnalytics() {
  const db = await getFirebaseDb();
  const classSnapshot = await db.collection("diagnosticClasses").get();
  const firstGradeClasses = classSnapshot.docs
    .map((document) => document.data() as DiagnosticClass)
    .filter((diagnosticClass) => isFirstGradeClassName(diagnosticClass.name));

  const submissionSnapshots = await Promise.all(
    firstGradeClasses.map((diagnosticClass) =>
      db.collection("diagnosticClasses").doc(diagnosticClass.code).collection("submissions").get(),
    ),
  );
  const submissions = submissionSnapshots.flatMap((snapshot) =>
    snapshot.docs.map((document) => document.data() as { answers: Record<string, string> }),
  );

  return calculateCohortAnalytics(submissions, firstGradeClasses.length);
}
