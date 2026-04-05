import { Meta } from "express-validator";
import groupsModel from "../../../../db/group.js";

export default async function checkIfUserIsAlreadyParticipant(
    id: number,
    { req }: Meta,
) {
    const group = await groupsModel.getById(id);
    const { id: userId } = req.user as { id: number };

    const isParticipant = group!.participants.find((p) => p.userId === userId);

    if (isParticipant) {
        throw new Error("You are already a participant in this group.");
    }

    return true;
}
