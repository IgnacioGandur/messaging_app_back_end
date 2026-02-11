import { type Request, type Response, type NextFunction, type RequestHandler } from "express";
import { validationResult, ValidationChain } from "express-validator";

const validateChain = (
    validationChain: ValidationChain[],
): (ValidationChain | RequestHandler)[] => {
    return [
        // If the validation chain is not an array, make it into one.
        ...(Array.isArray(validationChain) ? validationChain : [validationChain]),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(
                    errors.array().some((e) => e.msg === "You are not a part of this conversation.") ? 403 : 422
                ).json({
                    success: false,
                    message: "There's something wrong with the following inputs, please correct them:",
                    errors: errors.array()
                })
            } else {
                return next();
            }
        }
    ]
};

export default validateChain;
