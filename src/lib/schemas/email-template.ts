import { z } from 'zod';
import { hasEmailBodyContent } from '@/lib/email/campaigns/email-body-html';

export const emailTemplateStepSchema = z
  .object({
    stepOrder: z.number().int().min(1),
    subject: z.string().trim().min(1, 'Subject line is required'),
    body: z
      .string()
      .refine((value) => hasEmailBodyContent(value), 'Email body is required'),
    delayMode: z.enum(['relative', 'absolute']),
    // Step 1 uses 0; follow-ups require >= 1 in superRefine below.
    delayDays: z.number().int().min(0).max(90).optional(),
    scheduledDate: z.string().optional(),
  })
  .superRefine((step, ctx) => {
    if (step.stepOrder === 1) {
      return;
    }

    const delayMode = step.delayMode ?? 'relative';

    if (delayMode === 'relative' && (step.delayDays ?? 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Send after at least 1 day',
        path: ['delayDays'],
      });
    }

    if (delayMode === 'absolute' && !step.scheduledDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a send date',
        path: ['scheduledDate'],
      });
    }
  });

export const emailTemplateFormSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required').max(120),
  description: z.string().optional(),
  visibility: z.enum(['private', 'org']),
  isActive: z.boolean(),
  steps: z.array(emailTemplateStepSchema).min(1),
});

export type EmailTemplateStepFormValues = z.infer<typeof emailTemplateStepSchema>;
export type EmailTemplateFormValues = z.infer<typeof emailTemplateFormSchema>;
