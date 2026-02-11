import { NextFunction, Request, Response } from "express";
import handlePrismaErrors from "../utilities/handlePrismaErrors.js";
import userModel from "../db/user.js";
import bcrypt from "bcryptjs";
import cleanEmptyFields from "../utilities/cleanEmptyFields.js";

const meController = {
    get: (req: Request, res: Response) => {
        return res.json({
            success: true,
            message: "Logged user info retrieved successfully!",
            user: req.user
        });
    },

    patch: async (req: Request, res: Response) => {
        try {
            const { id } = req.user as { id: number };
            const fields = req.body as {
                intent: string;
                firstName: string,
                lastName: string,
                profilePictureUrl: string,
                password: string,
                confirmPassword: string,
            };

            let hashedPass = "";

            if (fields.password) {
                hashedPass = await bcrypt.hash(fields.password, 10);
            };

            const { intent, confirmPassword, ...finalObject } = { ...fields, password: fields.password ? hashedPass : fields.password };

            const cleanFields = cleanEmptyFields(finalObject);

            const updatedUser = await userModel.updateUser(
                id,
                cleanFields
            );

            return res.json({
                success: true,
                message: "Your profile was updated successfully!",
                user: updatedUser
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "Logged user");
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as { id: number };

            const user = await userModel.deleteUser(id);

            res.clearCookie("connect.sid", { path: "/" });

            req.logout((error) => {
                if (error) {
                    console.error("Failed when trying to logout user.");
                    return next(error);
                } else {
                    req.session.destroy((error) => {
                        console.error("Failed when trying destroy the user's session.");
                        return next(error);
                    });

                    return res.json({
                        success: true,
                        message: "User deleted successfully!",
                        user: user
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "Logged user");
        }
    }
}

export default meController;
