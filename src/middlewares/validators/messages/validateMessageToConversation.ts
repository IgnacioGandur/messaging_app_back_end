import { body, param } from "express-validator";
import checkIfConversationExistsById from "../conversations/custom-validators/checkIfConversationExistsById.js";
import checkIfUserIsParticipantInConversation from "../conversations/custom-validators/checkIfUserIsParticipantInConversation.js";
import validateChain from "../validateChain.js";

const validationChain = [
    body("message")
        .trim()
        .notEmpty()
        .withMessage("The message can't be empty."),
];

const validateMessageToConversation = validateChain(validationChain);

export default validateMessageToConversation;
