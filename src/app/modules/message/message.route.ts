import express from 'express';
import { MessageController } from './message.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMultipleFileData from '../../middleware/parseMultipleFiledata';
import { IFOLDER_NAMES } from '../../../enums/files';
// import { FOLDER_NAMES } from '../../../enums/files';
const router = express.Router();

// Done 
router.post(
  '/send-message/:chatId',
  auth(
    USER_ROLES.USER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ORGANIZER,
  ),
  fileUploadHandler(),
  parseMultipleFileData(IFOLDER_NAMES.IMAGES),
  MessageController.sendMessage,
);
router.post("/violate/:messageId", auth(USER_ROLES.USER), MessageController.violateMessage)

router.get(
  '/:chatId',
  auth(
    USER_ROLES.USER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ORGANIZER,
  ),
  MessageController.getMessages,
);

router.post(
  '/react/:messageId',
  auth(
    USER_ROLES.USER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ORGANIZER,
  ),
  MessageController.addReaction,
);

router.delete(
  '/delete/:messageId',
  auth(
    USER_ROLES.USER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ORGANIZER,
  ),
  MessageController.deleteMessage,
);

// New route for pin/unpin message
router.patch(
  '/pin-unpin/:messageId',
  auth(
    USER_ROLES.USER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ORGANIZER,
  ),
  MessageController.pinUnpinMessage,
);

export const messageRoutes = router;