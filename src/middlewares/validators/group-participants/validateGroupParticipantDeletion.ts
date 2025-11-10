import { body, param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUserExistsById from "../users/custom-validators/checkIfUserExistsById.js";
import checkIfUserIsGroupParticipantByUserId from "./custom-validators/checkIfUserIsGroupParticipantByUserId.js";
import checkIfGroupExistsById from "../groups/custom-validators/checkIfGroupExistsById.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The group id in the param can't be empty.")
        .bail()
        .isInt()
        .withMessage("The group id in the param should be an integer.")
        .bail()
        .custom(checkIfGroupExistsById)
    ,
    body("userId")
        .trim()
        .notEmpty()
        .withMessage("The user id in the body field can't be empty.")
        .bail()
        .isInt()
        .withMessage("The user id in the body field should be an integer.")
        .bail()
        .custom(checkIfUserExistsById)
        .bail()
        .custom(checkIfUserIsGroupParticipantByUserId)
];

const validateGroupParticipantDeletion = validateChain(validationChain);

export default validateGroupParticipantDeletion;
