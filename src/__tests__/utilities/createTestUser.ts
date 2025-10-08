import bcrypt from "bcryptjs";
import test_client from "../../db/test_client.js";

const createTestUser = async (username: string, password: string) => {
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        await test_client.user.create({
            data: {
                username,
                password: hashedPass,
            }
        });
    } catch (error) {
        console.error("Test error:", error);
        throw new Error("Error while trying to create a user for tests.");
    }
};

export default createTestUser;
