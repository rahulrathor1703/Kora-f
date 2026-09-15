'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import CampaignTimelinePanel from '@/components/email/campaigns/detail/progress/CampaignTimelinePanel';
import DispositionSummaryPanel from '@/components/email/campaigns/detail/progress/DispositionSummaryPanel';
import EngagementFunnelPanel from '@/components/email/campaigns/detail/progress/EngagementFunnelPanel';
import ReplyBreakdownPanel from '@/components/email/campaigns/detail/progress/ReplyBreakdownPanel';
import { useEmailCampaignProgress } from '@/hooks/useEmailCampaigns';
import type { EmailCampaign } from '@/lib/email/campaigns/types';

interface OverviewTabProps {
  campaign: EmailCampaign;
}

function OverviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" className="font-bold tracking-tight">
          {title}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
            {description}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Stack>
  );
}

export default function OverviewTab({ campaign }: OverviewTabProps) {
  const { data: progress, error, isLoading, refetch } =
    useEmailCampaignProgress(campaign.id, { campaignStatus: campaign.status });

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton height={220} className="rounded-2xl" />
        <Skeleton height={320} className="rounded-2xl" />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton height={320} className="rounded-2xl" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton height={320} className="rounded-2xl" />
          </Grid>
        </Grid>
      </Stack>
    );
  }

  if (error || !progress) {
    return (
      <Alert
        severity="error"
        className="rounded-2xl"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        {error ?? 'Failed to load campaign overview'}
      </Alert>
    );
  }

  return (
    <Stack spacing={4}>
      <CampaignTimelinePanel
        campaignId={campaign.id}
        campaignStatus={campaign.status}
        timeline={progress.timeline}
      />

      <OverviewSection
        title="Engagement analytics"
        description="Funnel conversion across the campaign"
      >
        <EngagementFunnelPanel engagement={progress.engagement} />
      </OverviewSection>

      <OverviewSection
        title="Audience breakdown"
        description="How contacts are distributed across replies and campaign status"
      >
        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <ReplyBreakdownPanel items={progress.replyBreakdown} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <DispositionSummaryPanel items={progress.dispositionSummary} />
          </Grid>
        </Grid>
      </OverviewSection>
    </Stack>
  );
}
