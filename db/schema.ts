import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const tributes = sqliteTable("tributes", {
  id: text("id").primaryKey(),
  name: text("name"),
  message: text("message"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_tributes_created_at").on(table.createdAt)]);

export const diagnosticClasses = sqliteTable("diagnostic_classes", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  teacherTokenHash: text("teacher_token_hash").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("idx_diagnostic_classes_code").on(table.code)]);

export const diagnosticSubmissions = sqliteTable("diagnostic_submissions", {
  id: text("id").primaryKey(),
  classId: text("class_id").notNull().references(() => diagnosticClasses.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  studentNumber: text("student_number").notNull(),
  answersJson: text("answers_json").notNull(),
  completedAt: integer("completed_at").notNull(),
}, (table) => [
  uniqueIndex("idx_diagnostic_submissions_class_student").on(table.classId, table.studentNumber),
  index("idx_diagnostic_submissions_class_completed").on(table.classId, table.completedAt),
]);
