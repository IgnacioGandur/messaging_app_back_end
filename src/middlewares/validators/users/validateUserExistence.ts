import { param } from "express-validator";
import checkIfUserExistsById from "./custom-validators/checkIfUserExistsById.js";
import validateChain from "../validateChain.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The user id in the param can't be empty.")
        .isInt()
        .withMessage("The user id in the param should be an integer.")
        .bail()
        .custom(checkIfUserExistsById)
];

const validateUserExistence = validateChain(validationChain);

export default validateUserExistence;
