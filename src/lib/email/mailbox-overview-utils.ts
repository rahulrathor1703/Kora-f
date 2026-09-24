import type {
  MailboxCampaignsResponse,
  SenderMailboxDetail,
} from '@/lib/email/mailbox-types';

export interface MailboxCapacitySlice {
  key: 'used' | 'remaining';
  label: string;
  count: number;
  percent: number;
  palette: { base: string; light: string; glow: string };
}

export interface MailboxSenderStatusSlice {
  status: 'active' | 'paused' | 'stopped';
  label: string;
  count: number;
  percent: number;
  palette: { base: string; light: string; glow: string };
}

const SENDER_STATUS_PALETTE = {
  active: { base: '#10B981', light: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.38)' },
  paused: { base: '#F59E0B', light: '#FCD34D', glow: 'rgba(245, 158, 11, 0.38)' },
  stopped: { base: '#64748B', light: '#94A3B8', glow: 'rgba(100, 116, 139, 0.32)' },
} as const;

export function buildMailboxCapacitySlices(
  mailbox: SenderMailboxDetail,
): MailboxCapacitySlice[] {
  const limit = Math.max(mailbox.dailySendLimit, 1);
  const used = Math.min(mailbox.dailySendsUsed, limit);
  const remaining = Math.max(limit - used, 0);
  const usedPercent = Math.round((used / limit) * 100);
  const remainingPercent = Math.max(100 - usedPercent, 0);

  return [
    {
      key: 'used',
      label: 'Used today',
      count: used,
      percent: usedPercent,
      palette: { base: '#0EA5E9', light: '#7DD3FC', glow: 'rgba(14, 165, 233, 0.38)' },
    },
    {
      key: 'remaining',
      label: 'Remaining',
      count: remaining,
      percent: remainingPercent,
      palette: { base: '#CBD5E1', light: '#E2E8F0', glow: 'rgba(203, 213, 225, 0.4)' },
    },
  ];
}

export function buildMailboxSenderStatusSlices(
  campaignsData: MailboxCampaignsResponse | null,
): MailboxSenderStatusSlice[] {
  const counts = { active: 0, paused: 0, stopped: 0 };

  for (const assignment of campaignsData?.campaigns ?? []) {
    counts[assignment.sender.status] += 1;
  }

  const total = counts.active + counts.paused + counts.stopped;

  return (['active', 'paused', 'stopped'] as const).map((status) => ({
    status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    count: counts[status],
    percent: total > 0 ? Math.round((counts[status] / total) * 100) : 0,
    palette: SENDER_STATUS_PALETTE[status],
  }));
}
