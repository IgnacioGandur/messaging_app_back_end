import { Request, Response } from "express";
import messagesModel from "../db/messages.js";

const messagesController = {
    getMoreMessages: async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const { cursor } = req.query;

            const limit = 15;

            const messages = await messagesModel.getMoreMessages(
                id,
                limit,
                cursor as string,
            );

            // Remove deleted messagess.
            const filteredMessages = messages.map((m) => {
                return m.deleted ? { ...m, content: "Deleted message." } : m;
            });

            // Check if the "plus one" message is present.
            const hasMore = filteredMessages.length > limit;

            // If "plus one" remove the last message.
            const data = hasMore
                ? filteredMessages.slice(0, limit)
                : filteredMessages;

            const nextCursor = hasMore ? filteredMessages[limit].id : null;

            return res.json({
                success: true,
                message: "More messages retrieved successfully!",
                data: {
                    messages: data.reverse(),
                    nextCursor,
                    hasMore,
                },
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.json({
                error: true,
                message:
                    "Server error. We were not able to get the messages from this conversation.",
            });
        }
    },

    sendMessage: async (req: Request, res: Response) => {
        try {
            const { id: conversationId } = req.params as { id: string };
            const { id: senderId } = req.user as { id: number };
            const { message, file } = req.body;

            if (file) {
                const sentMessage = await messagesModel.createWithAttachment(
                    conversationId,
                    message,
                    senderId,
                    file.name,
                    file.type,
                    file.url,
                );

                return res.json({
                    success: true,
                    message: "Message with attachment send successfully!",
                    sentMessage,
                });
            }

            const sentMessage = await messagesModel.create(
                conversationId,
                message,
                senderId,
            );

            return res.json({
                success: true,
                message: "Message sent successfully!",
                sentMessage,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.json({
                error: true,
                message: "Server error. We were not able to send your message.",
            });
        }
    },

    deleteMessage: async (req: Request, res: Response) => {
        try {
            const { mid: id } = req.params as { mid: string }; // Message id.
            const message = await messagesModel.delete(id);
            return res.json({
                success: true,
                message: "Message deleted successfully!",
                deletedMessage: message,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able to delete your message.",
            });
        }
    },
};

export default messagesController;
