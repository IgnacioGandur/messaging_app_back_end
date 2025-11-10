import { body, param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUserExistsById from "../users/custom-validators/checkIfUserExistsById.js";
import checkIfGroupExistsById from "../groups/custom-validators/checkIfGroupExistsById.js";
import checkIfUserBelongsToGroup from "./custom-validators/checkIfUserBelongsToGroup.js";
import checkIfUserIsGroupOwner from "../groups/custom-validators/checkIfUserIsGroupOwner.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The group id in the param can't be empty.")
        .isInt()
        .withMessage("The group id in the param should be an integer.")
        .bail()
        .custom(checkIfGroupExistsById)
        .bail()
        .custom(checkIfUserBelongsToGroup)
        .bail()
        .custom(checkIfUserIsGroupOwner)
    ,
    body("userId")
        .trim()
        .notEmpty()
        .withMessage("The user id field in the body can't be empty.")
        .isInt()
        .withMessage("The user id field in the body should be an integer.")
        .bail()
        .custom(checkIfUserExistsById),
    body("role")
        .trim()
        .notEmpty()
        .withMessage("The user participant role field can't be empty.")
        .isIn(["USER", "ADMIN"])
        .withMessage("The participant role field can only be 'USER' or 'ADMIN'.")
];

const validateGroupParticipantUpdate = validateChain(validationChain);

export default validateGroupParticipantUpdate;
