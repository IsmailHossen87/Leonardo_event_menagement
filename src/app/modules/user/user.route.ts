import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import validateRequest from '../../middleware/validateRequest';
import parseFileData from '../../middleware/parseFileData';
import { IFOLDER_NAMES } from '../../../enums/files';
// import { IFOLDER_NAMES } from '../../../enums/files';
const router = express.Router();

router
     .route('/profile')
     .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ORGANIZER), UserController.getUserProfile)
     .patch(
          auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
          fileUploadHandler(),
          parseFileData(IFOLDER_NAMES.IMAGE, IFOLDER_NAMES.GALLARY),
          validateRequest(UserValidation.updateUserZodSchema),
          UserController.updateProfile,
     );

router.route('/approve-request').patch(
     auth(USER_ROLES.USER),
     UserController.approveHostRequest,
);

router.route('/').post(
     // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     fileUploadHandler(),
     parseFileData(IFOLDER_NAMES.IMAGE, IFOLDER_NAMES.GALLARY),
     validateRequest(UserValidation.createUserZodSchema),
     UserController.createUser,
);

// Admin routes for user management
router.route('/admin').post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), validateRequest(UserValidation.createUserZodSchema), UserController.createAdmin);
// User search and management routes
router.route('/find/id/:id').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.findUserById);

router.route('/find/email/:email').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.findUserByEmail);

router.route('/find/google/:googleId').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.findUserByGoogleId);

router.route('/find/facebook/:facebookId').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.findUserByFacebookId);

router.route('/all').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.getAllUsers);

router.route('/delete-me').delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER, USER_ROLES.USER), UserController.deleteMyAccount);

router.route('/role/:role').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.getUsersByRole);

router.route('/oauth').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.getOAuthUsers);

router.route('/local').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.getLocalUsers);

router.route('/search').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.searchUsers);

router.route('/stats').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.getUserStats);

// patch notification by userId
router.route('/toggle-notification/:userId').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), validateRequest(UserValidation.toggleUserNotification), UserController.toggleUserNotification);

router.route('/:userId/link-oauth').post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.linkOAuthAccount);

router.route('/:userId/unlink-oauth').post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), UserController.unlinkOAuthAccount);

export const UserRouter = router;
