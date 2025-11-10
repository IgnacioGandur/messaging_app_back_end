import test_client from "../../db/test_client.js";

export default async function addTestUserToTestGroup(
    groupId: number,
    userId: number,
) {
    const participant = await test_client.participant.create({
        data: {
            userId,
            conversationId: Number(groupId)
        }
    });

    return participant;
}
