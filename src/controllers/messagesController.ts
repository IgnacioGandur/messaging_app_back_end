import { Request, Response } from "express";
import messagesModel from "../db/messages.js";

const messagesController = {
    sendMessage: async (req: Request, res: Response) => {
        try {
            const { id: conversationId } = req.params;
            const { id: senderId } = req.user as { id: number };
            const { message } = req.body;

            const sentMessage = await messagesModel.create(
                conversationId,
                message,
                senderId
            );

            return res.json({
                success: true,
                message: "Message sent successfully!",
                sentMessage
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.json({
                error: true,
                message: "Server error. We were not able to send your message.",
            })
        }
    },

    deleteMessage: async (req: Request, res: Response) => {
        try {
            const { mid: id } = req.params // Message id.
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
                message: "Server error. We were not able to delete your message.",
            });
        }
    },
}

export default messagesController;
