import { Router } from "express";
import usersController from "../controllers/usersController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validateUserDeletion from "../middlewares/validators/users/validateUserDeletion.js";
import validateUserExistence from "../middlewares/validators/users/validateUserExistence.js";

const usersRouter = Router();

usersRouter
    .route("/")
    .all(isAuthenticated)
    .get(usersController.getAll);

usersRouter
    .route("/:id")
    .get(
        validateUserExistence,
        usersController.get
    )
    .delete(
        isAuthenticated,
        validateUserDeletion,
        usersController.delete
    );

export default usersRouter;
