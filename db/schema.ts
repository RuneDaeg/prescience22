import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tributes = sqliteTable("tributes", {
  id: text("id").primaryKey(),
  name: text("name"),
  message: text("message"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_tributes_created_at").on(table.createdAt)]);
