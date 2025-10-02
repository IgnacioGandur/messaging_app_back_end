import { Router } from "express";
import indexController from "../controllers/indexController.js";

const indexRouter = Router();

indexRouter.route("/").get(indexController.indexGet);

export default indexRouter;
