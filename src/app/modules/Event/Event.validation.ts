import { z } from 'zod';

const createEventZodSchema = z.object({
     body: z.object({
          eventName: z.string(),
          eventType: z.enum(['Wedding', 'Birthday', 'Anniversary', 'Corporate', 'Other']),
          image: z.string(),
          images: z.array(z.string()),
          eventDate: z.string(),
          eventEndDate: z.string(),
          eventStartTime: z.string(),
          eventEndTime: z.string(),
          eventLocation: z.string(),
          eventDescription: z.string(),
          ageLimitMax: z.number(),
          ageLimitMin: z.number(),
          eventBrandColor: z.string(),
          eventThemeColor: z.string(),
          eventFontColor: z.string(),
          isVisibilityPublic: z.boolean(),
          isApproved: z.boolean(),
          isLockedAfterExpiration: z.boolean(),
          eventAttendeeLimit: z.number(),
     }),
});

const updateEventZodSchema = z.object({
     body: z.object({
          image: z.string().optional(),
          eventName: z.string().optional(),
          eventType: z.enum(['Wedding', 'Birthday', 'Anniversary', 'Corporate', 'Other']).optional(),
          images: z.array(z.string()).optional(),
          eventDate: z.string().optional(),
          eventEndDate: z.string().optional(),
          eventStartTime: z.string().optional(),
          eventEndTime: z.string().optional(),
          eventLocation: z.string().optional(),
          eventDescription: z.string().optional(),
          ageLimitMax: z.number().optional(),
          ageLimitMin: z.number().optional(),
          eventBrandColor: z.string().optional(),
          eventThemeColor: z.string().optional(),
          eventFontColor: z.string().optional(),
          isVisibilityPublic: z.boolean().optional(),
          isApproved: z.boolean().optional(),
          isLockedAfterExpiration: z.boolean().optional(),
          eventAttendeeLimit: z.number().optional(),
          revealTime: z.string().optional(),
     }),
});
const reportAgainstEventById = z.object({
     body: z.object({
          reason: z.string(),
     }),
     params: z.object({
          id: z.string(),
     }),
});

export const EventValidation = {
     createEventZodSchema,
     updateEventZodSchema,
     reportAgainstEventById,
};
