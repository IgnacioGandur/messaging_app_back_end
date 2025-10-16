import { Meta } from "express-validator";
import userModel from "../../../../db/user.js";

const checkIfUserIsAccountOwner = async (userId: string | number, { req }: Meta) => {
    const { id: loggedUserId } = req.user as { id: number };

    const user = await userModel.getUserById(userId);

    if (user?.id !== loggedUserId) {
        throw new Error("You are not the owner of the account your are trying to update.");
    }

    return true;
}

export default checkIfUserIsAccountOwner;
