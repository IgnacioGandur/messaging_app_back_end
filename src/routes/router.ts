import { Router } from "express";
import authRouter from "./authRouter.js";
import indexRouter from "./indexRouter.js";
import meRouter from "./meRouter.js";
import usersRouter from "./usersRouter.js";
import conversationsRouter from "./conversationsRouter.js";
import messagesRouter from "./messagesRouter.js";
import groupsRouter from "./groupsRouter.js";
import groupParticipantsRouter from "./groupParticipantsRouter.js";

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use("/me", meRouter);
router.use("/users", usersRouter);
router.use("/conversations", conversationsRouter);
router.use("/conversations/:id/messages", messagesRouter);
router.use("/groups", groupsRouter);
router.use("/groups/:id/participants", groupParticipantsRouter)

export default router;
