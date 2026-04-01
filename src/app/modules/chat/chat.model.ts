import mongoose, { Schema } from 'mongoose';
import { IChat } from './chat.interface';

const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    adminParticipant: { type: Schema.Types.ObjectId, ref: 'User' },
    ownerParticipant: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
    deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // New fields
    mutedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reasonOfMute: { type: String },
    blockedUsers: [{
      blocker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      blocked: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      reasonOfBlock: { type: String },
      blockedAt: { type: Date, default: Date.now }
    }],
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
  },
  {
    timestamps: true,
  },
);

export const Chat = mongoose.model<IChat>('Chat', chatSchema);