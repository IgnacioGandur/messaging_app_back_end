import { Router } from "express";
import authRouter from "./authRouter.js";
import indexRouter from "./indexRouter.js";
import meRouter from "./meRouter.js";
import usersRouter from "./usersRouter.js";
import conversationsRouter from "./conversationsRouter.js";
import messagesRouter from "./messagesRouter.js";
import groupsRouter from "./groupsRouter.js";
import groupParticipantsRouter from "./groupParticipantsRouter.js";
import friendshipsRouter from "./friendshipsRouter.js";
import privateConversationParticipantsRouter from "./privateConversationParticipantsRouter.js";

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use("/me", meRouter);
router.use("/users", usersRouter);
router.use("/conversations", conversationsRouter);
router.use("/conversations/:id/messages", messagesRouter);
router.use("/conversations/:id/participants", privateConversationParticipantsRouter);
router.use("/groups", groupsRouter);
router.use("/groups/:id/participants", groupParticipantsRouter)
router.use("/friendships", friendshipsRouter);

export default router;

// TODO: Move all routes here so it's easier to read.
