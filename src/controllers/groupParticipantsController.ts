import type { Request, Response } from "express";
import groupParticipantModel from "../db/participant.js";

const groupParticipantsController = {
    updateUserRole: async (req: Request, res: Response) => {
        try {
            const { id: conversationId } = req.params as { id: string };
            const { userId, role } = req.body;

            const participant = await groupParticipantModel.updateAdminStatus(
                conversationId,
                userId,
                role,
            );

            return res.json({
                success: true,
                message: "User role updated successfully!",
                participant,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able to update the user role.",
            });
        }
    },

    removeUserFromGroup: async (req: Request, res: Response) => {
        try {
            const { id: conversationId } = req.params as { id: string };
            const { userId, isLeavingGroup } = req.body;

            if (isLeavingGroup) {
                const { id } = req.user as { id: number };

                const participant = await groupParticipantModel.leaveGroup(
                    conversationId,
                    id,
                );

                return res.json({
                    success: true,
                    message: "Abandoned group conversation successfully!",
                    participant,
                });
            }

            const participant =
                await groupParticipantModel.removeParticipantFromGroup(
                    conversationId,
                    userId,
                );

            return res.json({
                success: true,
                message: "User removed from group successfully!",
                participant,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able to remove the user from the group.",
            });
        }
    },
};

export default groupParticipantsController;
