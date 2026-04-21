import { Request, Response } from "express";
import conversationModel from "../db/conversation.js";
import messagesModel from "../db/messages.js";
import handlePrismaErrors from "../utilities/handlePrismaErrors.js";
import { Prisma } from "@prisma/client";

type ConversationWithMessages = Prisma.ConversationGetPayload<{
    include: {
        messages: true;
    };
}>;

const conversationsController = {
    getPrivateConversation: async (req: Request, res: Response) => {
        try {
            const { id: conversationId } = req.params;

            const conversation =
                req.foundConversation as ConversationWithMessages;

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found.",
                    errors: [
                        {
                            msg: `The conversation with an Id of: "${conversationId}" doesn't exist.`,
                        },
                    ],
                });
            }

            // Replace "deleted" messages if any.
            const filteredConversation = {
                ...conversation,
                messages: conversation.messages.map((m) =>
                    m.deleted ? { ...m, content: "Deleted message." } : m,
                ),
            };

            const messageCursorId =
                conversation?.messages[conversation.messages.length - 1]?.id;
            const hasMore = conversation?.messages.length! > 10;

            return res.json({
                success: true,
                message: "Private conversation retrieved successfully!",
                conversation: filteredConversation,
                messageCursorId,
                hasMore,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return handlePrismaErrors(error, res, "Conversation");
        }
    },

    getConversations: async (req: Request, res: Response) => {
        const { id } = req.user as { id: number };
        const search = req.query.search as string;
        const take = req.query.take as string;

        const { conversations, count } =
            await conversationModel.getUserConversations(id, search, take);

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
            data: {
                conversations: filteredConversations,
                count,
            },
        });
    },

    createPrivateConversation: async (req: Request, res: Response) => {
        try {
            const { id: userAId } = req.user as { id: number };
            const { recipientId: userBId, message } = req.body;

            const conversation = await conversationModel.getPrivateConversation(
                userAId,
                userBId,
            );

            if (conversation) {
                const createdMessage = await messagesModel.create(
                    conversation.id,
                    message,
                    userAId,
                );

                return res.json({
                    success: true,
                    message: "Conversation already exists. Message sent.",
                    createdMessage,
                    conversation,
                });
            } else {
                const newConversation =
                    await conversationModel.createPrivateConversation(
                        userAId,
                        userBId,
                        message,
                    );
                return res.json({
                    success: true,
                    message: "Conversation created successfully!",
                    conversation: newConversation,
                });
            }
        } catch (error) {
            console.error("Controller error:", error);
            return res.json({
                error: true,
                message:
                    "Server error. We were not able to create a conversation.",
            });
        }
    },
};

export default conversationsController;
