import { body } from "express-validator";
import validateChain from "../validateChain.js";

const validationChain = [
    body("groupName")
        .trim()
        .notEmpty()
        .withMessage("The group name field can't be empty.")
];

const validateGroupCreation = validateChain(validationChain);

export default validateGroupCreation;
