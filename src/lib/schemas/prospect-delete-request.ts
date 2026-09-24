import { z } from 'zod';

export const prospectDeleteRequestReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(2000, 'Reason must be at most 2000 characters'),
});

export type ProspectDeleteRequestReasonFormValues = z.infer<
  typeof prospectDeleteRequestReasonSchema
>;

export const rejectProspectDeleteRequestSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .max(2000, 'Note must be at most 2000 characters')
    .optional(),
});

export type RejectProspectDeleteRequestFormValues = z.infer<
  typeof rejectProspectDeleteRequestSchema
>;
