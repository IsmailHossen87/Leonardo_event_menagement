import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Chat } from '../chat/chat.model';
import { IMessage } from './message.interface';
import { Message, ViolateMessage } from './message.model';
import { Types } from 'mongoose';
import { Event } from '../Event/Event.model';

// Enhanced version with better error handling and logging
// const sendMessageToDB = async (payload: IMessage): Promise<IMessage> => {
//      // Check if chat exists
//      const chat = await Chat.findById(payload.chatId);
//      if (!chat) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Chat not found');
//      }
//      if (chat.mutedBy) {
//           throw new AppError(StatusCodes.FORBIDDEN, 'You are muted from this chat');
//      }

//      // Check if sender is blocked
//      const isBlockedByMute = chat.blockedUsers?.some(
//           (block: any) =>
//                (block.blocker.toString() === payload.sender.toString() && chat.participants.some((p) => p.toString() === block.blocked.toString())) ||
//                (block.blocked.toString() === payload.sender.toString() && chat.participants.some((p) => p.toString() === block.blocker.toString())),
//      );

//      if (isBlockedByMute) {
//           throw new AppError(StatusCodes.FORBIDDEN, 'Cannot send message to blocked user');
//      }

//      // Verify sender is participant
//      const isSenderParticipant = chat.participants.some((p) => p.toString() === payload.sender.toString());

//      if (!isSenderParticipant) {
//           throw new AppError(StatusCodes.FORBIDDEN, 'Sender is not a participant in this chat');
//      }

//      // Check if sender is blocked
//      const isBlocked = chat.blockedUsers?.some(
//           (block: any) =>
//                (block.blocker.toString() === payload.sender.toString() && chat.participants.some((p) => p.toString() === block.blocked.toString())) ||
//                (block.blocked.toString() === payload.sender.toString() && chat.participants.some((p) => p.toString() === block.blocker.toString())),
//      );

//      if (isBlocked) {
//           throw new AppError(StatusCodes.FORBIDDEN, 'Cannot send message to blocked user');
//      }

//      // Create message with proper defaults
//      const messagePayload = {
//           ...payload,
//           read: false, // Always false for new messages
//           readAt: null,
//           isDeleted: false,
//           createdAt: new Date(),
//      };

//      const response = await Message.create(messagePayload);

//      // Update chat - remove ALL participants from readBy except sender
//      // This ensures unread count is calculated correctly
//      await Chat.findByIdAndUpdate(
//           response?.chatId,
//           {
//                lastMessage: response._id,
//                readBy: [payload.sender.toString()], // Only sender has read it
//                updatedAt: new Date(),
//           },
//           { new: true },
//      );

//      // Get populated message for socket
//      const populatedMessage = await Message.findById(response._id).populate('sender', 'name email profile').lean();

//      // Get updated chat with populated data for chat list update
//      const populatedChat = await Chat.findById(response?.chatId).populate('participants', 'name email profile').populate('lastMessage').lean();

//      // Socket emissions
//      //@ts-ignore
//      const io = global.io;

//      if (chat.participants && io) {
//           const otherParticipants = chat.participants.filter((participant) => participant && participant.toString() !== payload.sender.toString());

//           // Emit to each participant
//           otherParticipants.forEach((participantId) => {
//                const participantIdStr = participantId.toString();

//                // Emit new message
//                io.emit(`newMessage::${participantIdStr}`, populatedMessage);

//                // Emit unread count update - let frontend handle the increment
//                io.emit(`unreadCountUpdate::${participantIdStr}`, {
//                     chatId: payload.chatId,
//                     action: 'increment', // Frontend should increment its local count
//                });

//                // Emit chat list update to move this chat to top
//                io.emit(`chatListUpdate::${participantIdStr}`, {
//                     chatId: payload.chatId,
//                     chat: populatedChat,
//                     action: 'moveToTop',
//                     lastMessage: populatedMessage,
//                     updatedAt: new Date(),
//                });
//           });

//           // Also emit chat list update to sender (to update their own chat list)
//           const senderIdStr = payload.sender.toString();
//           io.emit(`chatListUpdate::${senderIdStr}`, {
//                chatId: payload.chatId,
//                chat: populatedChat,
//                action: 'moveToTop',
//                lastMessage: populatedMessage,
//                updatedAt: new Date(),
//           });
//      }

//      return response;
// };

const sendMessageToDB = async (payload: IMessage): Promise<IMessage> => {

     // 1️⃣ Find chat
     const chat = await Chat.findById(payload.chatId);

     if (!chat) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Chat not found');
     }

     const senderId = payload.sender.toString();

     // 🔹 Host permission check (only if the chat is linked to an event)
     if (chat.eventId) {
          const event = await Event.findById(chat.eventId).select('host createdBy sendGroupChatPermission messageFreezePermission');
          if (event) {
               const isHost = event.host?.some((h: any) => String(h) === senderId);
               const isCreator = String(event.createdBy) === senderId;

               // Only apply restrictions to hosts (not the creator/organizer)
               if (isHost && !isCreator) {
                    if (!event.sendGroupChatPermission) {
                         throw new AppError(
                              StatusCodes.FORBIDDEN,
                              'Group chat is disabled for this event. Hosts cannot send messages.'
                         );
                    }
                    if (event.messageFreezePermission) {
                         throw new AppError(
                              StatusCodes.FORBIDDEN,
                              'Messages are frozen for this event. Hosts can only view messages.'
                         );
                    }
               }
          }
     }

     const isParticipant = chat.participants.some(
          (p) => p.toString() === senderId
     );

     const isOwner = chat.ownerParticipant?.toString() === senderId;

     if (isOwner && !isParticipant) {
          chat.participants.push(payload.sender);
          await chat.save();
     }

     if (!isParticipant && !isOwner) {
          throw new AppError(
               StatusCodes.FORBIDDEN,
               'Sender is not allowed in this chat'
          );
     }

     // 3️⃣ Check mute
     if (chat.mutedBy && !isOwner) {
          throw new AppError(
               StatusCodes.FORBIDDEN,
               'You are muted from this chat'
          );
     }

     // 4️⃣ Check blocked users (owner bypass)
     const isBlocked = chat.blockedUsers?.some((block: any) => {
          const blocker = block.blocker.toString();
          const blocked = block.blocked.toString();

          return (
               (blocker === senderId && chat.participants.some((p) => p.toString() === blocked)) ||
               (blocked === senderId && chat.participants.some((p) => p.toString() === blocker))
          );
     });

     if (isBlocked && !isOwner) {
          throw new AppError(
               StatusCodes.FORBIDDEN,
               'Cannot send message to blocked user'
          );
     }

     // 5️⃣ Create message
     const messagePayload = {
          ...payload,
          read: false,
          isDeleted: false,
     };

     const message = await Message.create(messagePayload);

     // 6️⃣ Update chat
     await Chat.findByIdAndUpdate(
          message.chatId,
          {
               lastMessage: message._id,
               readBy: [payload.sender],
               updatedAt: new Date(),
          },
          { new: true }
     );

     // 7️⃣ Populate message for socket
     const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email profile')
          .lean();

     // 8️⃣ Populate chat
     const populatedChat = await Chat.findById(message.chatId)
          .populate('participants', 'name email profile')
          .populate('lastMessage')
          .lean();

     //@ts-ignore
     const io = global.io;

     // 9️⃣ Socket emit
     if (chat.participants && io) {

          const otherParticipants = chat.participants.filter(
               (p) => p.toString() !== senderId
          );

          otherParticipants.forEach((participantId) => {

               const id = participantId.toString();

               // new message
               io.emit(`newMessage::${id}`, populatedMessage);

               // unread count
               io.emit(`unreadCountUpdate::${id}`, {
                    chatId: payload.chatId,
                    action: 'increment',
               });

               // chat list update
               io.emit(`chatListUpdate::${id}`, {
                    chatId: payload.chatId,
                    chat: populatedChat,
                    action: 'moveToTop',
                    lastMessage: populatedMessage,
                    updatedAt: new Date(),
               });
          });

          // sender update
          io.emit(`chatListUpdate::${senderId}`, {
               chatId: payload.chatId,
               chat: populatedChat,
               action: 'moveToTop',
               lastMessage: populatedMessage,
               updatedAt: new Date(),
          });
     }

     return message;
};
const getMessagesFromDB = async (
     chatId: string,
     userId: string, // Add userId parameter
     query: Record<string, unknown>,
): Promise<{
     messages: IMessage[];
     pinnedMessages: IMessage[];
     pagination: { total: number; page: number; limit: number; totalPage: number };
}> => {
     const { page, limit } = query;

     const pageInt = Math.max(parseInt(String(page || '1'), 10) || 1, 1);
     const limitInt = Math.min(Math.max(parseInt(String(limit || '10'), 10) || 10, 1), 100);

     const skip = (pageInt - 1) * limitInt;

     const total = await Message.countDocuments({ chatId });

     const response = await Message.find({ chatId })
          .populate({
               path: 'sender',
               select: 'name email profile',
          })
          .populate({ path: 'reactions.userId', select: 'name' })
          .populate({ path: 'pinnedBy', select: 'name' })
          .skip(skip)
          .limit(limitInt)
          .sort({ createdAt: -1 });

     // Mark messages as read for the current user (only messages not sent by current user)
     const messageIds = response.filter((msg) => msg.sender._id.toString() !== userId && !msg.read).map((msg) => msg._id);

     if (messageIds.length > 0) {
          await Message.updateMany(
               {
                    _id: { $in: messageIds },
                    sender: { $ne: userId }, // Only update messages not sent by current user
               },
               {
                    $set: { read: true, readAt: new Date() },
               },
          );
     }

     // Get pinned messages separately
     const pinnedMessages = await Message.find({
          chatId,
          isPinned: true,
          isDeleted: false,
     })
          .populate({
               path: 'sender',
               select: 'name email profile',
          })
          .populate({ path: 'pinnedBy', select: 'name' })
          .sort({ pinnedAt: -1 });

     const formattedMessages = response.map((message) => ({
          ...message.toObject(),
          isDeleted: message.isDeleted,
          text: message.isDeleted ? 'This message has been deleted.' : message.text,
          read: true, // Mark as read in response since we just marked them as read
     }));

     const formattedPinnedMessages = pinnedMessages.map((message) => ({
          ...message.toObject(),
          text: message.isDeleted ? 'This message has been deleted.' : message.text,
     }));

     const totalPage = Math.ceil(total / limitInt);

     return {
          messages: formattedMessages,
          pinnedMessages: formattedPinnedMessages,
          pagination: {
               total,
               page: pageInt,
               limit: limitInt,
               totalPage,
          },
     };
};

const addReactionToMessage = async (id: string, messageId: string, reactionType: 'like' | 'love' | 'thumbs_up' | 'laugh' | 'angry' | 'sad') => {
     const userId = new Types.ObjectId(id);
     // Validate the reaction type
     const validReactions = ['like', 'love', 'thumbs_up', 'laugh', 'angry', 'sad'];
     if (!validReactions.includes(reactionType)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid reaction type');
     }

     try {
          // Find the message by ID
          const message = await Message.findById(messageId);
          if (!message) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
          }

          // Check if users are blocked
          const chat = await Chat.findById(message.chatId);
          if (chat) {
               const isBlocked = chat.blockedUsers?.some(
                    (block: any) =>
                         (block.blocker.toString() === userId.toString() && block.blocked.toString() === message.sender.toString()) ||
                         (block.blocked.toString() === userId.toString() && block.blocker.toString() === message.sender.toString()),
               );

               if (isBlocked) {
                    throw new AppError(StatusCodes.FORBIDDEN, 'Cannot react to messages from blocked users');
               }
          }

          // Check if the user has already reacted to the message
          const existingReaction = message.reactions.find((reaction) => reaction.userId.toString() === userId.toString());

          if (existingReaction) {
               // Update the existing reaction
               existingReaction.reactionType = reactionType;
               existingReaction.timestamp = new Date();
          } else {
               // Add a new reaction
               message.reactions.push({ userId, reactionType, timestamp: new Date() });
          }

          // Save the updated message
          const updatedMessage = await message.save();

          return updatedMessage;
     } catch (error) {
          console.error('Error updating reaction:', error);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error!');
     }
};

const deleteMessage = async (userId: string, messageId: string) => {

     const events = Event.updateMany(
          { _id: { $exists: false } },
          {
               $set: {
                    revealTime: new Date(),
               },
          },
          { new: true },
     )
     try {
          // Find the message by messageId
          const message = await Message.findById(messageId);
          if (!message) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
          }

          // Ensure the user is the sender of the message
          if (message.sender.toString() !== userId.toString()) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'You can only delete your own messages');
          }

          const updateMessage = await Message.findByIdAndUpdate(
               message._id,
               {
                    $set: {
                         isDeleted: true,
                         isPinned: false, // Unpin message when deleted
                         pinnedBy: undefined,
                         pinnedAt: undefined,
                    },
               },
               { new: true },
          );

          // If message was pinned, also remove from chat's pinnedMessages
          if (message.isPinned) {
               await Chat.findByIdAndUpdate(message.chatId, {
                    $pull: { pinnedMessages: messageId },
               });
          }

          return updateMessage;
     } catch (error) {
          console.error('Error deleting message:', error);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error');
     }
};

// New feature: Pin/Unpin message
const pinUnpinMessage = async (userId: string, messageId: string, action: 'pin' | 'unpin') => {
     try {
          const message = await Message.findById(messageId);
          if (!message) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
          }

          // Check if user is participant in the chat
          const chat = await Chat.findById(message.chatId);
          if (!chat || !chat.participants.some((p) => p.toString() === userId)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to pin messages in this chat');
          }

          // Check if users are blocked
          const isBlocked = chat.blockedUsers?.some(
               (block: any) =>
                    (block.blocker.toString() === userId && block.blocked.toString() === message.sender.toString()) ||
                    (block.blocked.toString() === userId && block.blocker.toString() === message.sender.toString()),
          );

          if (isBlocked) {
               throw new AppError(StatusCodes.FORBIDDEN, 'Cannot pin messages from blocked users');
          }

          if (action === 'pin') {
               // Check if message is already pinned
               if (message.isPinned) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Message is already pinned');
               }

               // Check pinned messages limit (optional - limit to 10 pinned messages per chat)
               const pinnedCount = await Message.countDocuments({
                    chatId: message.chatId,
                    isPinned: true,
                    isDeleted: false,
               });

               if (pinnedCount >= 10) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Maximum 10 messages can be pinned per chat');
               }

               // Pin the message
               const updatedMessage = await Message.findByIdAndUpdate(
                    messageId,
                    {
                         $set: {
                              isPinned: true,
                              pinnedBy: userId,
                              pinnedAt: new Date(),
                         },
                    },
                    { new: true },
               );

               // Add to chat's pinnedMessages array
               await Chat.findByIdAndUpdate(message.chatId, {
                    $addToSet: { pinnedMessages: messageId },
               });

               //@ts-ignore
               const io = global.io;
               // Notify all participants
               chat.participants.forEach((participantId) => {
                    //@ts-ignore
                    io.emit(`messagePinned::${participantId}`, {
                         messageId,
                         chatId: message.chatId,
                         pinnedBy: userId,
                         message: updatedMessage,
                    });
               });

               return updatedMessage;
          } else {
               // Unpin the message
               if (!message.isPinned) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Message is not pinned');
               }

               const updatedMessage = await Message.findByIdAndUpdate(
                    messageId,
                    {
                         $set: {
                              isPinned: false,
                              pinnedBy: undefined,
                              pinnedAt: undefined,
                         },
                    },
                    { new: true },
               );

               // Remove from chat's pinnedMessages array
               await Chat.findByIdAndUpdate(message.chatId, {
                    $pull: { pinnedMessages: messageId },
               });

               //@ts-ignore
               const io = global.io;
               // Notify all participants
               chat.participants.forEach((participantId) => {
                    //@ts-ignore
                    io.emit(`messageUnpinned::${participantId}`, {
                         messageId,
                         chatId: message.chatId,
                         unpinnedBy: userId,
                    });
               });

               return updatedMessage;
          }
     } catch (error) {
          console.error('Error pinning/unpinning message:', error);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error');
     }
};

const violateMessage = async (userId: string, messageId: string, reason: string) => {

     const message = await Message.findById(messageId);
     if (!message) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
     }
     if (message.sender.toString() === userId) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'You can not violate your own messages');
     }
     const chatId = message.chatId
     const chat = await Chat.findById(chatId);
     if (!chat) { throw new AppError(StatusCodes.NOT_FOUND, 'Chat not found'); }
     const reportedUser = chat.participants.find((participant) => participant.toString() !== userId);

     const violateMessage = new ViolateMessage({
          userId,
          reportedUserId: reportedUser,
          messageId,
          reason,
     });
     await violateMessage.save();
     return message;
};

export const MessageService = {
     sendMessageToDB,
     getMessagesFromDB,
     addReactionToMessage,
     deleteMessage,
     pinUnpinMessage,
     violateMessage
};
