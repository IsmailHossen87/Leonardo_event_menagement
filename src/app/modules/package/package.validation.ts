import { z } from 'zod';
import { PackageInterval } from './package.constant';

export const createPackageSchema = z.object({
     body: z
          .object({
               name: z.string().nonempty('Name cannot be empty'),
               price: z.number().nonnegative('Price cannot be negative'),
               description: z.string().nonempty('Feature cannot be empty'),
               features: z.array(z.string().nonempty('Feature cannot be empty')).optional(),
               interval: z.nativeEnum(PackageInterval).default(PackageInterval.MONTH),
               intervalCount: z.number().default(1),
               eventCountLimit: z.number().default(30),
               googleProductId: z
                    .string()
                    .max(100, 'Android product ID must be within 100 characters')
                    .regex(/^[a-z0-9._]+$/, 'Invalid Android product ID')
                    .default(''),

               appleProductId: z
                    .string()
                    .max(255, 'iOS product ID must be within 255 characters')
                    .regex(/^[A-Za-z0-9.]+$/, 'Invalid iOS product ID')
                    .default(''),
          })
          .strict(),
});

export const updatePackageSchema = z.object({
     body: z
          .object({
               name: z.string().nonempty('Name cannot be empty').optional(),
               price: z.number().nonnegative('Price cannot be negative'),
               description: z.string().nonempty('Feature cannot be empty').optional(),
               features: z.array(z.string().nonempty('Feature cannot be empty')).optional(),
               interval: z.nativeEnum(PackageInterval).optional(),
               intervalCount: z.number().optional(),
               eventCountLimit: z.number().optional(),
               googleProductId: z
                    .string()
                    .max(100, 'Android product ID must be within 100 characters')
                    .regex(/^[a-z0-9._]*$/, 'Invalid Android product ID')
                    .optional(),
               appleProductId: z
                    .string()
                    .max(255, 'iOS product ID must be within 255 characters')
                    .regex(/^[A-Za-z0-9.]*$/, 'Invalid iOS product ID')
                    .optional(),
          })
          .strict(),
});

export const PackageValidation = {
     createPackageSchema,
     updatePackageSchema,
};
