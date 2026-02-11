import { Request, Response, NextFunction } from "express";
import userModel from "../db/user.js";
import cleanEmptyFields from "../utilities/cleanEmptyFields.js";
import bcrypt from "bcryptjs";
import handlePrismaErrors from "../utilities/handlePrismaErrors.js";

const usersController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const page = Number(req.query.page) || 1;
            const search = req.query.search as string || "";
            const pageSize = 10;
            const skip = (page - 1) * pageSize;

            const data = await userModel.getAllUsers(
                pageSize,
                skip,
                search
            );

            return res.json({
                success: true,
                message: "Users retrieved successfully!",
                data: {
                    users: data.users,
                    meta: {
                        totalCount: data.totalCount,
                        totalPages: Math.ceil(data.totalCount / pageSize),
                        currentPage: page
                    }
                }
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
            const user = req.foundUser;

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    errors: [{
                        msg: `No user has an Id of ${id}.`
                    }]
                })
            }

            return res.json({
                success: true,
                message: "User retrieved successfully!",
                user
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "User");
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as { id: string | number };
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
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to delete your user.",
            })
        }
    }
}

export default usersController;
