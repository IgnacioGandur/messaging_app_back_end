import type { Meta } from "express-validator";

import friendshipsModel from "../../../../db/friendship.js";

export default async function checkIfFriendshipAlreadyExistsByUserId(
    userBId: string | number,
    { req }: Meta,
) {
    const { id: userAId } = req.user as { id: number };
    const friendship = await friendshipsModel.getFriendshipByParticipants(
        userAId,
        userBId,
    );

    if (friendship) {
        throw new Error("This friendship already exists.");
    }

    return true;
}
