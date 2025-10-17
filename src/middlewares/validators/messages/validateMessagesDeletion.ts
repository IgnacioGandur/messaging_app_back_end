import { param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfMessageExistsById from "./custom-validators/checkIfMessageExistsById.js";
import checkIfUserIsMessageOwner from "./custom-validators/checkIfUserIsMessageOwner.js";

const validationChain = [
    param("mid")
        .trim()
        .notEmpty()
        .withMessage("The message id (mid) in the param can't be empty.")
        .isInt()
        .withMessage("The message id (mid) in the param should be an integer.")
        .bail()
        .custom(checkIfMessageExistsById)
        .bail()
        .custom(checkIfUserIsMessageOwner)
];

const validateMessagesDeletion = validateChain(validationChain);

export default validateMessagesDeletion;

