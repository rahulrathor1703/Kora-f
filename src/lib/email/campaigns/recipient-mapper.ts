import type { CampaignRecipientDetail } from '@/lib/email/campaigns/recipient-types';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readEngagement(raw: Record<string, unknown>) {
  const engagement = (raw.engagement ?? null) as Record<string, unknown> | null;

  if (!engagement) {
    return {
      status: 'pending' as const,
      latestDeliveryStatus: 'pending' as const,
      opened: false,
      openedAt: null,
      openCount: 0,
      clicked: false,
      clickedAt: null,
      clickCount: 0,
      bounced: false,
      bouncedAt: null,
      bounceReason: null,
    };
  }

  return {
    status:
      (readString(engagement.status) as CampaignRecipientDetail['engagement']['status']) ??
      'pending',
    latestDeliveryStatus:
      (readString(
        engagement.latestDeliveryStatus,
      ) as CampaignRecipientDetail['engagement']['latestDeliveryStatus']) ??
      'pending',
    opened: engagement.opened === true,
    openedAt: readString(engagement.openedAt),
    openCount: typeof engagement.openCount === 'number' ? engagement.openCount : 0,
    clicked: engagement.clicked === true,
    clickedAt: readString(engagement.clickedAt),
    clickCount: typeof engagement.clickCount === 'number' ? engagement.clickCount : 0,
    bounced: engagement.bounced === true,
    bouncedAt: readString(engagement.bouncedAt),
    bounceReason: readString(engagement.bounceReason),
  };
}

export function mapCampaignRecipientFromApi(
  raw: CampaignRecipientDetail | Record<string, unknown>,
): CampaignRecipientDetail {
  const item = raw as Record<string, unknown>;

  return {
    id: String(item.id ?? ''),
    email: String(item.email ?? ''),
    status:
      (readString(item.status) as CampaignRecipientDetail['status']) ?? 'pending',
    currentStepOrder:
      typeof item.currentStepOrder === 'number' ? item.currentStepOrder : 1,
    lastSentAt: readString(item.lastSentAt),
    replyCategory:
      (readString(item.replyCategory) as CampaignRecipientDetail['replyCategory']) ??
      null,
    repliedAt: readString(item.repliedAt),
    contactDisposition:
      (readString(item.contactDisposition ?? item.contact_disposition) as CampaignRecipientDetail['contactDisposition']) ??
      'eligible',
    pausedUntil: readString(item.pausedUntil ?? item.paused_until),
    allowSendDespiteReply: readBoolean(
      item.allowSendDespiteReply ?? item.allow_send_despite_reply,
    ),
    globallyExcluded: readBoolean(item.globallyExcluded ?? item.globally_excluded),
    engagement: readEngagement(item),
    messages: Array.isArray(item.messages)
      ? (item.messages as CampaignRecipientDetail['messages'])
      : [],
  };
}

export function mapCampaignRecipientsPageFromApi(input: {
  items: Array<CampaignRecipientDetail | Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
}) {
  return {
    ...input,
    items: input.items.map(mapCampaignRecipientFromApi),
  };
}
