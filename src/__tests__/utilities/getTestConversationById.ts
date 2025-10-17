import test_client from "../../db/test_client.js";


export default async function getTestConversationById(id: number) {
    try {
        const conversation = await test_client.conversation.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                messages: true,
            }
        });

        return conversation;
    } catch (error) {
        console.error("Test error:", error);
        throw new Error("Something went wrong when trying to retrieve a test conversation by it's id.");
    }
};
