import { Router } from "express";
import meController from "../controllers/meController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const meRouter = Router();

meRouter
    .route("/")
    .all(
        isAuthenticated,
        meController.getLoggedUserInfo
    );

export default meRouter;
