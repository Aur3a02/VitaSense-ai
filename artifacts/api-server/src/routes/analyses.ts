import { Router, type IRouter } from "express";
import { eq, desc, sql, gte } from "drizzle-orm";
import { db, analysesTable } from "@workspace/db";
import {
  SaveAnalysisBody,
  GetAnalysisParams,
  DeleteAnalysisParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analyses", async (_req, res): Promise<void> => {
  const analyses = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt));
  res.json(analyses);
});

router.post("/analyses", async (req, res): Promise<void> => {
  const parsed = SaveAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [analysis] = await db
    .insert(analysesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(analysis);
});

router.get("/analyses/:id", async (req, res): Promise<void> => {
  const params = GetAnalysisParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [analysis] = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.id, params.data.id));

  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json(analysis);
});

router.delete("/analyses/:id", async (req, res): Promise<void> => {
  const params = DeleteAnalysisParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(analysesTable)
    .where(eq(analysesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.sendStatus(204);
});

// ── Dashboard endpoints ──────────────────────────────────────────────────────

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analysesTable);

  const [weekResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analysesTable)
    .where(gte(analysesTable.createdAt, oneWeekAgo));

  const [emergencyResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analysesTable)
    .where(eq(analysesTable.urgencyLevel, "emergency_care"));

  // Most common symptom via unnesting the array
  const symptomRows = await db
    .select({ symptoms: analysesTable.symptoms })
    .from(analysesTable);

  const symptomFreq: Record<string, number> = {};
  for (const row of symptomRows) {
    for (const s of row.symptoms) {
      symptomFreq[s] = (symptomFreq[s] ?? 0) + 1;
    }
  }

  const mostCommonSymptom =
    Object.entries(symptomFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  res.json({
    totalAnalyses: totalResult?.count ?? 0,
    thisWeek: weekResult?.count ?? 0,
    emergencyCount: emergencyResult?.count ?? 0,
    mostCommonSymptom,
  });
});

router.get("/dashboard/recent", async (_req, res): Promise<void> => {
  const analyses = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt))
    .limit(5);
  res.json(analyses);
});

router.get("/dashboard/urgency-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      urgencyLevel: analysesTable.urgencyLevel,
      urgencyLabel: analysesTable.urgencyLabel,
      count: sql<number>`count(*)::int`,
    })
    .from(analysesTable)
    .groupBy(analysesTable.urgencyLevel, analysesTable.urgencyLabel);

  res.json(rows);
});

export default router;
