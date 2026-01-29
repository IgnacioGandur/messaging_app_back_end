import { Router } from "express";
import messagesController from "../controllers/messagesController.js";
import validateMessageToConversation from "../middlewares/validators/messages/validateMessageToConversation.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validateConversationExistence from "../middlewares/validators/conversations/validateConversationExistence.js";
import validateMessagesDeletion from "../middlewares/validators/messages/validateMessagesDeletion.js";

const messagesRouter = Router({ mergeParams: true, });

messagesRouter
    .route("/")
    .all(isAuthenticated)
    .get(
        messagesController.getMoreMessages
    )
    .post(
        validateConversationExistence,
        validateMessageToConversation,
        messagesController.sendMessage
    );

messagesRouter
    .route("/:mid") // mid = Message id.
    .delete(
        isAuthenticated,
        validateMessagesDeletion,
        messagesController.deleteMessage
    );

export default messagesRouter;

