import userModel from "../../../../../db/user.js";

const checkIfUserExistsByUsername = async (username: string): Promise<Boolean> => {
    const user = await userModel.getUserByUsername(username);

    if (!user) {
        throw new Error(`The user with the username: '${username}' doesn't exist.`)
    }

    return true;
}

export default checkIfUserExistsByUsername;
