import { Router } from "express";
import privateConversationParticipantsController from "../controllers/privateConversationParticipantsController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const privateConversationParticipantsRouter = Router({ mergeParams: true });

privateConversationParticipantsRouter.route("/").all(isAuthenticated).patch(
    // TODO: Write the validator.
    privateConversationParticipantsController.patch,
);

export default privateConversationParticipantsRouter;
