import type { MailboxProvider } from '@/lib/email/mailbox-types';

export interface MailboxProviderOption {
  id: MailboxProvider;
  label: string;
}

export const MAILBOX_PROVIDER_OPTIONS: MailboxProviderOption[] = [
  {
    id: 'gmail',
    label: 'Gmail',
  },
  {
    id: 'outlook',
    label: 'Outlook',
  },
  {
    id: 'smtp',
    label: 'Custom SMTP',
  },
];

export const DAILY_SEND_LIMIT_PRESETS = [25, 50, 100, 250] as const;

/** Gmail shows app passwords as 4 + 4 + 8 chars; Microsoft uses four groups of 4. */
export const MAILBOX_APP_PASSWORD_SEGMENT_LENGTHS = {
  gmail: [4, 4, 8],
  outlook: [4, 4, 4, 4],
} as const satisfies Record<
  Extract<MailboxProvider, 'gmail' | 'outlook'>,
  readonly number[]
>;

export const MAILBOX_EMAIL_PLACEHOLDERS: Record<MailboxProvider, string> = {
  gmail: 'you@gmail.com',
  outlook: 'you@outlook.com',
  smtp: 'you@company.com',
};
