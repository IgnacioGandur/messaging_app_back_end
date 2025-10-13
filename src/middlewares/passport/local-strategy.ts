import userModel from "../../db/user.js";
import { Strategy } from "passport-local";
import bcrypt from "bcryptjs";
import { type User } from "../../generated/prisma/client.js";

export default new Strategy(async function verify(username, password, done) {
    try {
        const user = await userModel.getUserByUsername(username) as User;

        // If user doesn't exist.
        if (!user) {
            return done(null, false);
        };

        // If password is not correct.
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return done(null, false);
        };

        // If user exists and password is correct.
        return done(null, user);

    } catch (error) {
        return done(error);
    }
});

