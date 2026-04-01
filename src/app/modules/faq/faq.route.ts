import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { FaqController } from './faq.controller';
import { FaqValidation } from './faq.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
const router = express.Router();

router
     .route('/')
     .post(validateRequest(FaqValidation.createFaqZodSchema), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), FaqController.createFaq)
     .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER, USER_ROLES.USER), FaqController.getFaqs);

router.route('/:id')
     .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER, USER_ROLES.USER), FaqController.getFaq)
     .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), FaqController.deleteFaq)
     .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), FaqController.updateFaq);

export const FaqRoutes = router;
