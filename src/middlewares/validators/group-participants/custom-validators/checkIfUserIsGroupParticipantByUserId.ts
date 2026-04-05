import { Meta } from "express-validator";
import groupParticipantsModel from "../../../../db/participant.js";

export default async function checkIfUserIsGroupParticipantByUserId(
    userId: number | string,
    { req }: Meta,
) {
    const { id: groupId } = req.params as { id: number };

    const participant = await groupParticipantsModel.getGroupParticipantById(
        groupId,
        userId,
    );

    if (!participant) {
        throw new Error(
            `The user with an id of: '${userId}' is not a participant of this group.`,
        );
    }

    return true;
}
