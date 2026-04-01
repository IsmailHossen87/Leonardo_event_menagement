import { Router } from "express";
import { StatusController } from "./status.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()

router.route("/").post(auth(USER_ROLES.USER), StatusController.createStatus)
router.route("/all-user").get(auth(USER_ROLES.USER), StatusController.getAllUser);
router.route("/all-status").get(auth(USER_ROLES.USER), StatusController.getAllStatus)
router.route("/:id").get(auth(USER_ROLES.USER), StatusController.getStatusById)


export const StatusRouter = router