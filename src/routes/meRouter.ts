import { Router } from "express";
import meController from "../controllers/meController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validateUserUpdate from "../middlewares/validators/users/validateUserUpdate.js";
import validatePartialUserUpdate from "../middlewares/validators/users/validatePartialUserUpdate.js";

const meRouter = Router();

meRouter
    .route("/")
    .all(isAuthenticated)
    .get(meController.get)
    .patch(validateUserUpdate, meController.patch)
    .put(validatePartialUserUpdate, meController.put)
    .delete(meController.delete);

export default meRouter;
