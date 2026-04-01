import { z } from 'zod';
import { SubscriptionPlatform } from './subscription.constants';

export const createSubscriptionSchema = z.object({
     body: z
          .object({
               package: z.string().min(24, 'Invalid package ID').nonempty('Package ID is required'),
               platform: z.nativeEnum(SubscriptionPlatform),
               purchaseToken: z
                    .union([
                         z
                              .string()
                              .min(20, 'Purchase token too short')
                              .max(255, 'Purchase token too long')
                              .regex(/^[A-Za-z0-9._-]+$/, 'Invalid purchase token'),
                         z.null(),
                    ])
                    .optional(),
               transactionReceipt: z
                    .union([
                         z
                              .string()
                              .min(100, 'Receipt too short')
                              .max(5000, 'Receipt too long')
                              .regex(/^[A-Za-z0-9+/=]+$/, 'Invalid receipt format'),
                         z.null(),
                    ])
                    .optional(),
          })
          .superRefine((data, context) => {
               if (data.platform === SubscriptionPlatform.GOOGLE) {
                    if (!data.purchaseToken) {
                         context.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Purchase token is required for Google Play subscriptions',
                         });
                    }
               } else if (data.platform === SubscriptionPlatform.APPLE) {
                    if (!data.transactionReceipt) {
                         context.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Transaction receipt is required for Apple subscriptions',
                         });
                    }
               }
          }),
});

export const SubscriptionValidations = {
     createSubscriptionSchema,
};
