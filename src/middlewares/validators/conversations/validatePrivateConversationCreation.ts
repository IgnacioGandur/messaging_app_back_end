import { body } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUserExistsById from "../users/custom-validators/checkIfUserExistsById.js";

const validationChain = [
    body("recipientId")
        .trim()
        .notEmpty()
        .withMessage("The recipient id field can't be empty.")
        .bail()
        .isInt()
        .withMessage("The recipient id field should be an integer.")
        .bail()
        .custom(checkIfUserExistsById),
    body("message")
        .trim()
        .notEmpty()
        .withMessage("The message field can't be empty."),
];

const validatePrivateConversationCreation = validateChain(validationChain);

export default validatePrivateConversationCreation;
