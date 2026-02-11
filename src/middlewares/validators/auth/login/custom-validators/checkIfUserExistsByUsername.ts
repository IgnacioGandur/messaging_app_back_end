import { Meta } from "express-validator";
import userModel from "../../../../../db/user.js";

const checkIfUserExistsByUsername = async (username: string, { req }: Meta): Promise<Boolean> => {
    const user = await userModel.getUserByUsername(username);

    if (!user) {
        throw new Error(`The user with the username: '${username}' doesn't exist.`)
    }

    req.foundUser = user;
    return true;
}

export default checkIfUserExistsByUsername;
