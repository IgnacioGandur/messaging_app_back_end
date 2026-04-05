import { Request, Response } from "express";
import groupsModel from "../db/group.js";

const groupsController = {
    createGroup: async (req: Request, res: Response) => {
        try {
            const { id: userId } = req.user as { id: number | string };
            const { title, description } = req.body;
            const profilePicture = `https://ui-avatars.com/api/?name=${title.replaceAll(" ", "+")}&background=random&color=fff`;

            const group = await groupsModel.createGroup(
                profilePicture,
                title,
                description,
                userId,
            );

            return res.json({
                success: true,
                message: "Group created successfully!",
                group,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able to create your group.",
            });
        }
    },

    getAllGroups: async (req: Request, res: Response) => {
        try {
            const { id } = req.user as { id: number };
            const page = Number(req.query.page) || 1;
            const search = (req.query.search as string) || "";
            const pageSize = 10;
            const skip = (page - 1) * pageSize;
            const yourGroups = Boolean(req.query.yourGroups);
            const joined = Boolean(req.query.joined);

            const { groups, count } = await groupsModel.getAll(
                pageSize,
                skip,
                search,
                yourGroups,
                id,
                joined,
            );

            return res.json({
                success: true,
                message: "All groups retrieved successfully!",
                data: {
                    groups,
                    meta: {
                        count,
                        totalPages: Math.ceil(count / pageSize),
                        currentPage: page,
                    },
                },
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able to get all groups.",
            });
        }
    },

    joinGroup: async (req: Request, res: Response) => {
        try {
            const { id: groupId } = req.params;
            const { id: userId } = req.user as { id: number };
            const participant = await groupsModel.join(groupId, userId);
            return res.json({
                success: true,
                message: "Successfully joined to the group.",
                participant,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able join you to the group.",
            });
        }
    },

    updateGroup: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { title, description, ppf } = req.body;
            const group = await groupsModel.update(id, title, description, ppf);

            return res.json({
                success: true,
                message: "Group updated successfully!",
                group,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able to update your group.",
            });
        }
    },

    deleteGroup: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const group = await groupsModel.delete(id);

            return res.json({
                success: true,
                message: "Group deleted successfully!",
                group,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able to delete a group.",
            });
        }
    },

    put: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { profilePictureUrl } = req.body;

        const group = await groupsModel.partialUpdate(id, {
            profilePicture: profilePictureUrl,
        });

        return res.json({
            success: true,
            message: "Group's profile pictuer updated successfully!",
            group,
        });
    },
};

export default groupsController;
