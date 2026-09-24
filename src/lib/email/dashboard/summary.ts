import type { EmailTemplate } from '@/lib/api';
import { groupCampaignsByStatus } from '@/lib/email/campaigns/pipeline-config';
import type { EmailCampaign, EmailCampaignStatus } from '@/lib/email/campaigns/types';
import type { ContactList } from '@/lib/email/lists/types';
import {
  getMailboxDeliverability,
  getSpamScoreTone,
} from '@/lib/email/mailbox-deliverability';
import type { SenderMailbox } from '@/lib/email/mailbox-types';
import type { ManualListSummary } from '@/lib/lists/types';

export interface CampaignStatusCounts {
  total: number;
  draft: number;
  scheduled: number;
  sending: number;
}

export interface MailboxHealthCounts {
  total: number;
  active: number;
  syncErrors: number;
  poorSpamScore: number;
  needsFixSpamAttention: number;
}

export interface AudienceListTotals {
  listCount: number;
  totalContactsInLists: number;
}

export interface TemplateTypeCounts {
  total: number;
  single: number;
  sequence: number;
}

export function countCampaignsByStatus(
  campaigns: EmailCampaign[],
): CampaignStatusCounts {
  const grouped = groupCampaignsByStatus(campaigns);

  return {
    total: campaigns.length,
    draft: grouped.draft.length,
    scheduled: grouped.scheduled.length,
    sending: grouped.sending.length,
  };
}

export function summarizeMailboxHealth(
  mailboxes: SenderMailbox[],
): MailboxHealthCounts {
  let active = 0;
  let syncErrors = 0;
  let poorSpamScore = 0;
  let needsFixSpamAttention = 0;

  for (const mailbox of mailboxes) {
    if (mailbox.status === 'active') {
      active += 1;
    }

    if (mailbox.config.syncStatus === 'error') {
      syncErrors += 1;
      needsFixSpamAttention += 1;
      continue;
    }

    const deliverability = getMailboxDeliverability(mailbox);
    if (getSpamScoreTone(deliverability.spamScore) === 'poor') {
      poorSpamScore += 1;
      needsFixSpamAttention += 1;
    }
  }

  return {
    total: mailboxes.length,
    active,
    syncErrors,
    poorSpamScore,
    needsFixSpamAttention,
  };
}

export function summarizeAudienceLists(
  contactLists: ContactList[],
  manualLists: ManualListSummary[],
  includeManualLists: boolean,
): AudienceListTotals {
  const manual = includeManualLists ? manualLists : [];
  const listCount = contactLists.length + manual.length;
  const contactListTotal = contactLists.reduce(
    (sum, list) => sum + list.contactCount,
    0,
  );
  const manualRowTotal = manual.reduce((sum, list) => sum + list.rowCount, 0);

  return {
    listCount,
    totalContactsInLists: contactListTotal + manualRowTotal,
  };
}

export function summarizeTemplatesByType(
  templates: EmailTemplate[],
): TemplateTypeCounts {
  let single = 0;
  let sequence = 0;

  for (const template of templates) {
    if (template.type === 'sequence') {
      sequence += 1;
    } else {
      single += 1;
    }
  }

  return {
    total: templates.length,
    single,
    sequence,
  };
}

export function formatDashboardCount(value: number): string {
  return value.toLocaleString();
}

export function getAnalyticsChartDateFilters(): {
  dateFrom: string;
  dateTo: string;
} {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 11);
  dateFrom.setDate(1);

  return {
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
  };
}

export function toChartPoints(
  points: { label: string; value: number }[],
): { label: string; value: number }[] {
  return points.map((point) => ({
    label: point.label,
    value: point.value,
  }));
}

export function getChartRangeLabels(
  points: { label: string }[],
): { startLabel: string; endLabel: string } {
  if (points.length === 0) {
    return { startLabel: '—', endLabel: '—' };
  }

  return {
    startLabel: points[0]?.label ?? '—',
    endLabel: points[points.length - 1]?.label ?? '—',
  };
}

export const HIGHLIGHT_CAMPAIGN_STATUSES: EmailCampaignStatus[] = [
  'draft',
  'scheduled',
  'sending',
];
