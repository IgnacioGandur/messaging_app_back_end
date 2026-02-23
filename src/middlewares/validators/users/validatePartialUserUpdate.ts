import { body } from "express-validator";
import validateChain from "../validateChain.js";
import checkIfUrlPointsToImage from "./custom-validators/checkIfUrlPointsToImage.js";

const validationChain = [
    body("profilePictureUrl")
        .trim()
        .notEmpty()
        .withMessage("The profile picture URL field can't be empty.")
        .isURL()
        .withMessage("The profile picture URL field should be a URL.")
        .bail()
        .custom(checkIfUrlPointsToImage)
];

const validatePartialUserUpdate = validateChain(validationChain);

export default validatePartialUserUpdate;
