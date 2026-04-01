import express from 'express';
import { EventController } from './Event.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import validateRequest from '../../middleware/validateRequest';
import { EventValidation } from './Event.validation';
import { USER_ROLES } from '../../../enums/user';
import parseMultipleFileData from '../../middleware/parseMultipleFiledata';
import { IFOLDER_NAMES } from '../../../enums/files';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.ORGANIZER),
     fileUploadHandler(),
     parseFileData(IFOLDER_NAMES.IMAGE),
     parseMultipleFileData(IFOLDER_NAMES.IMAGES),
     validateRequest(EventValidation.createEventZodSchema),
     EventController.createEvent,
);

router.get('/admin', EventController.getAllEventsForAdmin);  //FOR ADMIN
router.get('/', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), EventController.getAllEvents);

router.get('/unpaginated', EventController.getAllUnpaginatedEvents);
router.post("/message-request/:id", auth(USER_ROLES.USER), EventController.messageRequest);  //message request
router.post("/sent-message/:userId", auth(USER_ROLES.ORGANIZER, USER_ROLES.USER), EventController.sendMessage);   //organizer and host sent message to user
router.get('/event-guests/:id', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), EventController.getEventGuests);
router.delete('/hard-delete/:id', auth(USER_ROLES.ORGANIZER), EventController.hardDeleteEvent);
router.get('/qr-route/:id', EventController.getEventByQr);
router.post('/report/:id', auth(USER_ROLES.USER), validateRequest(EventValidation.reportAgainstEventById), EventController.reportAgainstEventById);
router.patch("/host-request/:id", auth(USER_ROLES.USER, USER_ROLES.ORGANIZER), EventController.hostRequest)
router.patch("/registration-status/:userId", auth(USER_ROLES.USER, USER_ROLES.ORGANIZER), EventController.RegistrationStatus)




router.patch(
     '/:id',
     auth(USER_ROLES.ORGANIZER),
     fileUploadHandler(),
     parseFileData(IFOLDER_NAMES.IMAGE),
     parseMultipleFileData(IFOLDER_NAMES.IMAGES),
     validateRequest(EventValidation.updateEventZodSchema),
     EventController.updateEvent,
);

router.delete('/:id', auth(USER_ROLES.ORGANIZER), EventController.deleteEvent);

router.get('/:id', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), EventController.getEventById); //show event details and allRegister user



export const EventRoutes = router;
