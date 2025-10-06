import userModel from "../db/user.js";
import bcrypt from "bcryptjs";
import { type Request, Response, NextFunction } from "express";

const authController = {
    register: async (req: Request<{}, {}, { username: string; password: string; }>, res: Response, next: NextFunction) => {
        try {
            const {
                username,
                password
            } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await userModel.createUser(username, hashedPassword);

            req.login(user, (error) => {
                if (error) {
                    return next(error);
                } else {
                    return res.json({
                        success: true,
                        message: "User registered successfully!",
                        user
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to register a new user.",
            });
        }
    },

    login: async (req: Request<{}, {}, { username: string; password: string; }>, res: Response, next: NextFunction) => {
        try {
            const {
                username,
            } = req.body;

            const user = await userModel.getUserByUsername(username);

            req.login(user!, (error) => {
                if (error) {
                    return next(error);
                } else {
                    return res.json({
                        success: true,
                        message: "User logged successfully!",
                        user
                    });
                }
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to log you.",
            })
        }
    },

    logout: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie("connect.sid", { path: "/" });

            req.logout((error) => {
                if (error) {
                    return next(error);
                } else {
                    req.session.destroy((error) => {
                        return next(error);
                    });
                    return res.json({
                        success: true,
                        message: "User logged out successfully!"
                    });
                }
            })
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
                message: "Protected route reached! You are authenticated."
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to reach the protected route."
            })
        }
    }
}

export default authController;
