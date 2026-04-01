import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Event } from '../Event/Event.model';
import { Subscription } from '../subscription/subscription.model';
import { User } from '../user/user.model';
import { Refund } from './refund.model';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';

// ✅ Organizer applies for refund
const applyForRefund = async (
    userId: string,
    payload: { subscriptionId: string; reason: string }
) => {
    const { subscriptionId, reason } = payload;

    // 🔹 Check event exists and belongs to this organizer
    const subscriptionInfo = await Subscription.findById(subscriptionId);
    if (!subscriptionInfo) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found.');
    }

    if (String(subscriptionInfo.user) !== String(userId)) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'You are not the owner of this Subscription.'
        );
    }

    // 🔹 Check if there is already a pending refund for this event
    const existingRefund = await Refund.findOne({
        subscription: subscriptionInfo._id,
        user: userId,
        status: 'PENDING',
    });

    if (existingRefund) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'A refund request is already pending for this subscription.'
        );
    }

    // 🔹 Check if already refunded
    const alreadyRefunded = await Refund.findOne({
        subscription: subscriptionInfo._id,
        user: userId,
        status: 'APPROVED',
    });

    if (alreadyRefunded) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'This subscription has already been refunded.'
        );
    }

    // 🔹 Get organizer's subscription
    const userDetails = await User.findById(userId).select('subscription');
    if (!userDetails?.subscription) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User subscription not found.');
    }

    const subscription = await Subscription.findById(userDetails.subscription);
    if (!subscription) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found.');
    }

    if (subscription.remainingAllowedRefundAmount <= 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No refundable amount remaining in your subscription.'
        );
    }

    const refund = await Refund.create({
        user: new mongoose.Types.ObjectId(userId),
        subscription: subscription._id,
        reason,
        refundAmount: subscriptionInfo.remainingAllowedRefundAmount,
        status: 'PENDING',
    });

    return refund;
};

// ✅ Admin gets all refund requests
const getAllRefundRequests = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(
        Refund.find()
            .populate({
                path: 'subscription',
                select: 'package pricePerEvent remainingAllowedRefundAmount',
                populate: {
                    path: 'package',
                    select: 'name price features'
                }
            })
            .populate({ path: 'user', select: 'name email image' }),
        query
    );

    const result = await queryBuilder
        .filter()
        .search(['reason'])
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await queryBuilder.countTotal();

    return { meta, result };
};

// ✅ Admin approves or rejects refund
const updateRefundStatus = async (
    refundId: string,
    payload: { status: 'APPROVED' | 'REJECTED'; }
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const refund = await Refund.findById(refundId).session(session);
        if (!refund) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Refund request not found.');
        }

        if (refund.status !== 'PENDING') {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `This refund request has already been ${refund.status.toLowerCase()}.`
            );
        }

        if (payload.status === 'APPROVED') {
            // 🔹 Get the subscription
            const subscription = await Subscription.findById(refund.subscription).session(session);
            if (!subscription) {
                throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found.');
            }

            // 🔹 Refund: give back 1 event credit
            subscription.remainingEventCount = 0;
            subscription.remainingAllowedRefundAmount = 0;
            subscription.isRefunded = true;

            await subscription.save({ session });

            // 🔹 Mark event as deleted (soft delete)
            await Event.findByIdAndUpdate(
                refund.subscription,
                { isDeleted: true, deletedAt: new Date() },
                { session }
            );
        }

        // 🔹 Update refund status
        refund.status = payload.status;
        await refund.save({ session });

        await session.commitTransaction();
        session.endSession();

        return refund;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const RefundService = {
    applyForRefund,
    getAllRefundRequests,
    updateRefundStatus,
};
