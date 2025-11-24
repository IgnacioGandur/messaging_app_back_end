import { Router } from "express";
import friendshipsController from "../controllers/friendshipsController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validateFriendshipCreation from "../middlewares/validators/friendships/validateFriendshipCreation.js";
import validateFriendshipResponse from "../middlewares/validators/friendships/validateFriendshipResponse.js";
import validateFriendshipDeletion from "../middlewares/validators/friendships/validateFriendshipDeletion.js";

const friendshipsRouter = Router();

friendshipsRouter
    .route("/")
    .all(
        isAuthenticated
    )
    .get(
        friendshipsController.getFriendships
    )
    .post(
        validateFriendshipCreation,
        friendshipsController.createFriendship
    );

friendshipsRouter
    .route("/:id")
    .all(isAuthenticated)
    .put(
        validateFriendshipResponse,
        friendshipsController.handleFriendshipRequest
    )
    .delete(
        validateFriendshipDeletion,
        friendshipsController.deleteFriendship
    );

export default friendshipsRouter;
