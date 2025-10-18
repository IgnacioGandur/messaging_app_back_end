import { Meta } from "express-validator";
import groupsModel from "../../../../db/group.js";


export default async function checkIfUserIsGroupOwner(id: number, { req }: Meta) {
    const group = await groupsModel.getById(id);
    const { id: userId } = req.user as { id: number };

    const owner = group?.participants.find((p) => p.role === "OWNER");

    if (owner?.user.id !== userId) {
        throw new Error("Only the owner of the group can perform this action.");
    };

    return true;
}
