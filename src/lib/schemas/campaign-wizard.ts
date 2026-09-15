import { z } from 'zod';
import { hasEmailBodyContent } from '@/lib/email/campaigns/email-body-html';

export const mailboxSenderSchema = z.object({
  mailboxId: z.string(),
  senderName: z.string().trim().min(1, 'Sender name is required'),
  senderEmail: z.string().trim().email('Valid sender email is required'),
  signature: z.string().optional(),
  dailySendQuota: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Send at least 1 email per day'),
});

export const sequenceEmailSchema = z.object({
  subject: z.string().trim().min(1, 'Subject line is required'),
  body: z
    .string()
    .refine((value) => hasEmailBodyContent(value), 'Email body is required'),
});

export const followUpSchema = sequenceEmailSchema
  .extend({
    includeSignature: z.boolean(),
    delayMode: z.enum(['relative', 'absolute']),
    delayDays: z
      .number()
      .int()
      .min(1, 'Send after at least 1 day')
      .max(90, 'Delay cannot exceed 90 days')
      .optional(),
    scheduledDate: z.string().optional(),
  })
  .superRefine((followUp, ctx) => {
    if (followUp.delayMode === 'relative' && (followUp.delayDays ?? 0) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Send after at least 1 day',
        path: ['delayDays'],
      });
    }

    if (followUp.delayMode === 'absolute' && !followUp.scheduledDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a send date',
        path: ['scheduledDate'],
      });
    }
  });

export const campaignWizardStep1Schema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required'),
  type: z.string().optional(),
  brand: z.string().optional(),
  region: z.string().optional(),
  customFieldValues: z.record(z.string(), z.string()).optional(),
  goal: z.string().optional(),
  mailboxSenders: z
    .array(mailboxSenderSchema)
    .min(1, 'Select at least one mailbox'),
});

export const campaignWizardStep2Schema = z.object({
  initialOutreach: sequenceEmailSchema,
  followUps: z.array(followUpSchema),
  campaignId: z.string().optional(),
  selectedSequenceTemplateId: z.string().optional(),
  sequenceSetupMode: z.enum(['template', 'scratch']).optional(),
  sequenceCustomized: z.boolean().optional(),
  templateAttachmentsCopied: z.boolean().optional(),
});

export const campaignWizardStep3Schema = z.object({
  audienceListType: z.enum(['contact', 'manual'], {
    message: 'Select an audience list',
  }),
  audienceListId: z.string().uuid('Select an audience list'),
});

export const campaignWizardStep4Schema = z.object({
  launchDate: z.string().min(1, 'Launch date is required'),
  dailyBatchSize: z
    .number()
    .int()
    .min(1, 'Daily batch size must be at least 1')
    .max(500, 'Daily batch size cannot exceed 500'),
  sendingWindowStartMinutes: z.number().int().min(0).max(1439),
  sendingWindowEndMinutes: z.number().int().min(1).max(1440),
  timezone: z.string().min(1),
  activeWeekdays: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'Select at least one active send day'),
});

export const campaignWizardSchema = campaignWizardStep1Schema
  .merge(campaignWizardStep2Schema)
  .merge(campaignWizardStep3Schema)
  .merge(campaignWizardStep4Schema)
  .refine(
    (values) => values.sendingWindowStartMinutes < values.sendingWindowEndMinutes,
    {
      message: 'Sending window end must be after the start time',
      path: ['sendingWindowEndMinutes'],
    },
  )
  .refine(
    (values) => {
      const totalQuota = values.mailboxSenders.reduce(
        (sum, sender) => sum + sender.dailySendQuota,
        0,
      );

      return totalQuota <= values.dailyBatchSize;
    },
    {
      message:
        'Total mailbox send quotas cannot exceed the daily batch size',
      path: ['mailboxSenders'],
    },
  );

export type MailboxSenderFormValues = z.infer<typeof mailboxSenderSchema>;
export type FollowUpFormValues = z.infer<typeof followUpSchema>;
export type CampaignWizardFormValues = z.infer<typeof campaignWizardSchema>;
