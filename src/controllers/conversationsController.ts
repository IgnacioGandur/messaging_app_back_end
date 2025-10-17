import { Request, Response } from "express";
import conversationModel from "../db/conversation.js";

const conversationsController = {
    getPrivateConversation: async (req: Request, res: Response) => {
        const { id: conversationId } = req.params;

        const conversation = await conversationModel.getPrivateConversationById(conversationId);

        // Replace "deleted" messages if any.
        const filteredConversation = {
            ...conversation,
            messages: conversation!.messages.map((m) =>
                m.deleted ? { ...m, content: "Deleted message." } : m
            ),
        };

        return res.json({
            success: true,
            message: "Private conversation retrieved successfully!",
            conversation: filteredConversation
        });
    },

    getConversations: async (req: Request, res: Response) => {
        const { id } = req.user as { id: number };
        const { groups } = req.query;

        if (groups) {
            const groupConversations = await conversationModel.getGroupConversations()
            return res.json({
                success: true,
                message: "Groups successfully retrieved!",
                groups: groupConversations
            });
        };

        const conversations = await conversationModel.getAllUserPrivateConversations(id);

        const filteredConversations = conversations.map((c) => ({
            ...c,
            messages: c.messages.map((m) => ({
                ...m,
                content: m.deleted ? "Message deleted." : m.content,
            })),
        }));

        return res.json({
            success: true,
            message: "User conversations retrieved successfully!",
            conversations: filteredConversations
        });
    },

    createPrivateConversation: async (req: Request, res: Response) => {
        try {
            const { id: userAId } = req.user as { id: number };
            const {
                recipientId: userBId,
                message
            } = req.body;

            const conversation = await conversationModel.getPrivateConversation(userAId, userBId);

            // if there's no conversation start a new one.
            if (!conversation) {
                const newConversation = await conversationModel.createPrivateConversation(userAId, userBId, message);
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
