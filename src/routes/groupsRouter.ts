import { Router } from "express";
import groupsController from "../controllers/groupsController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import validateGroupCreation from "../middlewares/validators/groups/validateGroupCreation.js";
import { validateGroupUpdate } from "../middlewares/validators/groups/validateGroupUpdate.js";
import validateGroupDeletion from "../middlewares/validators/groups/validateGroupDeletion.js";
import validateJoiningGroup from "../middlewares/validators/groups/validateJoiningGroup.js";

const groupsRouter = Router();

groupsRouter
    .route("/")
    .get(groupsController.getAllGroups)
    .post(isAuthenticated, validateGroupCreation, groupsController.createGroup);

groupsRouter
    .route("/:id")
    .all(isAuthenticated)
    .post(validateJoiningGroup, groupsController.joinGroup)
    .patch(validateGroupUpdate, groupsController.updateGroup)
    .put(groupsController.put)
    .delete(validateGroupDeletion, groupsController.deleteGroup);

export default groupsRouter;
