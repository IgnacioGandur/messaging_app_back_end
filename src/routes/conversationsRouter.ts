import { Router } from "express";
import conversationsController from "../controllers/conversationsController.js";

const conversationsRouter = Router();

conversationsRouter
    .route("/")
    .get(conversationsController.get)
    .post(conversationsController.create);

export default conversationsRouter;

