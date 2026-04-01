import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { AdminController } from './admin.controller';
import { AdminValidation } from './admin.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
const router = express.Router();

router.post('/create-admin', auth(USER_ROLES.SUPER_ADMIN), validateRequest(AdminValidation.createAdminZodSchema), AdminController.createAdmin);
router.get('/get-admin', auth(USER_ROLES.SUPER_ADMIN), AdminController.getAdmin);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN), AdminController.deleteAdmin);
// MY PART
router.patch('/action/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), AdminController.eventsAction);



export const AdminRoutes = router;
