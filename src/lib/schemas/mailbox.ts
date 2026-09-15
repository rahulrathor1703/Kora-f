import { z } from 'zod';

const mailboxProviderSchema = z.enum(['gmail', 'outlook', 'smtp']);

const mailboxConnectionSchema = z.object({
  provider: mailboxProviderSchema,
  email: z.string().trim().email('Enter a valid email address'),
  appPassword: z.string().optional(),
  oauthToken: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().optional(),
});

const mailboxLimitsSchema = z.object({
  dailySendLimit: z
    .string()
    .trim()
    .min(1, 'Daily send limit is required')
    .refine(
      (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 1 && parsed <= 10000;
      },
      { message: 'Daily send limit must be between 1 and 10,000' },
    ),
});

const mailboxIdentitySchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required'),
  fromName: z.string().trim().min(1, 'From name is required'),
});

function addProviderCredentialIssues(
  data: z.infer<typeof mailboxConnectionSchema>,
  ctx: z.RefinementCtx,
  requireCredentials: boolean,
) {
  if (
    (data.provider === 'gmail' || data.provider === 'outlook') &&
    requireCredentials &&
    !data.oauthToken?.trim() &&
    !data.appPassword?.trim()
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'App password is required',
      path: ['appPassword'],
    });
    return;
  }

  if (
    (data.provider === 'gmail' || data.provider === 'outlook') &&
    requireCredentials &&
    !data.oauthToken?.trim() &&
    data.appPassword?.trim()
  ) {
    const normalized = data.appPassword.replace(/[\s-]/g, '');
    if (normalized.length !== 16) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter all 16 characters of your app password',
        path: ['appPassword'],
      });
    }
  }

  if (data.provider === 'smtp' && requireCredentials) {
    if (!data.smtpHost?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'SMTP host is required',
        path: ['smtpHost'],
      });
    }

    const port = Number(data.smtpPort);
    if (!data.smtpPort?.trim() || !Number.isFinite(port) || port < 1 || port > 65535) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid SMTP port (1–65535)',
        path: ['smtpPort'],
      });
    }

    if (!data.smtpUser?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'SMTP username is required',
        path: ['smtpUser'],
      });
    }

    if (!data.smtpPassword?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'SMTP password is required',
        path: ['smtpPassword'],
      });
    }
  }
}

export const mailboxCreateFormSchema = mailboxConnectionSchema
  .merge(mailboxLimitsSchema)
  .superRefine((data, ctx) => {
    addProviderCredentialIssues(data, ctx, true);
  });

export const mailboxEditFormSchema = mailboxConnectionSchema
  .merge(mailboxIdentitySchema)
  .merge(mailboxLimitsSchema)
  .superRefine((data, ctx) => {
    if (data.provider === 'smtp' && data.smtpPassword?.trim()) {
      addProviderCredentialIssues(data, ctx, true);
    }
  });

export type MailboxCreateFormValues = z.infer<typeof mailboxCreateFormSchema>;
export type MailboxEditFormValues = z.infer<typeof mailboxEditFormSchema>;
export type MailboxFormValues = MailboxEditFormValues;

export const mailboxFormSchema = mailboxEditFormSchema;
