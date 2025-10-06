import { Meta } from "express-validator";
import userModel from "../../../../../db/user.js";
import bcrypt from "bcryptjs";

const checkIfPasswordIsCorrect = async (password: string, { req }: Meta): Promise<Boolean | undefined> => {
    const { username } = req.body;
    const user = await userModel.getUserByUsername(username);

    if (!user) {
        return;
    }

    const passwordIsCorrect = await bcrypt.compare(password, user!.password);

    if (!passwordIsCorrect) {
        throw new Error("The password is not correct.");
    }

    return true;
}

export default checkIfPasswordIsCorrect;
