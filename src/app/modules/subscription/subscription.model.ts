import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionModel } from './subscription.interface';
import { SubscriptionPlatform, SubscriptionStatus } from './subscription.constants';

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
     {
          user: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
               index: true,
          },
          package: {
               type: Schema.Types.ObjectId,
               ref: 'Package',
               required: true,
               index: true,
          },
          platform: {
               type: String,
               enum: Object.values(SubscriptionPlatform),
               required: true,
          },
          price: { type: Number, required: true },

          // Package usage details
          remainingEventCount: { type: Number, required: true },
          packageEventCountLimit: { type: Number, required: true },
          pricePerEvent: { type: Number, required: true },
          usedEventCount: { type: Number, required: true },
          remainingAllowedRefundAmount: { type: Number, required: true },
          isRefunded: { type: Boolean, default: false },
          isExpired: { type: Boolean, default: false },

          googleProductId: { type: String },
          appleProductId: { type: String },

          purchaseToken: { type: String },
          orderId: { type: String },
          transactionId: { type: String },
          originalTransactionId: { type: String },

          status: {
               type: String,
               enum: Object.values(SubscriptionStatus),
               default: SubscriptionStatus.PENDING,
          },
          startedAt: { type: Date, required: true },
          expiresAt: { type: Date },
          canceledAt: { type: Date },
          renewalCount: { type: Number, default: 0 },
          isDeleted: { type: Boolean, default: false },
     },
     { timestamps: true },
);

subscriptionSchema.pre('save', async function (next) {
     const subscription = this;
     if (subscription.packageEventCountLimit < subscription.usedEventCount) {
          throw new Error('Used event count cannot be greater than package event count limit');
     }
     next();
});

export const Subscription = model<ISubscription, SubscriptionModel>('Subscription', subscriptionSchema);
