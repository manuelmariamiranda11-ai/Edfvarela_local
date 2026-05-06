import { Router, type IRouter } from "express";
import { db, registrationsTable, insertRegistrationSchema, scoresSchema, absentSchema } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(registrationsTable)
      .orderBy(asc(registrationsTable.name));

    const result = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      average: computeAverage(r),
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err, "Failed to list registrations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const parsed = insertRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const [row] = await db
      .insert(registrationsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json({
      ...row,
      createdAt: row.createdAt.toISOString(),
      average: computeAverage(row),
    });
  } catch (err) {
    req.log.error(err, "Failed to create registration");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }

    await db.delete(registrationsTable).where(eq(registrationsTable.id, id));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err, "Failed to delete registration");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/absent", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = absentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }

    const [updated] = await db
      .update(registrationsTable)
      .set({ absent: parsed.data.absent })
      .where(eq(registrationsTable.id, id))
      .returning();

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      average: computeAverage(updated),
    });
  } catch (err) {
    req.log.error(err, "Failed to toggle absent");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/scores", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = scoresSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid scores" });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }

    const [updated] = await db
      .update(registrationsTable)
      .set({
        activity1: parsed.data.activity1 ?? null,
        activity2: parsed.data.activity2 ?? null,
        activity3: parsed.data.activity3 ?? null,
        activity4: parsed.data.activity4 ?? null,
        activity5: parsed.data.activity5 ?? null,
      })
      .where(eq(registrationsTable.id, id))
      .returning();

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      average: computeAverage(updated),
    });
  } catch (err) {
    req.log.error(err, "Failed to update scores");
    res.status(500).json({ error: "Internal server error" });
  }
});

function computeAverage(row: {
  activity1: number | null;
  activity2: number | null;
  activity3: number | null;
  activity4: number | null;
  activity5: number | null;
}): number | null {
  const scores = [row.activity1, row.activity2, row.activity3, row.activity4, row.activity5].filter(
    (v): v is number => v !== null && v !== undefined,
  );
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export default router;
