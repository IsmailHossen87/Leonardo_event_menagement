import { Router } from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

// Existing routes
router.get(
  '/',
  auth(
    USER_ROLES.ORGANIZER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER,
  ),
  ChatController.getChats,
);
// No need this project
router.post(
  '/create-chat',
  auth(
    USER_ROLES.ORGANIZER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER,
  ),
  ChatController.createChat,
);
// chat Monitorin
router.get("/monitoring", auth(USER_ROLES.SUPER_ADMIN), ChatController.chatMonitoring)
router.get("/chat-history", auth(USER_ROLES.ORGANIZER), ChatController.chatHistory)
router.get("/monitoring/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZER), ChatController.chatMonitoringById)
router.patch(
  '/mark-chat-as-read/:id',
  auth(
    USER_ROLES.ORGANIZER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER,
  ),
  ChatController.markChatAsRead,
);
router.delete(
  '/delete/:chatId',
  auth(
    USER_ROLES.ORGANIZER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER,
  ),
  ChatController.deleteChat,
);

// New routes for additional features
router.patch(
  '/mute-unmute/:chatId',
  auth(
    USER_ROLES.ORGANIZER,
  ),
  ChatController.muteUnmuteChat,
);
router.patch(
  '/block-unblock/:chatId/:targetUserId',
  auth(
    USER_ROLES.ORGANIZER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER,
  ),
  ChatController.blockUnblockUser,
);

export const chatRoutes = router;
