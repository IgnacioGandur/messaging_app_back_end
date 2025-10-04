import userModel from "../../../../../db/user.js";

const checkIfUsernameIsAlreadyTaken = async (username: string): Promise<Boolean> => {
    const user = await userModel.getUserByUsername(username);

    if (user) {
        throw new Error(`The username: '${username}' is already taken.`);
    }

    return true;
}

export default checkIfUsernameIsAlreadyTaken;
