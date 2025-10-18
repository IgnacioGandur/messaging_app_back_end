import test_client from "../../db/test_client.js";

export default async function createTestGroup(
    creatorId: string | number,
    title: string,
) {
    try {
        const group = await test_client.conversation.create({
            data: {
                isGroup: true,
                title,
                participants: {
                    create: {
                        userId: Number(creatorId),
                        role: "OWNER"
                    }
                }
            }
        });

        return group;
    } catch (error) {
        console.error("Test error:", error);
        throw new Error("Error while trying to create a new test group.");
    }
};
