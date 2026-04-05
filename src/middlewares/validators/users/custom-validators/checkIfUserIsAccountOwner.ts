import { Meta } from "express-validator";
import userModel from "../../../../db/user.js";

const checkIfUserIsAccountOwner = async (
    userId: string | number,
    { req }: Meta,
) => {
    const { id: loggedUserId } = req.user as { id: number };

    const user = await userModel.getUserById(userId);

    if (user?.id !== loggedUserId) {
        throw new Error("You are not the owner of the this account.");
    }

    return true;
};

export default checkIfUserIsAccountOwner;
