import validateChain from "../validateChain.js";
import { validateGroupId } from "./validateGroupUpdate.js";

const validationChain = [
    validateGroupId,
];

const validateGroupDeletion = validateChain(validationChain);

export default validateGroupDeletion;
