import { Meta } from "express-validator";
import userModel from "../../../../db/user.js";

export default async function checkIfUserExistsById(id: string | number, { req }: Meta) {
    const user = await userModel.getUserById(id);

    if (!user) {
        throw new Error(`The user with and id of: '${id}' doesn't exist.`);
    }

    req.foundUser = user;
    return true;
}

