'use client';

import LinkIcon from '@mui/icons-material/Link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type { ListEngagementStats } from '@/lib/email/lists/detail-types';

interface MetricConfig {
  key: keyof ListEngagementStats;
  label: string;
  colorClass: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'totalContacts',
    label: 'Total Contacts',
    colorClass: 'text-foreground',
  },
  {
    key: 'eligible',
    label: 'Eligible',
    colorClass: 'text-emerald-500',
  },
  {
    key: 'sent',
    label: 'Sent',
    colorClass: 'text-sky-500',
  },
  {
    key: 'replied',
    label: 'Replied',
    colorClass: 'text-orange-500',
  },
];

const EMPTY_STATS: ListEngagementStats = {
  totalContacts: 0,
  eligible: 0,
  sent: 0,
  replied: 0,
};

interface ListMetricsBarProps {
  stats?: ListEngagementStats | null;
  isLoading: boolean;
}

export default function ListMetricsBar({
  stats,
  isLoading,
}: ListMetricsBarProps) {
  const metrics = stats ?? EMPTY_STATS;

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {METRICS.map((metric) => (
          <Grid key={metric.key} size={{ xs: 6, md: 3 }}>
            <Skeleton height={96} className="rounded-2xl" />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {METRICS.map((metric) => (
        <Grid key={metric.key} size={{ xs: 6, md: 3 }}>
          <Card className="dashboard-stat-card h-full rounded-2xl shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <LinkIcon className={`shrink-0 ${metric.colorClass}`} />
              <div>
                <Typography
                  variant="h5"
                  className={`font-bold ${metric.colorClass}`}
                >
                  {metrics[metric.key].toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
