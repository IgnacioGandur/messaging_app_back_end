import friendshipsModel from "../../../../db/friendship.js";

export default async function checkIfFriendshipExistsById(
    id: string | number
) {
    const friendship = await friendshipsModel.getFriendshipById(id);

    if (!friendship) {
        throw new Error(`The friendship with an id of ${id} doesn't exist.`);
    }

    return true;
};
