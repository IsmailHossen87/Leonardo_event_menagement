import { Model, Types } from 'mongoose';
import { SubscriptionPlatform, SubscriptionStatus } from './subscription.constants';

export interface ISubscription {
     _id: string;
     user: Types.ObjectId;
     package: Types.ObjectId;
     platform: SubscriptionPlatform;
     price: number;

     // Package usage details
     packageEventCountLimit: number;
     pricePerEvent: number;
     usedEventCount: number;
     remainingEventCount: number;
     remainingAllowedRefundAmount: number;
     isRefunded?: boolean;
     isExpired: boolean;

     // Store identifiers
     googleProductId?: string;
     appleProductId?: string;

     // Store subscription IDs
     purchaseToken?: string; // Google Play
     orderId?: string; // Google SKU
     transactionId?: string; // Apple transactionId
     originalTransactionId?: string; // Apple originalTransactionId

     status: SubscriptionStatus;
     startedAt: Date;
     expiresAt?: Date;
     canceledAt?: Date;

     renewalCount: number;
     isDeleted: boolean;
}

export type SubscriptionModel = Model<ISubscription>;
