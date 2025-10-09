import { Request, Response, NextFunction } from "express";
import userModel from "../db/user.js";
import cleanEmptyFields from "../utilities/cleanEmptyFields.js";
import bcrypt from "bcryptjs";

const usersController = {
    getAll: async (_req: Request, res: Response) => {
        try {
            const users = await userModel.getAllUsers();
            return res.json({
                success: true,
                message: "All users retrieved successfully!",
                users
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were able to retrieve all users.",
            })
        }
    },

    get: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await userModel.getUserById(id, false);
            return res.json({
                success: true,
                message: "User retrieved successfully!",
                user
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to get a user by it's username.",
            })
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.user as { id: number | string };
            const {
                firstName,
                lastName,
                username,
                password
            } = req.body;

            let hashedPass = "";

            if (password) {
                hashedPass = await bcrypt.hash(password, 10);
            };

            const fieldsToUpdate = cleanEmptyFields({
                firstName,
                lastName,
                username,
                password: password ? hashedPass : password
            });

            const updatedUser = await userModel.updateUser(
                id,
                fieldsToUpdate,
            );

            return res.json({
                success: true,
                message: "User updated successfully!",
                updatedUser
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to update your user."
            });
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as { id: string | number };
            const user = await userModel.deleteUser(id);

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
                        message: "User deleted successfully!",
                        user: user
                    });
                }
            });

        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to delete your user.",
            })
        }
    }
}

export default usersController;
