import { param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfConversationExistsById from "./custom-validators/checkIfConversationExistsById.js";
import checkIfUserIsParticipantInConversation from "./custom-validators/checkIfUserIsParticipantInConversation.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The conversation id in the param can't be empty.")
        .bail()
        .isInt()
        .withMessage("The conversation id in the param should be an integer.")
        .bail()
        .custom(checkIfConversationExistsById)
        .bail()
        .custom(checkIfUserIsParticipantInConversation)
];

const validateConversationExistence = validateChain(validationChain);

export default validateConversationExistence;
