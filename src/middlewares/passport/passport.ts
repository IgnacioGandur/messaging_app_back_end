import userModel from "../../db/user.js";
import localStrategy from "./local-strategy.js";
import passport from "passport";

passport.use(localStrategy);

passport.serializeUser((user, done) => {
    const { id: userId } = user as { id: number };
    return done(null, userId);
});

passport.deserializeUser(async (userId: number, done) => {
    try {
        const user = await userModel.getUserById(userId);
        return done(null, user);
    } catch (error) {
        return done(error);
    }
})
