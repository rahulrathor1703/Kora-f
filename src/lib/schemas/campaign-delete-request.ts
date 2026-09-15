import { z } from 'zod';

export const campaignDeleteRequestReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(2000, 'Reason must be at most 2000 characters'),
});

export type CampaignDeleteRequestReasonFormValues = z.infer<
  typeof campaignDeleteRequestReasonSchema
>;

export const rejectCampaignDeleteRequestSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .max(2000, 'Note must be at most 2000 characters')
    .optional(),
});

export type RejectCampaignDeleteRequestFormValues = z.infer<
  typeof rejectCampaignDeleteRequestSchema
>;
