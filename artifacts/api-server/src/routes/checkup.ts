import { Router, type IRouter } from "express";
import { db, weeklyCheckupsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/checkup", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user!.id;
  const checkups = await db
    .select()
    .from(weeklyCheckupsTable)
    .where(eq(weeklyCheckupsTable.userId, userId))
    .orderBy(desc(weeklyCheckupsTable.createdAt));
  res.json(checkups);
});

router.post("/checkup", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user!.id;
  const { wellnessScore, symptoms, notes } = req.body;

  if (typeof wellnessScore !== "number" || wellnessScore < 0 || wellnessScore > 100) {
    res.status(400).json({ error: "wellnessScore must be 0-100" });
    return;
  }

  const weekStart = getWeekStart();

  const [checkup] = await db
    .insert(weeklyCheckupsTable)
    .values({ userId, weekStart, wellnessScore, symptoms: symptoms ?? [], notes })
    .returning();

  res.status(201).json(checkup);
});

router.get("/checkup/wellness", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.json({ score: 0, trend: "no_data", lastCheckup: null });
    return;
  }
  const userId = req.user!.id;
  const checkups = await db
    .select()
    .from(weeklyCheckupsTable)
    .where(eq(weeklyCheckupsTable.userId, userId))
    .orderBy(desc(weeklyCheckupsTable.createdAt))
    .limit(2);

  if (checkups.length === 0) {
    res.json({ score: 0, trend: "no_data", lastCheckup: null });
    return;
  }

  const latest = checkups[0];
  let trend: "up" | "down" | "stable" | "no_data" = "stable";
  if (checkups.length >= 2) {
    const diff = latest.wellnessScore - checkups[1].wellnessScore;
    if (diff > 5) trend = "up";
    else if (diff < -5) trend = "down";
    else trend = "stable";
  } else {
    trend = "no_data";
  }

  res.json({
    score: latest.wellnessScore,
    trend,
    lastCheckup: latest.createdAt.toISOString(),
  });
});

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export default router;
