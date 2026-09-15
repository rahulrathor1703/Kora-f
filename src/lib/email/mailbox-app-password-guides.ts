import type { MailboxProvider } from '@/lib/email/mailbox-types';

export interface MailboxAppPasswordGuide {
  url: string;
  ariaLabel: string;
}

export const MAILBOX_APP_PASSWORD_GUIDES: Record<
  Extract<MailboxProvider, 'gmail' | 'outlook'>,
  MailboxAppPasswordGuide
> = {
  gmail: {
    url: 'https://myaccount.google.com/apppasswords',
    ariaLabel: 'Open Google guide for creating an app password',
  },
  outlook: {
    url: 'https://support.microsoft.com/en-us/accounts-billing/manage/how-to-get-and-use-app-passwords',
    ariaLabel: 'Open Microsoft guide for creating an app password',
  },
};
