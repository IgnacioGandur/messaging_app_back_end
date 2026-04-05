import test_client from "../../db/test_client.js";

const getTestUser = async (username: string) => {
    try {
        const user = await test_client.user.findUnique({
            where: {
                username,
            },
        });

        return user;
    } catch (error) {
        console.error("Test error:", error);
        throw new Error("Error while trying to retrieve a test user.");
    }
};

export default getTestUser;
