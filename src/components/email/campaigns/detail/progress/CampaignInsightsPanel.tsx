'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import { useMemo } from 'react';
import type {
  EmailCampaignProgressEngagement,
  EmailCampaignProgressFunnelStep,
  EmailCampaignProgressReplyBreakdown,
  EmailCampaignProgressTimeline,
} from '@/lib/email/campaigns/progress-types';

interface CampaignInsightsPanelProps {
  timeline: EmailCampaignProgressTimeline;
  engagement: EmailCampaignProgressEngagement;
  sequenceFunnel: EmailCampaignProgressFunnelStep[];
  replyBreakdown: EmailCampaignProgressReplyBreakdown[];
}

interface InsightCard {
  key: string;
  label: string;
  value: string;
  detail: string;
  icon: SvgIconComponent;
  iconClassName: string;
}

function buildInsights({
  timeline,
  engagement,
  sequenceFunnel,
  replyBreakdown,
}: CampaignInsightsPanelProps): InsightCard[] {
  const deliveryRate =
    engagement.sent + engagement.bounced > 0
      ? Math.round((engagement.sent / (engagement.sent + engagement.bounced)) * 100)
      : 0;

  const interestedReplies = replyBreakdown.find(
    (item) => item.category === 'interested',
  )?.count ?? 0;

  const bestStep = [...sequenceFunnel]
    .filter((step) => step.count > 0)
    .sort((a, b) => b.count - a.count)[0];

  const avgDailySend =
    timeline.daysRunning > 0
      ? Math.round(timeline.sentCount / timeline.daysRunning)
      : 0;

  return [
    {
      key: 'completion',
      label: 'Campaign progress',
      value: `${timeline.percentComplete}%`,
      detail: `${timeline.completedCount.toLocaleString()} of ${timeline.totalContacts.toLocaleString()} contacts completed`,
      icon: CheckCircleOutlinedIcon,
      iconClassName: 'bg-primary-soft text-primary',
    },
    {
      key: 'delivery',
      label: 'Delivery rate',
      value: `${deliveryRate}%`,
      detail: `${engagement.bounced.toLocaleString()} bounces · ${engagement.spamReports.toLocaleString()} spam reports`,
      icon: LocalShippingOutlinedIcon,
      iconClassName: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      key: 'interested',
      label: 'Interested replies',
      value: interestedReplies.toLocaleString(),
      detail: `${engagement.replyRate}% overall reply rate`,
      icon: TrendingUpOutlinedIcon,
      iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'pace',
      label: 'Sending pace',
      value: avgDailySend > 0 ? `${avgDailySend}/day` : '—',
      detail:
        bestStep != null
          ? `Most contacts at ${bestStep.label.toLowerCase()}`
          : `${timeline.contactsLeft.toLocaleString()} contacts remaining`,
      icon: InsightsOutlinedIcon,
      iconClassName: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
  ];
}

export default function CampaignInsightsPanel(props: CampaignInsightsPanelProps) {
  const insights = useMemo(() => buildInsights(props), [props]);

  return (
    <Box className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {insights.map((insight) => {
        const Icon = insight.icon;

        return (
          <Card
            key={insight.key}
            className="dashboard-stat-card h-full min-w-0 rounded-[24px] shadow-none"
          >
            <CardContent className="p-4">
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <Box className={`rounded-2xl p-2.5 ${insight.iconClassName}`}>
                  <Icon fontSize="small" />
                </Box>
                <Box className="min-w-0 flex-1">
                  <Typography variant="body2" color="text.secondary" className="text-xs">
                    {insight.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    className="mt-0.5 font-bold tracking-tight"
                    sx={{ letterSpacing: '-0.02em' }}
                  >
                    {insight.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="mt-1 block text-[11px] leading-snug"
                  >
                    {insight.detail}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
