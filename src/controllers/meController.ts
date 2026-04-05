import { NextFunction, Request, Response } from "express";
import handlePrismaErrors from "../utilities/handlePrismaErrors.js";
import userModel from "../db/user.js";
import bcrypt from "bcryptjs";
import cleanEmptyFields from "../utilities/cleanEmptyFields.js";

const meController = {
    get: async (req: Request, res: Response) => {
        const { id } = req.user as { id: number };
        const { includeStats } = req.query;

        if (includeStats) {
            const userStats = await userModel.getUserWithStats(id);

            return res.json({
                success: true,
                message: "Logged user with stats retrieved successfully!",
                user: userStats[0],
                data: {
                    friends: userStats[1],
                    privateConversations: userStats[2],
                    groupConversations: userStats[3],
                    ownedGroups: userStats[4],
                    sentMessages: userStats[5],
                },
            });
        }

        return res.json({
            success: true,
            message: "Logged user info retrieved successfully!",
            user: req.user,
        });
    },

    patch: async (req: Request, res: Response) => {
        try {
            const { id } = req.user as { id: number };
            const fields = req.body as {
                intent: string;
                firstName: string;
                lastName: string;
                password: string;
                confirmPassword: string;
            };

            let hashedPass = "";

            if (fields.password) {
                hashedPass = await bcrypt.hash(fields.password, 10);
            }

            // Remove "intent" and "confirmPassword" from the "finalObject" object.
            const { intent, confirmPassword, ...finalObject } = {
                ...fields,
                password: fields.password ? hashedPass : fields.password,
            };

            // Remove null/undefined fields.
            const cleanFields = cleanEmptyFields(finalObject);

            const updatedUser = await userModel.updateUser(id, cleanFields);

            return res.json({
                success: true,
                message: "Your profile was updated successfully!",
                user: updatedUser,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "Logged user");
        }
    },

    put: async (req: Request, res: Response) => {
        const { id } = req.user as { id: number };
        const { profilePictureUrl } = req.body;

        const user = await userModel.updateUser(id, {
            profilePictureUrl: profilePictureUrl,
        });

        return res.json({
            success: true,
            message: "Profile picture updated successfully!",
            user,
        });
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
                        console.error(
                            "Failed when trying destroy the user's session.",
                        );
                        return next(error);
                    });

                    return res.json({
                        success: true,
                        message: "User deleted successfully!",
                        user: user,
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "Logged user");
        }
    },
};

export default meController;
