import { Router, type IRouter } from "express";
import healthRouter from "./health";
import symptomsRouter from "./symptoms";
import analysesRouter from "./analyses";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(symptomsRouter);
router.use(analysesRouter);
router.use(openaiRouter);

export default router;
