import type { Request, Response } from "express";
import participantModel from "../db/participant.js";

const privateConversationParticipantsController = {
    patch: async (req: Request, res: Response) => {
        const { id: userId } = req.user as { id: number };
        const { id: conversationId } = req.params;

        const participant = await participantModel.leavePrivateConversation(
            conversationId,
            userId
        );

        return res.json({
            success: true,
            message: "User leaved privated conversation successfully!",
            participant
        });
    },
}

export default privateConversationParticipantsController;
