import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user!.id;
  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, userId));

  if (!profile) {
    res.json({ userId, genotype: null, bloodGroup: null, sex: null, dateOfBirth: null, allergies: [] });
    return;
  }
  res.json(profile);
});

router.put("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user!.id;
  const { genotype, bloodGroup, sex, dateOfBirth, allergies } = req.body;

  const [profile] = await db
    .insert(userProfilesTable)
    .values({ userId, genotype, bloodGroup, sex, dateOfBirth, allergies: allergies ?? [] })
    .onConflictDoUpdate({
      target: userProfilesTable.userId,
      set: { genotype, bloodGroup, sex, dateOfBirth, allergies: allergies ?? [] },
    })
    .returning();

  res.json(profile);
});

export default router;
