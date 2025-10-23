import { Request, Response } from "express";
import groupsModel from "../db/group.js";

const groupsController = {
    createGroup: async (req: Request, res: Response) => {
        try {
            const { id: userId } = req.user as { id: number | string };
            const { groupName } = req.body;
            const profilePicture = `https://ui-avatars.com/api/?name=${groupName}&background=random&color=fff`;

            const group = await groupsModel.createGroup(
                profilePicture,
                groupName,
                userId,
            );

            return res.json({
                success: true,
                message: "Group created successfully!",
                group
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able to create your group.",
            })
        }
    },

    getAllGroups: async (_req: Request, res: Response) => {
        try {
            const groups = await groupsModel.getAll();

            return res.json({
                success: true,
                message: "All groups retrieved successfully!",
                groups,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able to get all groups.",
            })
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
                participant
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message: "Server error. We were not able join you to the group.",
            })
        }
    },

    updateGroup: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const group = await groupsModel.update(id, name);
            return res.json({
                success: true,
                message: "Group name updated successfully!",
                group
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
    }

}

export default groupsController;
