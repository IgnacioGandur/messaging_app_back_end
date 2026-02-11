import { Prisma } from "../generated/prisma/client.js";
import type { Response } from "express";

const handlePrismaErrors = (
    error: any,
    res: Response,
    element: string = "Record"
) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return res.status(409).json({
                    success: false,
                    message: `${element} already exists with this details.`,
                    errors: [
                        {
                            msg: `The field causing this problem is: "${error.meta?.target}".`,
                        }
                    ]
                });

            case "P2025":
                return res.status(404).json({
                    success: false,
                    message: `${element} not found.`,
                    target: error.meta?.target
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: `Server error. We were not able to perform the required action on this :${element}.`,
                })
        }
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error."
    })
}

export default handlePrismaErrors;
