import { param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUserExistsById from "./custom-validators/checkIfUserExistsById.js";
import checkIfUserIsAccountOwner from "./custom-validators/checkIfUserIsAccountOwner.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The user id in the param can't be empty.")
        .bail()
        .isInt()
        .withMessage("The user id in the param should be an integer.")
        .bail()
        .custom(checkIfUserExistsById)
        .bail()
        .custom(checkIfUserIsAccountOwner)
];

const validateUserDeletion = validateChain(validationChain);

export default validateUserDeletion;
