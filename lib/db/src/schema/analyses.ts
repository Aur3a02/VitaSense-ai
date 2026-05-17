import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  symptoms: text("symptoms").array().notNull(),
  duration: text("duration").notNull(),
  ageRange: text("age_range").notNull(),
  severity: text("severity").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  urgencyLabel: text("urgency_label").notNull(),
  possibleConditions: text("possible_conditions").notNull(),
  lifestyleAdvice: text("lifestyle_advice").notNull(),
  whenToSeeDoctor: text("when_to_see_doctor").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
