import type { Meta } from "express-validator";
import messagesModel from "../../../../db/messages.js";
import conversationsModel from "../../../../db/conversation.js";

export default async function checkIfUserCanDeleteMessage(id: number, { req }: Meta) {
    const { id: loggedUserId } = req.user;
    const { id: conversationId } = req.params as { id: number };
    const conversation = await conversationsModel.getPrivateConversationById(conversationId);

    const owner = conversation?.participants.find((p) => {
        return p.role === "OWNER" && p.userId === loggedUserId;
    });

    const isAdmin = conversation?.participants.find((p) => {
        return p.role === "ADMIN" && p.userId === loggedUserId;
    })

    const message = await messagesModel.getById(id);

    const isMessageOwner = message?.senderId === req.user.id;

    // If user trying to delete the message is not group owner || admin || message owner.
    if (!owner && !isAdmin && !isMessageOwner) {
        throw new Error("Only message owners, group admins or group owners can delete messages.")
    }

    return true;
}
