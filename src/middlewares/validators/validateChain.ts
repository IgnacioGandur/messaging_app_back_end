import {
    type Request,
    type Response,
    type NextFunction,
    type RequestHandler,
} from "express";
import { validationResult, ValidationChain } from "express-validator";

// TODO: Attach the appropriate status code in the custom validators and then retrieve them here to display the correct status code.

const validateChain = (
    validationChain: ValidationChain[],
): (ValidationChain | RequestHandler)[] => {
    return [
        // If the validation chain is not an array, make it into one.
        ...(Array.isArray(validationChain)
            ? validationChain
            : [validationChain]),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            const { errorStatusCode } = req;

            if (!errors.isEmpty()) {
                return res.status(errorStatusCode || 422).json({
                    success: false,
                    message:
                        "There's something wrong with the following inputs, please correct them:",
                    errors: errors.array(),
                });
            } else {
                return next();
            }
        },
    ];
};

export default validateChain;
