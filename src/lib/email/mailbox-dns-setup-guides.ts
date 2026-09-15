import {
  deliverabilityItems,
  type DeliverabilityKey,
} from '@/lib/email/mailbox-deliverability-config';
import type { MailboxProvider, SenderMailboxDetail } from '@/lib/email/mailbox-types';

export interface DnsSetupStep {
  title: string;
  description: string;
}

export interface DnsSetupGuide {
  key: DeliverabilityKey;
  label: string;
  fullName: string;
  summary: string;
  steps: DnsSetupStep[];
  learnMoreUrl?: string;
}

function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

function isConsumerMailboxDomain(domain: string): boolean {
  return (
    domain === 'gmail.com' ||
    domain === 'googlemail.com' ||
    domain.endsWith('.outlook.com') ||
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com'
  );
}

function getSpfRecordHint(provider: MailboxProvider): string {
  if (provider === 'gmail') {
    return 'v=spf1 include:_spf.google.com ~all';
  }

  if (provider === 'outlook') {
    return 'v=spf1 include:spf.protection.outlook.com ~all';
  }

  return 'v=spf1 include:<your-mail-provider> ~all';
}

function getSpfSteps(
  domain: string,
  provider: MailboxProvider,
  consumerDomain: boolean,
): DnsSetupStep[] {
  if (consumerDomain) {
    return [
      {
        title: 'Not required for consumer addresses',
        description:
          'Personal Gmail, Outlook, and Hotmail addresses are authenticated by the provider. SPF is managed on their side — you do not add records for @gmail.com or @outlook.com domains.',
      },
    ];
  }

  return [
    {
      title: 'Open your DNS provider',
      description: `Sign in where ${domain} DNS is managed — your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) or hosting control panel.`,
    },
    {
      title: 'Add a TXT record at the root domain',
      description: `Create a TXT record for @ or ${domain}. If a record already starts with v=spf1, edit it instead of adding a second SPF record.`,
    },
    {
      title: 'Paste the SPF value',
      description: `Use a value like: ${getSpfRecordHint(provider)}. Replace ~all with -all once you have verified all senders.`,
    },
    {
      title: 'Save and wait for propagation',
      description:
        'DNS changes can take up to 48 hours. Use the live DNS check on the mailbox create form to confirm the record is visible.',
    },
  ];
}

function getDkimSteps(
  domain: string,
  provider: MailboxProvider,
  consumerDomain: boolean,
): DnsSetupStep[] {
  if (consumerDomain) {
    return [
      {
        title: 'Not required for consumer addresses',
        description:
          'Consumer mailboxes use the provider’s shared DKIM signing. You cannot publish custom DKIM keys for @gmail.com or @outlook.com addresses.',
      },
    ];
  }

  if (provider === 'gmail') {
    return [
      {
        title: 'Open Google Admin console',
        description:
          'Go to Apps → Google Workspace → Gmail → Authenticate email. You need super-admin access for the domain.',
      },
      {
        title: 'Generate a DKIM key',
        description: `Select ${domain}, choose 2048-bit key length, and click Generate. Google provides a TXT host name and value.`,
      },
      {
        title: 'Publish the TXT record',
        description:
          'Add the host name (selector._domainkey) and TXT value at your DNS provider exactly as shown in Admin console.',
      },
      {
        title: 'Start authentication',
        description:
          'Return to Admin console and click Start authentication after DNS propagation completes.',
      },
    ];
  }

  if (provider === 'outlook') {
    return [
      {
        title: 'Open Microsoft 365 Defender',
        description:
          'Go to Email & collaboration → Policies & rules → Threat policies → DKIM. Select your domain.',
      },
      {
        title: 'Create the CNAME records',
        description:
          'Microsoft shows two CNAME records (selector1 and selector2). Add both at your DNS provider.',
      },
      {
        title: 'Enable DKIM signing',
        description:
          'After the CNAME records resolve, toggle DKIM signing to Enabled in the Defender portal.',
      },
    ];
  }

  return [
    {
      title: 'Get DKIM details from your mail host',
      description:
        'Your SMTP or transactional email provider publishes a selector and public key. Check their documentation or support portal.',
    },
    {
      title: 'Add a TXT record for the selector',
      description: `Create a TXT record at <selector>._domainkey.${domain} with the public key value your provider supplies.`,
    },
    {
      title: 'Verify signing is active',
      description:
        'Send a test message and inspect headers for a passing DKIM-Signature result, or use a third-party mail tester.',
    },
  ];
}

function getDmarcSteps(domain: string, consumerDomain: boolean): DnsSetupStep[] {
  if (consumerDomain) {
    return [
      {
        title: 'Not required for consumer addresses',
        description:
          'You cannot publish DMARC for provider-owned domains like gmail.com. DMARC applies to domains you control.',
      },
    ];
  }

  return [
    {
      title: 'Confirm SPF and DKIM first',
      description:
        'DMARC builds on SPF and DKIM. Set both up and verify they pass before tightening DMARC policy.',
    },
    {
      title: 'Add a TXT record at _dmarc',
      description: `Create a TXT record at _dmarc.${domain}.`,
    },
    {
      title: 'Start with monitoring mode',
      description: `Use: v=DMARC1; p=none; rua=mailto:dmarc@${domain}. This collects reports without rejecting mail.`,
    },
    {
      title: 'Tighten policy over time',
      description:
        'After reviewing reports, move to p=quarantine or p=reject when you are confident legitimate mail passes authentication.',
    },
  ];
}

export function getDnsSetupGuides(mailbox: SenderMailboxDetail): DnsSetupGuide[] {
  const domain = getEmailDomain(mailbox.email);
  const consumerDomain = isConsumerMailboxDomain(domain);

  const summaries: Record<DeliverabilityKey, string> = {
    spf: consumerDomain
      ? 'SPF is handled by your email provider for consumer addresses.'
      : `Authorize which servers may send mail for ${domain}.`,
    dkim: consumerDomain
      ? 'DKIM signing is managed by Gmail or Microsoft for consumer mailboxes.'
      : `Cryptographically sign outbound mail from ${domain}.`,
    dmarc: consumerDomain
      ? 'DMARC applies to custom domains you own, not consumer inboxes.'
      : `Tell receiving servers how to handle mail that fails SPF or DKIM for ${domain}.`,
  };

  const learnMoreUrls: Partial<Record<DeliverabilityKey, string>> = {
    spf: 'https://support.google.com/a/answer/33786',
    dkim:
      mailbox.provider === 'outlook'
        ? 'https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dkim-configure'
        : 'https://support.google.com/a/answer/174124',
    dmarc: 'https://dmarc.org/overview/',
  };

  return deliverabilityItems.map((item) => ({
    key: item.key,
    label: item.label,
    fullName: item.fullName,
    summary: summaries[item.key],
    learnMoreUrl: learnMoreUrls[item.key],
    steps:
      item.key === 'spf'
        ? getSpfSteps(domain, mailbox.provider, consumerDomain)
        : item.key === 'dkim'
          ? getDkimSteps(domain, mailbox.provider, consumerDomain)
          : getDmarcSteps(domain, consumerDomain),
  }));
}
