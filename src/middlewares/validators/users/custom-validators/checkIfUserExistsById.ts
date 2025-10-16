import userModel from "../../../../db/user.js";

export default async function checkIfUserExistsById(id: string | number) {
    const user = await userModel.getUserById(id);

    if (!user) {
        throw new Error(`The user with and id of: '${id}' doesn't exist.`);
    }

    return true;
}

