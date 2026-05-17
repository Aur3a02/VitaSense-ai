import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const userProfilesTable = pgTable("user_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  genotype: text("genotype"),
  bloodGroup: text("blood_group"),
  sex: text("sex"),
  dateOfBirth: text("date_of_birth"),
  allergies: text("allergies").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserProfile = typeof userProfilesTable.$inferSelect;
export type UpsertUserProfile = typeof userProfilesTable.$inferInsert;
