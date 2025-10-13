import test_client from "../../db/test_client.js";

export default async function deleteTestConversations() {
    try {
        await test_client.conversation.deleteMany();
    } catch (error) {
        console.error("Prisma error:", error);
        throw new Error("Not able to delete all test conversations.");
    }
} 
