import { Router } from "express";
import groupParticipantsController from "../controllers/groupParticipantsController.js";
import validateGroupParticipantUpdate from "../middlewares/validators/group-participants/validateGroupParticipantUpdate.js";
import validateConversationExistence from "../middlewares/validators/conversations/validateConversationExistence.js";
import validateGroupParticipantDeletion from "../middlewares/validators/group-participants/validateGroupParticipantDeletion.js";

const groupParticipantsRouter = Router({ mergeParams: true });

groupParticipantsRouter
    .route("/")
    .put(
        validateConversationExistence,
        validateGroupParticipantUpdate,
        groupParticipantsController.updateUserRole
    )
    .delete(
        validateGroupParticipantDeletion,
        groupParticipantsController.removeUserFromGroup
    );

export default groupParticipantsRouter;
