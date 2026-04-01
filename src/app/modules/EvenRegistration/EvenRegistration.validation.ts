import { z } from 'zod';
import { EAttendingAs } from './EvenRegistration.interface';

const createEvenRegistrationZodSchema = z.object({
     body: z.object({
          event: z.string({ required_error: 'Event is required' }),
          userReportAgainstEventRegistration: z.string().optional(),
          attendingAs: z.nativeEnum(EAttendingAs, { required_error: 'Attending as is required' }),
          noOfAttendees: z.number({ required_error: 'No of attendees is required' }),
          specialRequest: z.string({ required_error: 'Special request is required' }),
          isProfileVisibleToAttendees: z.boolean({ required_error: 'Is profile visible to attendees is required' }),
          isAllowedChatAndMatchWithAttendees: z.boolean({ required_error: 'Is allowed chat and match with attendees is required' }),
     }),
});

const updateEvenRegistrationZodSchema = z.object({
     body: z.object({
          isProfileVisibleToAttendees: z.boolean().optional(),
          isAllowedChatAndMatchWithAttendees: z.boolean().optional(),
          noOfAttendees: z.number().optional(),
          specialRequest: z.string().optional(),
          attendingAs: z.nativeEnum(EAttendingAs).optional(),
          event: z.string().optional(),
          userReportAgainstEventRegistration: z.string().optional(),
     }),
});

export const EvenRegistrationValidation = {
     createEvenRegistrationZodSchema,
     updateEvenRegistrationZodSchema,
};
