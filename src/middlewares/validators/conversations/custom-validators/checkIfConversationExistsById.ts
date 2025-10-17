import conversationModel from "../../../../db/conversation.js";

export default async function checkIfConversationExistsById(id: number) {
    const conversation = await conversationModel.getPrivateConversationById(id);

    if (!conversation) {
        throw new Error(`The conversation with and id of: '${id}' doesn't exist.`);
    }

    return true;
};
