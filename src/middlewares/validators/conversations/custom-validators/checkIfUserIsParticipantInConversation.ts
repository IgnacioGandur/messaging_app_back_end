import { Meta } from "express-validator";
import { Participant } from "../../../../generated/prisma/index.js";
// import conversationModel from "../../../../db/conversation.js";

export default async function checkIfUserIsParticipantInConversation(id: number, { req }: Meta) {
    // const conversation = await conversationModel.getPrivateConversationById(id);
    const conversation = req.foundConversation;

    const { id: userId } = req.user as { id: number };

    const isParticipant = conversation.participants.some((p: Participant) => p.userId === userId);

    if (!isParticipant) {
        throw new Error("You are not a part of this conversation.");
    }

    return true;
}
