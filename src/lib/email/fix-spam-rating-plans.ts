export type FixSpamRatingPlanAccent = 'essential' | 'professional' | 'enterprise';

export interface FixSpamRatingPlan {
  id: FixSpamRatingPlanAccent;
  name: string;
  price: number;
  description: string;
  headline: string;
  accent: FixSpamRatingPlanAccent;
  features: string[];
  recommended?: boolean;
}

export function calculateFixSpamRatingTotal(
  pricePerMailbox: number,
  mailboxCount: number,
): number {
  return pricePerMailbox * mailboxCount;
}

export const fixSpamRatingPlans: FixSpamRatingPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: 29,
    accent: 'essential',
    headline: 'Stay deliverable with steady monitoring',
    description: 'For light outreach and new mailboxes getting started.',
    features: [
      'Weekly spam score monitoring',
      'SPF, DKIM & DMARC health alerts',
      'Basic warmup ramp (20 emails/day)',
      'Monthly inbox placement check',
      'Email support within 48 hours',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 70,
    accent: 'professional',
    headline: 'Recover reputation while you scale',
    description: 'For teams sending daily and needing active protection.',
    recommended: true,
    features: [
      'Daily spam score monitoring',
      'Automated reputation recovery',
      'Smart warmup with engagement (75/day)',
      'Blacklist monitoring & instant alerts',
      'Priority chat support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 150,
    accent: 'enterprise',
    headline: 'Maximum protection with expert guidance',
    description: 'For high-volume senders who cannot afford downtime.',
    features: [
      'Real-time spam score tracking',
      'Premium warmup network (200/day)',
      '24/7 blacklist monitoring & removal',
      'Dedicated deliverability specialist',
      'Send-time & throttling optimization',
    ],
  },
];
