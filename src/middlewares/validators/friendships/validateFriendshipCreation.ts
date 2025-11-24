import { body } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUserExistsById from "../users/custom-validators/checkIfUserExistsById.js";
import checkIfFriendshipAlreadyExistsByUserId from "./custom-validators/checkIfFriendshipAlreadyExistsByUserId.js";

const validationChain = [
    body("userBId")
        .trim()
        .notEmpty()
        .withMessage("The userBId field in the body can't be empty.")
        .isInt()
        .withMessage("The userBId field in the body should be an integer.")
        .bail()
        .custom(checkIfUserExistsById)
        .bail()
        .custom(checkIfFriendshipAlreadyExistsByUserId)
];

const validateFriendshipCreation = validateChain(validationChain);

export default validateFriendshipCreation;
