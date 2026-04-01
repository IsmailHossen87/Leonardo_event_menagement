import { SubscriptionStatus } from '../app/modules/subscription/subscription.constants';

export interface GoogleVerificationResult {
     valid: boolean;
     startedAt?: Date;
     expiresAt?: Date;
     status: SubscriptionStatus;
     orderId?: string;
     linkedPurchaseToken?: string;
}

export interface AppleVerificationResult {
     valid: boolean;
     startedAt?: Date;
     expiresAt?: Date;
     status: SubscriptionStatus;
     transactionId?: string;
     originalTransactionId?: string;
}
