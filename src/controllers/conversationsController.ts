import { Request, Response } from "express";
import conversationModel from "../db/conversation.js";

const conversationsController = {
    get: async (req: Request, res: Response) => {
        const { id } = req.user as { id: number };

        const conversations = await conversationModel.get(id);
        console.log("The content of conversations is:", conversations);

        return res.json({
            success: true,
            message: "hello",
            conversations
        });
    },

    create: async (req: Request, res: Response) => {
        try {
            const { id: userAId } = req.user as { id: number };
            const {
                recipientId: userBId,
                message
            } = req.body;

            const conversation = await conversationModel.get(userAId, userBId);

            if (!conversation) {
                // if there's no conversation start a new one.
                const newConversation = await conversationModel.create(userAId, userBId, message);
                return res.json({
                    success: true,
                    message: "Conversation created successfully!",
                    conversation: newConversation,
                });
            } else {
                return res.json({
                    success: false,
                    message: "The conversation already exists.",
                    conversation
                });
            };
        } catch (error) {
            console.error("Controller error:", error);
            return res.json({
                error: true,
                message: "Server error. We were not able to create a conversation.",
            })
        }
    },
}

export default conversationsController;
