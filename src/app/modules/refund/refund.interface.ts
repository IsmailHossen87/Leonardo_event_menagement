import { Types } from 'mongoose';

export interface IRefund {
     user: Types.ObjectId;
     subscription: Types.ObjectId;
     reason: string;
     refundAmount: number;
     status: 'PENDING' | 'APPROVED' | 'REJECTED';
     adminFeedback?: string;
     isDeleted: boolean;
     createdAt: Date;
     updatedAt: Date;
}
