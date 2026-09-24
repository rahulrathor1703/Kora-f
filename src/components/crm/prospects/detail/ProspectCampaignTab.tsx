'use client';

import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CampaignRecipientActions from '@/components/email/campaigns/CampaignRecipientActions';
import RecipientDetailDrawer from '@/components/email/campaigns/detail/RecipientDetailDrawer';
import { useCampaignRecipientActions } from '@/hooks/useCampaignRecipientActions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useProspectCampaigns } from '@/hooks/useProspects';
import {
  formatStatusLabel,
  STATUS_COLORS,
} from '@/lib/email/campaigns/detail-utils';
import { formatReplyCategoryLabel } from '@/lib/email/campaigns/reply-category-utils';
import {
  CAMPAIGN_RECIPIENT_STATUS_COLORS,
  CAMPAIGN_RECIPIENT_STATUS_LABELS,
  formatTrackingTimestamp,
} from '@/lib/email/campaigns/recipient-status-utils';
import type { ProspectCampaignItem } from '@/lib/crm/prospects/campaign-types';
import type { Prospect } from '@/lib/crm/prospects/types';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface ProspectCampaignTabProps {
  prospect: Prospect;
}

interface ProspectCampaignCardProps {
  item: ProspectCampaignItem;
  isUpdating: boolean;
  onOpenActivity: () => void;
  onOpenCampaign: () => void;
  onPause: (
    campaignId: string,
    recipientId: string,
    email: string,
    pausedUntil: string,
  ) => void;
  onStop: (campaignId: string, recipientId: string, email: string) => void;
  onResume: (campaignId: string, recipientId: string, email: string) => void;
  onExclude: (campaignId: string, recipientId: string, email: string) => void;
}

function ProspectCampaignCard({
  item,
  isUpdating,
  onOpenActivity,
  onOpenCampaign,
  onPause,
  onStop,
  onResume,
  onExclude,
}: ProspectCampaignCardProps) {
  const { recipient } = item;
  const engagementStatus = recipient.engagement.status;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onOpenActivity}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenActivity();
        }
      }}
      className="cursor-pointer rounded-2xl border border-border/60 p-4 transition-colors hover:border-border hover:bg-surface-muted/40"
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        className="items-start justify-between"
      >
        <Stack spacing={1.25} className="min-w-0 flex-1">
          <Stack
            direction="row"
            spacing={1}
            className="flex-wrap items-center gap-y-1"
          >
            <Typography variant="subtitle1" className="font-bold">
              {item.campaignName}
            </Typography>
            <Chip
              label={formatStatusLabel(item.campaignStatus as EmailCampaignStatus)}
              color={
                STATUS_COLORS[item.campaignStatus as EmailCampaignStatus] ??
                'default'
              }
              size="small"
              className="rounded-lg capitalize"
            />
            <Chip
              label={CAMPAIGN_RECIPIENT_STATUS_LABELS[engagementStatus]}
              color={CAMPAIGN_RECIPIENT_STATUS_COLORS[engagementStatus]}
              size="small"
              className="rounded-lg"
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            className="flex-wrap text-sm text-text-secondary"
          >
            <Typography variant="body2" color="text.secondary">
              Step {recipient.currentStepOrder}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last sent {formatTrackingTimestamp(recipient.lastSentAt)}
            </Typography>
            {recipient.replyCategory ? (
              <Typography variant="body2" color="text.secondary">
                Reply: {formatReplyCategoryLabel(recipient.replyCategory)}
              </Typography>
            ) : null}
          </Stack>

          <Stack direction="row" spacing={1} className="flex-wrap">
            <Button
              size="small"
              variant="text"
              className="normal-case"
              onClick={(event) => {
                event.stopPropagation();
                onOpenActivity();
              }}
            >
              View activity
            </Button>
            <Button
              size="small"
              variant="text"
              endIcon={<OpenInNewOutlinedIcon fontSize="small" />}
              className="normal-case"
              onClick={(event) => {
                event.stopPropagation();
                onOpenCampaign();
              }}
            >
              Open campaign
            </Button>
          </Stack>
        </Stack>

        <Box onClick={(event) => event.stopPropagation()}>
          <CampaignRecipientActions
            campaignId={item.campaignId}
            recipientId={recipient.id}
            email={recipient.email}
            contactDisposition={recipient.contactDisposition}
            pausedUntil={recipient.pausedUntil}
            repliedAt={recipient.repliedAt}
            globallyExcluded={recipient.globallyExcluded}
            isUpdating={isUpdating}
            onPause={onPause}
            onStop={onStop}
            onResume={onResume}
            onExclude={onExclude}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export default function ProspectCampaignTab({ prospect }: ProspectCampaignTabProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const canReadCampaigns = useHasPermission('email-campaigns:read');
  const [selectedItem, setSelectedItem] = useState<ProspectCampaignItem | null>(
    null,
  );
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useProspectCampaigns(prospect.id);
  const {
    pauseRecipient,
    stopRecipient,
    resumeRecipient,
    excludeRecipient,
    isUpdating,
  } = useCampaignRecipientActions({
    onSuccess: async () => {
      await refetch();
    },
  });

  const campaigns = data?.items ?? [];
  const hasEmail = prospect.email.trim().length > 0;

  if (!canReadCampaigns) {
    return (
      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="px-6 py-14 text-center">
          <Typography variant="h6" className="font-bold">
            Campaign access required
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            You need email campaign read access to view this prospect&apos;s
            campaign history.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-6">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" className="font-bold">
                Email campaigns
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Campaigns where {prospect.fullName || 'this prospect'} is enrolled
                as a recipient, matched by email address.
              </Typography>
            </Box>

            {!hasEmail ? (
              <Box className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
                <Typography variant="body1" className="font-semibold">
                  No email address on file
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  Add an email on the Overview tab to see linked campaign activity.
                </Typography>
              </Box>
            ) : null}

            {hasEmail && error ? (
              <Alert severity="error" className="rounded-2xl">
                {error}
              </Alert>
            ) : null}

            {hasEmail && isLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading campaigns…
              </Typography>
            ) : null}

            {hasEmail && !isLoading && !error && campaigns.length === 0 ? (
              <Box className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
                <Typography variant="body1" className="font-semibold">
                  Not enrolled in any email campaigns yet
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  When this prospect is included in a scheduled or active campaign,
                  their send and engagement status will appear here.
                </Typography>
              </Box>
            ) : null}

            {hasEmail && !isLoading && campaigns.length > 0 ? (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {campaigns.length.toLocaleString()} campaign
                  {campaigns.length === 1 ? '' : 's'}
                </Typography>
                {campaigns.map((item) => (
                  <ProspectCampaignCard
                    key={`${item.campaignId}-${item.recipient.id}`}
                    item={item}
                    isUpdating={isUpdating}
                    onOpenActivity={() => setSelectedItem(item)}
                    onOpenCampaign={() =>
                      router.push(toOrgPath(`/email/campaigns/${item.campaignId}`))
                    }
                    onPause={pauseRecipient}
                    onStop={stopRecipient}
                    onResume={resumeRecipient}
                    onExclude={excludeRecipient}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <RecipientDetailDrawer
        campaignId={selectedItem?.campaignId ?? ''}
        recipient={selectedItem?.recipient ?? null}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
