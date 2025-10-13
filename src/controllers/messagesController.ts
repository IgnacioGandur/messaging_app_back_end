import { Request, Response } from "express";
import messagesModel from "../db/messages.js";

const messagesController = {
    create: async (req: Request, res: Response) => {
        try {
            const { id: senderId } = req.user as { id: string };

            const {
                conversationId,
                content
            } = req.body;

            const message = await messagesModel.create(
                content,
                senderId,
                conversationId
            );

            return res.json({
                success: true,
                message: "Message created successfully!",
                sentMessage: message
            });
        } catch (error) {
            console.log("Controller error:", error);
            return res.json({
                error: true,
                message: "Server error. We were not able to create the message.",
            });
        }
    }
}

export default messagesController;
