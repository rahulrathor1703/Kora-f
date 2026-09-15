'use client';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import MailboxSpamRateDisplay from '@/components/email/mailboxes/MailboxSpamRateDisplay';
import { getMailboxDeliverability } from '@/lib/email/mailbox-deliverability';
import type { MailboxCampaignsResponse, SenderMailboxDetail } from '@/lib/email/mailbox-types';

interface MetricConfig {
  key: string;
  label: string;
  icon: SvgIconComponent;
  iconClassName: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'dailySends',
    label: 'Daily sends',
    icon: SendOutlinedIcon,
    iconClassName: 'bg-primary-soft text-primary',
  },
  {
    key: 'spamScore',
    label: 'Spam score',
    icon: ShieldOutlinedIcon,
    iconClassName: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    key: 'campaigns',
    label: 'Campaigns',
    icon: CampaignOutlinedIcon,
    iconClassName: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
];

const METRIC_CARD_CLASS =
  'dashboard-stat-card h-full min-w-0 rounded-[24px] shadow-none';

interface MailboxMetricsBarProps {
  mailbox: SenderMailboxDetail | null;
  campaignsData: MailboxCampaignsResponse | null;
  isLoading: boolean;
}

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

function DailySendsMetric({ mailbox }: { mailbox: SenderMailboxDetail }) {
  const used = mailbox.dailySendsUsed;
  const limit = mailbox.dailySendLimit;

  return (
    <Typography
      variant="h5"
      className="font-bold tracking-tight"
      sx={{ letterSpacing: '-0.02em' }}
    >
      {used.toLocaleString()} / {limit.toLocaleString()}
    </Typography>
  );
}

function SpamScoreMetric({ mailbox }: { mailbox: SenderMailboxDetail }) {
  const deliverability = getMailboxDeliverability(mailbox);

  return (
    <MailboxSpamRateDisplay score={deliverability.spamScore} variant="stat" />
  );
}

function CampaignsMetric({ count }: { count: number }) {
  return (
    <Typography
      variant="h5"
      className="font-bold tracking-tight"
      sx={{ letterSpacing: '-0.02em' }}
    >
      {count.toLocaleString()}
    </Typography>
  );
}

export default function MailboxMetricsBar({
  mailbox,
  campaignsData,
  isLoading,
}: MailboxMetricsBarProps) {
  const campaignCount = campaignsData?.campaigns.length ?? 0;

  return (
    <Box className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
      {METRICS.map((metric) => (
        <Box key={metric.key} className="min-w-0">
          {isLoading || !mailbox ? (
            <MetricCardSkeleton />
          ) : (
            <Card className={METRIC_CARD_CLASS}>
              <CardContent className="p-4">
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <Box className={`rounded-2xl p-2.5 ${metric.iconClassName}`}>
                    <metric.icon fontSize="small" />
                  </Box>
                  <Box className="min-w-0 flex-1">
                    <Typography variant="body2" color="text.secondary" className="text-xs">
                      {metric.label}
                    </Typography>
                    <Box className="mt-1">
                      {metric.key === 'dailySends' ? (
                        <DailySendsMetric mailbox={mailbox} />
                      ) : null}
                      {metric.key === 'spamScore' ? (
                        <SpamScoreMetric mailbox={mailbox} />
                      ) : null}
                      {metric.key === 'campaigns' ? (
                        <CampaignsMetric count={campaignCount} />
                      ) : null}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      ))}
    </Box>
  );
}
