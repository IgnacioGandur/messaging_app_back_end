import { Meta } from "express-validator";
import participantsModel from "../../../../db/participant.js";

export default async function checkIfUserBelongsToGroup(
    groupId: number | string,
    { req }: Meta,
) {
    const { userId } = req.body;
    const participant = await participantsModel.getGroupParticipantById(
        groupId,
        userId,
    );

    if (!participant) {
        throw new Error(
            "The user you are trying to give admin privileges to is not a part of the group.",
        );
    }

    return true;
}
