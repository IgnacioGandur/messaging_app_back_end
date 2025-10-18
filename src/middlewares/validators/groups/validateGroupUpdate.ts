import { body, param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfGroupExistsById from "./custom-validators/checkIfGroupExistsById.js";
import checkIfUserIsGroupOwner from "./custom-validators/checkIfUserIsGroupOwner.js";

export const validateGroupId = param("id")
    .trim()
    .notEmpty()
    .withMessage("The group id in the param should not be empty.")
    .bail()
    .isInt()
    .withMessage("The group id in the param should be an integer.")
    .bail()
    .custom(checkIfGroupExistsById)
    .bail()
    .custom(checkIfUserIsGroupOwner);

const validationChain = [
    validateGroupId,
    body("name")
        .trim()
        .notEmpty()
        .withMessage("The updated group name can't be empty.")
];

export const validateGroupUpdate = validateChain(validationChain);
