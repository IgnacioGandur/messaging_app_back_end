import userModel from "../db/user.js";
import bcrypt from "bcryptjs";
import { type Request, Response, NextFunction } from "express";
import handlePrismaErrors from "../utilities/handlePrismaErrors.js";

const authController = {
    register: async (
        req: Request<
            {},
            {},
            {
                username: string;
                password: string;
                firstName: string;
                lastName: string;
            }
        >,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { firstName, lastName, username, password } = req.body;

            const profilePictureUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await userModel.createUser(
                firstName,
                lastName,
                username,
                profilePictureUrl,
                hashedPassword,
            );

            req.login(user, (error) => {
                if (error) {
                    return next(error);
                } else {
                    return res.json({
                        success: true,
                        message: "User registered successfully!",
                        user,
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "User");
        }
    },

    login: async (
        req: Request<{}, {}, { username: string; password: string }>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { username } = req.body;

            const user = req.foundUser;

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                    errors: [
                        {
                            msg: `User with username: "${username}" doesn't exist.`,
                        },
                    ],
                });
            }

            req.login(user, (error) => {
                if (error) {
                    return next(error);
                } else {
                    return res.json({
                        success: true,
                        message: "User logged successfully!",
                        user,
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "User");
        }
    },

    logout: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie("connect.sid", { path: "/" });
            req.foundUser = undefined;

            req.logout((error) => {
                if (error) {
                    return next(error);
                } else {
                    req.session.destroy((error) => {
                        return next(error);
                    });
                    return res.json({
                        success: true,
                        message: "User logged out successfully!",
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to log you out.",
            });
        }
    },

    protectedRoute: async (_req: Request, res: Response) => {
        try {
            return res.json({
                success: true,
                message: "Protected route reached! You are authenticated.",
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message:
                    "Server error. We were not able to reach the protected route.",
            });
        }
    },
};

export default authController;
