import { Router } from "express";
import authRouter from "./authRouter.js";
import indexRouter from "./indexRouter.js";

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);

export default router;
