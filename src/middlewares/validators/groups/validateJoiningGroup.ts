import { param } from "express-validator";
import checkIfGroupExistsById from "./custom-validators/checkIfGroupExistsById.js";
import validateChain from "../validateChain.js";
import checkIfUserIsAlreadyParticipantInGroup from "./custom-validators/checkIfUserIsAlreadyParticipantInGroup.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The group id in the param should not be empty.")
        .bail()
        .isInt()
        .withMessage("The group id in the param should be an integer.")
        .bail()
        .custom(checkIfGroupExistsById)
        .bail()
        .custom(checkIfUserIsAlreadyParticipantInGroup)
];

const validateJoiningGroup = validateChain(validationChain);

export default validateJoiningGroup;
