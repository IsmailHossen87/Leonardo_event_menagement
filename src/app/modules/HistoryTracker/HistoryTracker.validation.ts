import { z } from 'zod';
import { ERecordType, EReferenceModule } from './HistoryTracker.interface';

const objectIdSchema = (filedName: string) => z.string().regex(/^[a-f\d]{24}$/i, `Invalid ${filedName}`);

const createHistoryTrackerZodSchema = z.object({
     body: z.object({
          // approachedBy: objectIdSchema('approachedBy'),
          recordType: z.nativeEnum(ERecordType),
          referenceModule: z.nativeEnum(EReferenceModule),
          referenceId: objectIdSchema('referenceId'),
          description: z.string().optional(),
     }),
});

export const HistoryTrackerValidation = {
     createHistoryTrackerZodSchema,
};
