import { Router } from "express";
import authRouter from "./authRouter.js";
import indexRouter from "./indexRouter.js";
import meRouter from "./meRouter.js";

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use("/me", meRouter);

export default router;
