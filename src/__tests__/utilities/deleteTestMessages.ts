import test_client from "../../db/test_client.js";

const deleteTestMessages = async () => {
    await test_client.message.deleteMany();
};

export default deleteTestMessages;
