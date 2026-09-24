import type { EmailCampaignEventType } from '@/lib/email/campaigns/event-types';
import { CAMPAIGN_EVENT_TYPE_LABELS } from '@/lib/email/campaigns/event-types';
import { formatTrackingTimestamp } from '@/lib/email/campaigns/recipient-status-utils';

export type CampaignEventDetailTone = 'error' | 'secondary';

export interface CampaignEventDetailLine {
  text: string;
  tone: CampaignEventDetailTone;
}

const CORRELATION_METHOD_LABELS: Record<string, string> = {
  pixel: 'Tracking pixel',
  click_redirect: 'Signed click redirect',
  imap_token: 'Correlation token',
  imap_message_id: 'Message-ID match',
  imap_fallback: 'Scoped inbox fallback',
};

function formatClickTarget(metadata: {
  url?: string;
  linkLabel?: string;
}): string {
  if (metadata.linkLabel && metadata.url) {
    return `"${metadata.linkLabel}" → ${metadata.url}`;
  }

  if (metadata.linkLabel) {
    return `"${metadata.linkLabel}"`;
  }

  return metadata.url ?? '';
}

function formatCorrelationSuffix(metadata: {
  correlationMethod?: string;
  source?: string;
  isUnique?: boolean;
}): string {
  const parts: string[] = [];

  if (metadata.correlationMethod) {
    parts.push(
      CORRELATION_METHOD_LABELS[metadata.correlationMethod] ??
        metadata.correlationMethod,
    );
  }

  if (metadata.source === 'inferred_from_reply') {
    parts.push('inferred from reply');
  }

  if (metadata.isUnique === false) {
    parts.push('repeat open');
  }

  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

export function formatCampaignEventDescription(event: {
  eventType: EmailCampaignEventType;
  recipientEmail: string;
  stepOrder: number | null;
  metadata: {
    url?: string;
    linkLabel?: string;
    reason?: string;
    correlationMethod?: string;
    source?: string;
    isUnique?: boolean;
  };
}): string {
  const label = CAMPAIGN_EVENT_TYPE_LABELS[event.eventType];
  const step =
    event.stepOrder !== null ? ` (Step ${event.stepOrder})` : '';
  const correlation = formatCorrelationSuffix(event.metadata);

  switch (event.eventType) {
    case 'click': {
      const target = formatClickTarget(event.metadata);
      return `${event.recipientEmail} clicked${step}${
        target ? `: ${target}` : ''
      }${correlation}`;
    }
    case 'bounce':
    case 'send_failed':
      return `${event.recipientEmail} ${label.toLowerCase()}${step}${
        event.metadata.reason ? `: ${event.metadata.reason}` : ''
      }${correlation}`;
    case 'open':
      return `${event.recipientEmail} ${label.toLowerCase()}${step}${correlation}`;
    default:
      return `${event.recipientEmail} ${label.toLowerCase()}${step}${correlation}`;
  }
}

export function formatCampaignEventTimestamp(occurredAt: string): string {
  return formatTrackingTimestamp(occurredAt);
}

export function formatCampaignEventDetailLines(event: {
  eventType: EmailCampaignEventType;
  metadata: {
    url?: string;
    linkLabel?: string;
    reason?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}): CampaignEventDetailLine[] {
  if (event.eventType === 'click') {
    const lines: CampaignEventDetailLine[] = [];

    if (event.metadata.url && !event.metadata.linkLabel) {
      lines.push({ text: event.metadata.url, tone: 'secondary' });
    }

    if (event.metadata.userAgent) {
      lines.push({
        text: `User-Agent: ${event.metadata.userAgent}`,
        tone: 'secondary',
      });
    }

    if (event.metadata.ipAddress) {
      lines.push({
        text: `IP: ${event.metadata.ipAddress}`,
        tone: 'secondary',
      });
    }

    return lines;
  }

  return [];
}

export function formatCampaignEventSubtext(event: {
  eventType: EmailCampaignEventType;
  metadata: {
    url?: string;
    linkLabel?: string;
    reason?: string;
    userAgent?: string;
    ipAddress?: string;
    correlationMethod?: string;
    source?: string;
    isUnique?: boolean;
  };
}): CampaignEventDetailLine[] {
  const lines: CampaignEventDetailLine[] = [];
  const correlation = formatCorrelationSuffix(event.metadata).trim();

  if (correlation) {
    lines.push({
      text: correlation.replace(/^\(|\)$/g, ''),
      tone: 'secondary',
    });
  }

  if (event.eventType === 'click') {
    const target = formatClickTarget(event.metadata);

    if (target) {
      lines.push({ text: target, tone: 'secondary' });
    }
  }

  if (
    (event.eventType === 'bounce' || event.eventType === 'send_failed') &&
    event.metadata.reason
  ) {
    lines.push({ text: event.metadata.reason, tone: 'error' });
  }

  lines.push(...formatCampaignEventDetailLines(event));

  return lines;
}
