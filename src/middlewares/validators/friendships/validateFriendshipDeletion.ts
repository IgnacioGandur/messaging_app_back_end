import { param } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfFriendshipExistsById from "./custom-validators/checkIfFriendshipExistsById.js";
import checkIfUserBelongsToFriendship from "./custom-validators/checkIfUserBelongsToFriendship.js";

const validationChain = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("The friendship id in the param can't be empty.")
        .isInt()
        .withMessage("The friendship id in the param should be an integer.")
        .bail()
        .custom(checkIfFriendshipExistsById)
        .bail()
        .custom(checkIfUserBelongsToFriendship),
];

const validateFriendshipDeletion = validateChain(validationChain);

export default validateFriendshipDeletion;
