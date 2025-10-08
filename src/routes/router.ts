import { Router } from "express";
import authRouter from "./authRouter.js";
import indexRouter from "./indexRouter.js";
import meRouter from "./meRouter.js";
import usersRouter from "./usersRouter.js";

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use("/me", meRouter);
router.use("/users", usersRouter);

export default router;
