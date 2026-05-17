import { pgTable, serial, text, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const weeklyCheckupsTable = pgTable("weekly_checkups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  weekStart: text("week_start").notNull(),
  wellnessScore: integer("wellness_score").notNull(),
  symptoms: text("symptoms").array().notNull().default([]),
  notes: text("notes"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WeeklyCheckup = typeof weeklyCheckupsTable.$inferSelect;
export type InsertWeeklyCheckup = typeof weeklyCheckupsTable.$inferInsert;
