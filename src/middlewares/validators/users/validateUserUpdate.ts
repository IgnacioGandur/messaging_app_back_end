import { body, Meta } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUsernameIsAlreadyTaken from "../auth/register/custom-validators/checkIfUsernameIsAlreadyTaken.js";
import checkIfPasswordsMatch from "../auth/register/custom-validators/checkIfPasswordsMatch.js";

const regex = /^[\w.-]{1,30}$/;

const validationChain = [
    body("firstName")
        .optional({ values: "falsy" })
        .trim()
        .isAlpha()
        .withMessage("The first name field should only contain letters.")
        .isLength({ min: 1, max: 30 })
        .withMessage("The first name field should be between 1 and 30 characters long.")
    ,
    body("lastName")
        .optional({ values: "falsy" })
        .trim()
        .isAlpha()
        .withMessage("The last name field should only contain letters.")
        .isLength({ min: 1, max: 30 })
        .withMessage("The last name field should be between 1 and 30 characters long.")
    ,
    body("username")
        .if((username, { req }) => username !== req.user.username)
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("The username field should be between 3 and 30 characters long.")
        .matches(regex)
        .withMessage("The username field can only contain letters, numbers, dots and hyphens.")
        .bail()
        .custom(checkIfUsernameIsAlreadyTaken),
    body("password")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 5 })
        .withMessage("The password should be at least 5 characters long.")
        .custom(checkIfPasswordsMatch)
];

const validateUserUpdate = validateChain(validationChain);

export default validateUserUpdate;

