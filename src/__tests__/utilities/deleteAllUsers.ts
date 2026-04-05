import test_client from "../../db/test_client.js";

const deleteAllUsers = async () => {
    try {
        await test_client.user.deleteMany();
    } catch (error) {
        console.error("Prisma error:", error);
        throw new Error(
            "Something went wrong when trying to delete all users in the test database.",
        );
    }
};

export default deleteAllUsers;
