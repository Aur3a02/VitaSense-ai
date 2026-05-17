import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import symptomsRouter from "./symptoms";
import analysesRouter from "./analyses";
import openaiRouter from "./openai";
import profileRouter from "./profile";
import tipsRouter from "./tips";
import checkupRouter from "./checkup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(symptomsRouter);
router.use(analysesRouter);
router.use(openaiRouter);
router.use(profileRouter);
router.use(tipsRouter);
router.use(checkupRouter);

export default router;
