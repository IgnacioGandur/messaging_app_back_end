import { Router } from "express";
import authController from "../controllers/authController.js";
import passport from "passport";
import validateRegister from "../middlewares/validators/auth/register/validateRegister.js";
import validateLogin from "../middlewares/validators/auth/login/validateLogin.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const authRouter = Router();

authRouter.route("/register").post(validateRegister, authController.register);

authRouter
    .route("/login")
    .post(validateLogin, passport.authenticate("local"), authController.login);

authRouter.route("/logout").all(isAuthenticated, authController.logout);

// authRouter
//     .route("/protected-route")
//     .all(
//         isAuthenticated,
//         authController.protectedRoute
//     );

export default authRouter;
