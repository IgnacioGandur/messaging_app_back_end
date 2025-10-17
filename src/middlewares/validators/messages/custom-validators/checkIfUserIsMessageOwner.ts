import type { Meta } from "express-validator";
import messagesModel from "../../../../db/messages.js";

export default async function checkIfUserIsMessageOwner(id: number, { req }: Meta) {
    const message = await messagesModel.getById(id);

    if (message?.senderId !== req.user.id) {
        throw new Error("Only the message owner can delete the message in this conversation.");
    }

    return true;
}
