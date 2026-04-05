import validateChain from "../../validateChain.js";
import { body } from "express-validator";
import checkIfPasswordsMatch from "./custom-validators/checkIfPasswordsMatch.js";
import checkIfUsernameIsAlreadyTaken from "./custom-validators/checkIfUsernameIsAlreadyTaken.js";

const regex = /^[\w.-]{1,30}$/;

const validationChain = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("The first name field can't be empty.")
        .bail()
        .isAlpha()
        .withMessage("The first name field should only contain letters.")
        .isLength({ min: 1, max: 30 })
        .withMessage(
            "The first name field should be between 1 and 30 characters.",
        ),
    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("The last name field can't be empty.")
        .bail()
        .isAlpha()
        .withMessage("The last name field should only contain letters.")
        .isLength({ min: 1, max: 30 })
        .withMessage(
            "The last name field should be between 1 and 30 characters.",
        ),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("The username field can't be empty.")
        .bail()
        .isLength({ min: 3, max: 30 })
        .withMessage(
            "The username field should be between 3 and 30 characters long.",
        )
        .bail()
        .matches(regex)
        .withMessage(
            "The username field can only contain letters, numbers, dots and hyphens.",
        )
        .bail()
        .custom(checkIfUsernameIsAlreadyTaken),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("The password field can't be empty.")
        .custom(checkIfPasswordsMatch),
];

const validateRegister = validateChain(validationChain);

export default validateRegister;
