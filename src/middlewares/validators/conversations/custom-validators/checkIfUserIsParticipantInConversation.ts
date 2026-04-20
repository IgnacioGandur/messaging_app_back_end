import { Meta } from "express-validator";
import { Participant } from "@prisma/client";

export default async function checkIfUserIsParticipantInConversation({
    req,
}: Meta) {
    const conversation = req.foundConversation;

    const { id: userId } = req.user as { id: number };

    const isParticipant = conversation.participants.some(
        (p: Participant) => p.userId === userId,
    );

    if (!isParticipant) {
        throw new Error("You are not a part of this conversation.");
    }

    return true;
}
