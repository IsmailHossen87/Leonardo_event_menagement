import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();

router.get("/", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), dashboardController.showAllData);
router.get("/user-dashboard", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), dashboardController.showUserDashboardData);


router.patch("/user-status/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), dashboardController.updateUserStatus);
router.get("/user-details/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), dashboardController.userDetials)



export const dashboardRouter = router;