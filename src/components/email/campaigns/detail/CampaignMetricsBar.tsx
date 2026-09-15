'use client';

import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import DoNotDisturbAltOutlinedIcon from '@mui/icons-material/DoNotDisturbAltOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import UnsubscribeOutlinedIcon from '@mui/icons-material/UnsubscribeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import type {
  EmailCampaignProgressEngagement,
  EmailCampaignProgressTimeline,
} from '@/lib/email/campaigns/progress-types';
import { computeDeliverabilityRate } from '@/lib/email/campaigns/engagement-funnel-utils';

interface MetricConfig {
  key: string;
  label: string;
  icon: SvgIconComponent;
  iconClassName: string;
  getValue: (engagement: EmailCampaignProgressEngagement) => string;
}

interface SendingPaceMetric {
  key: 'sendingPace';
  label: string;
  icon: SvgIconComponent;
  iconClassName: string;
  value: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'sent',
    label: 'Total sent',
    icon: EmailOutlinedIcon,
    iconClassName: 'bg-primary-soft text-primary',
    getValue: (engagement) => engagement.sent.toLocaleString(),
  },
  {
    key: 'deliverability',
    label: 'Deliverability',
    icon: MarkEmailReadOutlinedIcon,
    iconClassName: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    getValue: (engagement) => `${computeDeliverabilityRate(engagement)}%`,
  },
  {
    key: 'openRate',
    label: 'Open rate',
    icon: VisibilityOutlinedIcon,
    iconClassName: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    getValue: (engagement) => `${engagement.openRate}%`,
  },
  {
    key: 'ctr',
    label: 'CTR',
    icon: AdsClickOutlinedIcon,
    iconClassName: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    getValue: (engagement) => `${engagement.ctr}%`,
  },
  {
    key: 'replyRate',
    label: 'Reply rate',
    icon: ReplyOutlinedIcon,
    iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    getValue: (engagement) => `${engagement.replyRate}%`,
  },
  {
    key: 'bounceRate',
    label: 'Bounce rate',
    icon: DoNotDisturbAltOutlinedIcon,
    iconClassName: 'bg-red-500/10 text-red-600 dark:text-red-400',
    getValue: (engagement) => `${engagement.bounceRate}%`,
  },
  {
    key: 'unsubscribeRate',
    label: 'Unsubscribe rate',
    icon: UnsubscribeOutlinedIcon,
    iconClassName: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    getValue: (engagement) => `${engagement.unsubscribeRate}%`,
  },
];

function buildSendingPaceMetric(
  timeline: EmailCampaignProgressTimeline,
): SendingPaceMetric {
  const avgDailySend =
    timeline.daysRunning > 0
      ? Math.round(timeline.sentCount / timeline.daysRunning)
      : 0;

  return {
    key: 'sendingPace',
    label: 'Sending pace',
    icon: InsightsOutlinedIcon,
    iconClassName: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    value: avgDailySend > 0 ? `${avgDailySend}/day` : '—',
  };
}

const EMPTY_ENGAGEMENT: EmailCampaignProgressEngagement = {
  sent: 0,
  opened: 0,
  openRate: 0,
  clicked: 0,
  ctr: 0,
  replied: 0,
  replyRate: 0,
  bounced: 0,
  bounceRate: 0,
  unsubscribed: 0,
  unsubscribeRate: 0,
  spamReports: 0,
};

interface CampaignMetricsBarProps {
  engagement?: EmailCampaignProgressEngagement | null;
  timeline?: EmailCampaignProgressTimeline | null;
  isLoading: boolean;
}

const METRIC_CARD_CLASS =
  'dashboard-stat-card h-full min-w-0 rounded-[24px] shadow-none';

function MetricCardSkeleton() {
  return (
    <Card className={METRIC_CARD_CLASS}>
      <CardContent className="p-4">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Skeleton variant="rounded" width={40} height={40} className="rounded-2xl" />
          <Box className="min-w-0 flex-1">
            <Skeleton width="55%" height={18} />
            <Skeleton width="40%" height={28} className="mt-1" />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  icon: Icon,
  iconClassName,
  value,
}: {
  label: string;
  icon: SvgIconComponent;
  iconClassName: string;
  value: string;
}) {
  return (
    <Card className={METRIC_CARD_CLASS}>
      <CardContent className="p-4">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box className={`rounded-2xl p-2.5 ${iconClassName}`}>
            <Icon fontSize="small" />
          </Box>
          <Box className="min-w-0 flex-1">
            <Typography variant="body2" color="text.secondary" className="text-xs">
              {label}
            </Typography>
            <Typography
              variant="h5"
              className="mt-0.5 font-bold tracking-tight"
              sx={{ letterSpacing: '-0.02em' }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CampaignMetricsBar({
  engagement,
  timeline,
  isLoading,
}: CampaignMetricsBarProps) {
  const metrics = engagement ?? EMPTY_ENGAGEMENT;
  const sendingPace = timeline != null ? buildSendingPaceMetric(timeline) : null;
  const cards = sendingPace
    ? [...METRICS, sendingPace]
    : METRICS;

  return (
    <Box className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {cards.map((card) => (
        <Box key={card.key} className="min-w-0">
          {isLoading ? (
            <MetricCardSkeleton />
          ) : 'getValue' in card ? (
            <MetricCard
              label={card.label}
              icon={card.icon}
              iconClassName={card.iconClassName}
              value={card.getValue(metrics)}
            />
          ) : (
            <MetricCard
              label={card.label}
              icon={card.icon}
              iconClassName={card.iconClassName}
              value={card.value}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}
