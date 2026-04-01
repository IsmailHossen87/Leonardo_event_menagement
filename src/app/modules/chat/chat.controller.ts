import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatService } from './chat.service';

const createChat = catchAsync(async (req, res) => {
     const participant = req.body.participant;
     const { userId }: any = req.user;
     const participants = [userId, participant];
     const result = await ChatService.createChatIntoDB(participants);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Chat created successfully',
          data: result,
     });
});

const markChatAsRead = catchAsync(async (req, res) => {
     const { id } = req.params;
     const user: any = req?.user;

     const result = await ChatService.markChatAsRead(user.id, id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Chat marked as read',
          data: result,
     });
});

const getChats = catchAsync(async (req, res) => {
     const { id }: any = req.user;

     const result = await ChatService.getAllChatsFromDB(id, req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Chats retrieved successfully',
          data: {
               chats: result.data,
               // Include chat statistics in data instead of meta
               unreadChatsCount: result.unreadChatsCount,
               totalUnreadMessages: result.totalUnreadMessages,
          },
          meta: result.meta,
     });
});

const deleteChat = catchAsync(async (req, res) => {
     const { userId }: any = req.user;
     const { chatId } = req.params;
     const result = await ChatService.softDeleteChatForUser(chatId, userId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Chat deleted successfully',
          data: result,
     });
});

// New controller: Mute/Unmute chat
const muteUnmuteChat = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { chatId } = req.params;
     const { action, reasonOfMute } = req.body; // 'mute' or 'unmute'

     const result = await ChatService.muteUnmuteChat(id, chatId, action, reasonOfMute);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: `Chat ${action}d successfully`,
          data: result,
     });
});

// New controller: Block/Unblock user
const blockUnblockUser = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { chatId, targetUserId } = req.params;
     const { action, reasonOfBlock } = req.body; // 'block' or 'unblock'

     const result = await ChatService.blockUnblockUser(id, targetUserId, chatId, action, reasonOfBlock);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: `User ${action}ed successfully`,
          data: result,
     });
});

// chat monitoring
const chatMonitoring = catchAsync(async (req, res) => {
     const user = req.user;

     const result = await ChatService.chatMonitoring(user);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: `All seminar fetched successfully`,
          data: result,
     });
});

const chatMonitoringById = catchAsync(async (req, res) => {
     const user = req.user;
     const { id } = req.params;
     const result = await ChatService.chatMonitoringById(user, id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: `All seminar fetched successfully`,
          data: result,
     });
});

// Organazer can see all chat history
const chatHistory = catchAsync(async (req, res) => {
     const user = req.user;
     const result = await ChatService.chatHistory(user);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: `All chat history fetched successfully`,
          data: result,
     });
});

export const ChatController = {
     createChat,
     getChats,
     markChatAsRead,
     deleteChat,
     muteUnmuteChat,
     blockUnblockUser,
     chatMonitoring,
     chatMonitoringById,
     chatHistory
};
