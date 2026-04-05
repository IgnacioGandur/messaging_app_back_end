import { body, param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfGroupExistsById from "./custom-validators/checkIfGroupExistsById.js";
import checkIfUserIsGroupOwner from "./custom-validators/checkIfUserIsGroupOwner.js";
import checkIfUrlPointsToImage from "../users/custom-validators/checkIfUrlPointsToImage.js";

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
    body("ppf")
        .trim()
        .notEmpty()
        .withMessage("The profile picture URL field can't be empty.")
        .isURL()
        .withMessage("The profile picture URL field should be a URL.")
        .bail()
        .custom(checkIfUrlPointsToImage),
    body("title")
        .trim()
        .notEmpty()
        .withMessage("The updated group title can't be empty."),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("The updated group description can't be empty."),
];

export const validateGroupUpdate = validateChain(validationChain);
