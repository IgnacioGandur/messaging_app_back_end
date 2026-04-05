import { body } from "express-validator";
import checkIfUserExistsByUsername from "./custom-validators/checkIfUserExistsByUsername.js";
import checkIfPasswordIsCorrect from "./custom-validators/checkIfPasswordIsCorrect.js";
import validateChain from "../../validateChain.js";

const validationChain = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("The username field can't be empty.")
        .bail()
        .custom(checkIfUserExistsByUsername),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("The password field can't be empty.")
        .bail()
        .custom(checkIfPasswordIsCorrect),
];

const validateLogin = validateChain(validationChain);

export default validateLogin;
