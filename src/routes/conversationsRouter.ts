import { Router } from "express";
import conversationsController from "../controllers/conversationsController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validatePrivateConversationCreation from "../middlewares/validators/conversations/validatePrivateConversationCreation.js";
import validateConversationExistence from "../middlewares/validators/conversations/validateConversationExistence.js";

const conversationsRouter = Router();

conversationsRouter
    .route("/")
    .all(isAuthenticated)
    .get(conversationsController.getConversations)
    .post(
        validatePrivateConversationCreation,
        conversationsController.createPrivateConversation,
    );

conversationsRouter
    .route("/:id")
    .all(isAuthenticated)
    .get(
        validateConversationExistence,
        conversationsController.getPrivateConversation,
    );

export default conversationsRouter;
