import validateChain from "../../validateChain.js";
import { body } from "express-validator";
import checkIfPasswordsMatch from "./custom-validators/checkIfPasswordsMatch.js";
import checkIfUsernameIsAlreadyTaken from "./custom-validators/checkIfUsernameIsAlreadyTaken.js";

const regex = /^[\w.-]{1,30}$/;

const validationChain = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("The username field can't be empty.")
        .bail()
        .isLength({ min: 3, max: 30 })
        .withMessage("The username field should be between 3 and 30 characters long.")
        .bail()
        .matches(regex)
        .withMessage("The username field can only contain letters, numbers, dots and hyphens.")
        .bail()
        .custom(checkIfUsernameIsAlreadyTaken),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("The password field can't be empty.")
        .custom(checkIfPasswordsMatch)
];

const validateRegister = validateChain(validationChain);

export default validateRegister;
