import { z } from 'zod';

export const createEmailCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required'),
  subject: z.string().trim().min(1, 'Subject line is required'),
  recipientCount: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value?.trim()) {
          return true;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0;
      },
      { message: 'Recipient count must be a non-negative number' },
    ),
});

export type CreateEmailCampaignFormValues = z.infer<
  typeof createEmailCampaignSchema
>;
