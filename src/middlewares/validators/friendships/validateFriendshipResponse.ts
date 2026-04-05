import { param, body } from "express-validator";
import checkIfFriendshipExistsById from "./custom-validators/checkIfFriendshipExistsById.js";
import validateChain from "../validateChain.js";
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
    body("status")
        .trim()
        .notEmpty()
        .withMessage("The status field can't be empty")
        .isIn(["ACCEPTED"])
        .withMessage(
            "The only allowed value in the status field is 'ACCEPTED'.",
        ),
];

const validateFriendshipResponse = validateChain(validationChain);

export default validateFriendshipResponse;
