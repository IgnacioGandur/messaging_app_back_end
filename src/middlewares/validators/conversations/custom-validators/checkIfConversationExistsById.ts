import { Meta } from "express-validator";
import conversationModel from "../../../../db/conversation.js";

export default async function checkIfConversationExistsById(id: number, { req }: Meta) {
    const conversation = await conversationModel.getPrivateConversationById(id);

    if (!conversation) {
        throw new Error(`The conversation with and id of: '${id}' doesn't exist.`);
    }

    req.foundConversation = conversation;
    return true;
};
