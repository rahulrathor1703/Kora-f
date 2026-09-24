import type { EmailCampaignProgressEngagement } from './progress-types';

export interface ChartPalette {
  base: string;
  light: string;
  glow: string;
}

const FUNNEL_PALETTES = {
  sent: { base: '#0EA5E9', light: '#7DD3FC', glow: 'rgba(14, 165, 233, 0.38)' },
  deliverability: {
    base: '#14B8A6',
    light: '#5EEAD4',
    glow: 'rgba(20, 184, 166, 0.38)',
  },
  opened: { base: '#F97316', light: '#FDBA74', glow: 'rgba(249, 115, 22, 0.38)' },
  clicked: { base: '#2563EB', light: '#93C5FD', glow: 'rgba(37, 99, 235, 0.38)' },
  replied: { base: '#10B981', light: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.38)' },
  bounce: { base: '#EF4444', light: '#FCA5A5', glow: 'rgba(239, 68, 68, 0.35)' },
  unsubscribe: {
    base: '#64748B',
    light: '#94A3B8',
    glow: 'rgba(100, 116, 139, 0.32)',
  },
} as const;

export interface EngagementFunnelStep {
  key: string;
  label: string;
  count: number;
  displayValue: string;
  barPercent: number;
  rateFromSent: number;
  rateLabel: string | null;
  dropOffFromPrevious: number | null;
  palette: ChartPalette;
}

export function computeDeliverabilityRate(
  engagement: EmailCampaignProgressEngagement,
): number {
  const attempted = engagement.sent + engagement.bounced;

  if (attempted <= 0) {
    return 0;
  }

  return Math.round((engagement.sent / attempted) * 100);
}

function dropOff(previous: number, current: number): number | null {
  if (previous <= 0) {
    return null;
  }

  const drop = Math.round(((previous - current) / previous) * 100);
  return drop > 0 ? drop : null;
}

export function buildEngagementFunnelSteps(
  engagement: EmailCampaignProgressEngagement,
): EngagementFunnelStep[] {
  const sent = engagement.sent;
  const deliverability = computeDeliverabilityRate(engagement);
  const baseline = Math.max(sent, 1);

  const stepDefs: Omit<EngagementFunnelStep, 'dropOffFromPrevious' | 'displayValue' | 'barPercent'>[] = [
    {
      key: 'sent',
      label: 'Total sent',
      count: sent,
      rateFromSent: sent > 0 ? 100 : 0,
      rateLabel: '100% of sent',
      palette: FUNNEL_PALETTES.sent,
    },
    {
      key: 'deliverability',
      label: 'Deliverability',
      count: sent,
      rateFromSent: deliverability,
      rateLabel: `${deliverability}% delivered`,
      palette: FUNNEL_PALETTES.deliverability,
    },
    {
      key: 'openRate',
      label: 'Open',
      count: engagement.opened,
      rateFromSent: engagement.openRate,
      rateLabel: `${engagement.openRate}% of sent`,
      palette: FUNNEL_PALETTES.opened,
    },
    {
      key: 'ctr',
      label: 'CTR',
      count: engagement.clicked,
      rateFromSent: engagement.ctr,
      rateLabel: `${engagement.ctr}% of sent`,
      palette: FUNNEL_PALETTES.clicked,
    },
    {
      key: 'replyRate',
      label: 'Reply',
      count: engagement.replied,
      rateFromSent: engagement.replyRate,
      rateLabel: `${engagement.replyRate}% of sent`,
      palette: FUNNEL_PALETTES.replied,
    },
    {
      key: 'bounceRate',
      label: 'Bounce',
      count: engagement.bounced,
      rateFromSent: engagement.bounceRate,
      rateLabel: `${engagement.bounceRate}% of sent`,
      palette: FUNNEL_PALETTES.bounce,
    },
    {
      key: 'unsubscribeRate',
      label: 'Unsubscribe',
      count: engagement.unsubscribed,
      rateFromSent: engagement.unsubscribeRate,
      rateLabel: `${engagement.unsubscribeRate}% of sent`,
      palette: FUNNEL_PALETTES.unsubscribe,
    },
  ];

  return stepDefs.map((step, index) => {
    const barPercent =
      index === 0
        ? sent > 0
          ? 100
          : 0
        : Math.max((step.count / baseline) * 100, step.count > 0 ? 8 : 0);

    return {
      ...step,
      displayValue: step.count.toLocaleString(),
      barPercent,
      dropOffFromPrevious:
        index === 0
          ? null
          : dropOff(stepDefs[index - 1].count, step.count),
    };
  });
}
