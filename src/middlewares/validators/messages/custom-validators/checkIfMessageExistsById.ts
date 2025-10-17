import messagesModel from "../../../../db/messages.js";

export default async function checkIfMessageExistsById(id: number) {
    const message = await messagesModel.getById(id);

    if (!message) {
        throw new Error(`The message with an id of: '${id}' doesn't exist.`);
    }

    return true;
}
