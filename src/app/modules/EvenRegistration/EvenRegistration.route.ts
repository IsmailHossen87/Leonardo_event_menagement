import express from 'express';
import { EvenRegistrationController } from './EvenRegistration.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { EvenRegistrationValidation } from './EvenRegistration.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.get("/my-registation-event", auth(USER_ROLES.USER), EvenRegistrationController.myRegistrationEvent)
router.post('/', auth(USER_ROLES.USER), validateRequest(EvenRegistrationValidation.createEvenRegistrationZodSchema), EvenRegistrationController.createEvenRegistration);

router.get('/', auth(USER_ROLES.USER), EvenRegistrationController.getAllEvenRegistrations);



router.get('/admin', auth(USER_ROLES.SUPER_ADMIN), EvenRegistrationController.getAllEvenRegistrationsForAdmin);

router.get('/unpaginated', auth(USER_ROLES.USER), EvenRegistrationController.getAllUnpaginatedEvenRegistrations);

router.delete('/hard-delete/:id', auth(USER_ROLES.USER), EvenRegistrationController.hardDeleteEvenRegistration);

router.patch('/:id', auth(USER_ROLES.USER), validateRequest(EvenRegistrationValidation.updateEvenRegistrationZodSchema), EvenRegistrationController.updateEvenRegistration);
router.patch("/verify-event/:id", auth(USER_ROLES.USER), EvenRegistrationController.verifyEventRegistration);  //verify

router.delete('/:id', auth(USER_ROLES.USER), EvenRegistrationController.deleteEvenRegistration);

router.get('/:id', EvenRegistrationController.getEvenRegistrationById);//Check eventId,Which i register the event


export const EvenRegistrationRoutes = router;
