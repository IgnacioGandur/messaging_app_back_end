import test_client from "../../db/test_client.js";

export default async function createTestFriendship(
    userAId: number,
    userBId: number,
) {
    const friendship = await test_client.friendship.create({
        data: {
            userAId,
            userBId,
        },
    });

    return friendship;
}
