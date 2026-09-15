import type { SenderMailbox } from '@/lib/email/mailbox-types';

export interface MailboxDeliverability {
  spfEnabled: boolean;
  dkimEnabled: boolean;
  dmarcEnabled: boolean;
  /** 0–10 scale; lower is better deliverability. */
  spamScore: number;
}

function isConsumerMailboxDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return (
    domain === 'gmail.com' ||
    domain === 'googlemail.com' ||
    domain.endsWith('.outlook.com') ||
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com'
  );
}

export function getMailboxDeliverability(
  mailbox: SenderMailbox,
): MailboxDeliverability {
  const connected = mailbox.config.syncStatus === 'connected';
  const consumerDomain = isConsumerMailboxDomain(mailbox.email);
  const isHostedProvider =
    mailbox.provider === 'gmail' || mailbox.provider === 'outlook';

  let spamScore = 5;

  if (mailbox.config.syncStatus === 'error') {
    spamScore = 8.5;
  } else if (mailbox.config.syncStatus === 'pending') {
    spamScore = 6.5;
  } else if (mailbox.warmupEnabled) {
    spamScore = 1.8;
  } else if (
    mailbox.dailySendLimit > 0 &&
    mailbox.dailySendsUsed / mailbox.dailySendLimit >= 0.85
  ) {
    spamScore = 4.2;
  } else if (connected) {
    spamScore = 2.6;
  }

  return {
    spfEnabled:
      connected && (isHostedProvider || Boolean(mailbox.config.smtpHost)),
    dkimEnabled: connected && isHostedProvider,
    dmarcEnabled: connected && !consumerDomain,
    spamScore: Math.round(spamScore * 10) / 10,
  };
}

export function getSpamScoreTone(
  score: number,
): 'good' | 'moderate' | 'poor' {
  if (score <= 3) {
    return 'good';
  }

  if (score <= 6) {
    return 'moderate';
  }

  return 'poor';
}
