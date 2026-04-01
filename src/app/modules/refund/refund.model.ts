import { Schema, model } from 'mongoose';
import { IRefund } from './refund.interface';

const RefundSchema = new Schema<IRefund>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
        reason: { type: String, required: true },
        refundAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true },
);

RefundSchema.pre('find', function (next) {
    this.find({ isDeleted: false });
    next();
});

RefundSchema.pre('findOne', function (next) {
    this.findOne({ isDeleted: false });
    next();
});

export const Refund = model<IRefund>('Refund', RefundSchema);
