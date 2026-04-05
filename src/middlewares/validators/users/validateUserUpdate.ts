import { body } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfPasswordsMatch from "../auth/register/custom-validators/checkIfPasswordsMatch.js";

const validationChain = [
    body("firstName")
        .optional({ values: "falsy" })
        .trim()
        .isAlpha()
        .withMessage("The first name field should only contain letters.")
        .isLength({ min: 1, max: 30 })
        .withMessage(
            "The first name field should be between 1 and 30 characters long.",
        ),
    body("lastName")
        .optional({ values: "falsy" })
        .trim()
        .isAlpha()
        .withMessage("The last name field should only contain letters.")
        .isLength({ min: 1, max: 30 })
        .withMessage(
            "The last name field should be between 1 and 30 characters long.",
        ),
    body("password")
        .optional({ values: "falsy" })
        .trim()
        .custom(checkIfPasswordsMatch),
];

const validateUserUpdate = validateChain(validationChain);

export default validateUserUpdate;
