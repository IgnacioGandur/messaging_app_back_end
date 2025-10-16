import { Router } from "express";
import usersController from "../controllers/usersController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validateUserUpdate from "../middlewares/validators/users/validateUserUpdate.js";
import validateUserDeletion from "../middlewares/validators/users/validateUserDeletion.js";

const usersRouter = Router();

usersRouter
    .route("/")
    .get(usersController.getAll);

usersRouter
    .route("/:id")
    .get(usersController.get)
    .patch(
        isAuthenticated,
        validateUserUpdate,
        usersController.update
    )
    .delete(
        isAuthenticated,
        validateUserDeletion,
        usersController.delete
    );

export default usersRouter;
