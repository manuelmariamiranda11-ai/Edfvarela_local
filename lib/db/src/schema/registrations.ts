import { pgTable, serial, text, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthYear: integer("birth_year").notNull(),
  schoolYear: text("school_year").notNull(),
  className: text("class_name").notNull(),
  activity1: real("activity1"),
  activity2: real("activity2"),
  activity3: real("activity3"),
  activity4: real("activity4"),
  activity5: real("activity5"),
  absent: boolean("absent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  activity1: true,
  activity2: true,
  activity3: true,
  activity4: true,
  activity5: true,
  absent: true,
  createdAt: true,
});

export const scoresSchema = z.object({
  activity1: z.number().min(0).max(100).nullable().optional(),
  activity2: z.number().min(0).max(100).nullable().optional(),
  activity3: z.number().min(0).max(100).nullable().optional(),
  activity4: z.number().min(0).max(100).nullable().optional(),
  activity5: z.number().min(0).max(100).nullable().optional(),
});

export const absentSchema = z.object({
  absent: z.boolean(),
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
export type Scores = z.infer<typeof scoresSchema>;
