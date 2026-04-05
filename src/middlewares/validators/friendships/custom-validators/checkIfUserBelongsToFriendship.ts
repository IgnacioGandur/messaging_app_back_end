import { Meta } from "express-validator";
import friendshipModel from "../../../../db/friendship.js";

export default async function checkIfUserBelongsToFriendship(
    id: string | number,
    { req }: Meta,
) {
    const { id: userId } = req.user as { id: number };
    const friendship = await friendshipModel.getFriendshipById(id);

    if (
        friendship?.userAId !== Number(userId) &&
        friendship?.userBId !== Number(userId)
    ) {
        throw new Error("You are not part of this friendship.");
    }

    return true;
}
