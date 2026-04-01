import { StatusCodes } from 'http-status-codes';
import { Package } from '../package/package.model';
import { ISubscription } from './subscription.interface';
import { Subscription } from './subscription.model';
import { verifyAppleReceipt, verifyGooglePurchase } from '../../../helpers/purchaseVerifyHelper';
import { AppleVerificationResult, GoogleVerificationResult } from '../../../types/purchase';
import { SubscriptionPlatform } from './subscription.constants';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import { Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';

export const createSubscriptionIntoDB = async (payload: Partial<ISubscription> & { transactionReceipt?: string }) => {
     // check if the package is valid
     const pkg = await Package.findById(payload.package);
     if (!pkg) {
          throw new Error('Package does not exist');
     }

     let verificationResult: GoogleVerificationResult & AppleVerificationResult;

     // let verificationResult: GoogleVerificationResult & AppleVerificationResult = {
     //      valid: true,
     //      startedAt: new Date('2026-01-01T12:00:00Z'),
     //      expiresAt: new Date('2027-01-01T12:00:00Z'),
     //      status: SubscriptionStatus.ACTIVE,
     //      orderId: 'order_12345',
     //      linkedPurchaseToken: 'purchase_token_98765',
     // };

     if (payload.platform === SubscriptionPlatform.GOOGLE) {
          if (!payload.purchaseToken) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Purchase token is required for Google Play subscriptions');
          }
          if (!pkg.googleProductId) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Google Play product id is required for Google Play subscriptions');
          }
          verificationResult = await verifyGooglePurchase(payload.purchaseToken, pkg.googleProductId);
     } else if (payload.platform === SubscriptionPlatform.APPLE) {
          if (!payload.transactionReceipt) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction receipt is required for Apple subscriptions');
          }
          if (!pkg.appleProductId) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Apple product id is required for Apple subscriptions');
          }
          verificationResult = await verifyAppleReceipt(payload.transactionReceipt, pkg.appleProductId);
     } else {
          throw new Error('Unsupported platform');
     }

     if (!verificationResult.valid) {
          return { success: false, message: 'Subscription verification failed' };
     }

     const subscription = await Subscription.create({
          user: payload.user,
          package: payload.package,
          platform: payload.platform,
          price: pkg.price,

          // Package usage details
          remainingEventCount: pkg.eventCountLimit,
          packageEventCountLimit: pkg.eventCountLimit,
          pricePerEvent: Number(pkg.price / pkg.eventCountLimit),
          usedEventCount: 0,
          remainingAllowedRefundAmount: pkg.price,
          isRefunded: false,

          googleProductId: pkg.googleProductId,
          appleProductId: pkg.appleProductId,
          purchaseToken: payload.purchaseToken,
          orderId: verificationResult.orderId,
          transactionId: verificationResult.transactionId,
          originalTransactionId: verificationResult.originalTransactionId,
          status: verificationResult.status,
          startedAt: verificationResult.startedAt,
          expiresAt: verificationResult.expiresAt,
     });

     if (!subscription) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create subscription');
     }

     // update user subscription
     await User.findByIdAndUpdate(payload.user, {
          subscription: subscription._id,
          role: USER_ROLES.ORGANIZER,
     });

     return subscription;
};

const updateSubscriptionUsages = async (id: string | Types.ObjectId, mongooseTransactionSession?: any) => {
     const subscription = await Subscription.findById(id);
     if (!subscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
     }

     if (subscription.isExpired) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription is already expired. Can not use');
     }

     if (subscription.isRefunded) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription is already refunded. Can not use');
     }

     if (subscription.usedEventCount >= subscription.packageEventCountLimit) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription Limit is expired. Can not use');
     }

     subscription.usedEventCount += 1;
     subscription.remainingEventCount -= 1;
     subscription.remainingAllowedRefundAmount -= Number(subscription.pricePerEvent * subscription.usedEventCount);
     if (mongooseTransactionSession) {
          // subscription.save({ session: mongooseTransactionSession });
          if (subscription.usedEventCount >= subscription.packageEventCountLimit) {
               subscription.isExpired = true;
               subscription.save({ session: mongooseTransactionSession });
          } else {
               subscription.save({ session: mongooseTransactionSession });
          }
     } else {
          if (subscription.usedEventCount >= subscription.packageEventCountLimit) {
               subscription.isExpired = true;
               await subscription.save();
          } else {
               await subscription.save();
          }
     }
};

// get my subscription
const getMySubscriptionIntoDB = async (userId: string | Types.ObjectId, query: Record<string, any>) => {
     const queryBuilder = new QueryBuilder(Subscription.find({ user: userId }), query);
     const result = await queryBuilder.filter().search(['eventName']).sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

export const SubscriptionServices = {
     createSubscriptionIntoDB,
     updateSubscriptionUsages,
     getMySubscriptionIntoDB,
};
