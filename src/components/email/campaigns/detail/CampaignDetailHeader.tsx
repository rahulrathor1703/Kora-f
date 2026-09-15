'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import CampaignStatusSelect from '@/components/email/campaigns/CampaignStatusSelect';
import type { EmailCampaign, EmailCampaignStatus, ResumeEmailCampaignInput } from '@/lib/email/campaigns/types';
import type { CampaignDetailLabels } from '@/hooks/useCampaignDetailLabels';

interface CampaignDetailHeaderProps {
  campaign: EmailCampaign | null;
  labels: CampaignDetailLabels;
  isLoading: boolean;
  canUpdate?: boolean;
  onContinueEditing?: () => void;
  isUpdatingStatus?: boolean;
  onStatusChange?: (status: EmailCampaignStatus) => void | Promise<void>;
  onPause?: (pausedUntil: string) => void | Promise<void>;
  onStop?: () => void | Promise<void>;
  onResume?: (options?: ResumeEmailCampaignInput) => void | Promise<void>;
}

export default function CampaignDetailHeader({
  campaign,
  labels,
  isLoading,
  canUpdate = false,
  onContinueEditing,
  isUpdatingStatus = false,
  onStatusChange,
  onPause,
  onStop,
  onResume,
}: CampaignDetailHeaderProps) {
  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width={160} height={40} className="rounded-2xl" />
        <Skeleton width="60%" height={40} />
        <Skeleton width="40%" height={24} />
      </Stack>
    );
  }

  if (!campaign) {
    return null;
  }

  const isDraft = campaign.status === 'draft';

  return (
    <Stack spacing={2}>
      <SettingsNavButton href="/email/campaigns" label="Back to campaigns" />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Box className="min-w-0 flex-1">
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            <Typography variant="h4" component="h1" className="font-bold">
              {campaign.name}
            </Typography>
            {labels.brandLabel !== '—' ? (
              <Chip
                label={labels.brandLabel}
                color="primary"
                size="small"
                className="rounded-lg font-medium"
              />
            ) : null}
          </Stack>

          {labels.customFieldLabels.length > 0 ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 1 }}
            >
              {labels.customFieldLabels.map((field) => (
                <Chip
                  key={field.label}
                  label={`${field.label}: ${field.value}`}
                  size="small"
                  variant="outlined"
                  className="rounded-lg"
                />
              ))}
            </Stack>
          ) : null}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          className="shrink-0"
        >
          {isDraft && canUpdate && onContinueEditing ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<EditOutlinedIcon />}
              onClick={onContinueEditing}
              className="rounded-xl normal-case shadow-none"
            >
              Continue editing
            </Button>
          ) : null}
          <CampaignStatusSelect
            campaignName={campaign.name}
            status={campaign.status}
            mailboxSenders={campaign.mailboxSenders}
            pausedUntil={campaign.pausedUntil}
            statusBeforePause={campaign.statusBeforePause}
            canUpdate={canUpdate}
            size="medium"
            className="rounded-xl"
            isUpdating={isUpdatingStatus}
            onStatusChange={async (status) => {
              await onStatusChange?.(status);
            }}
            onPause={async (pausedUntil) => {
              await onPause?.(pausedUntil);
            }}
            onStop={async () => {
              await onStop?.();
            }}
            onResume={async (options) => {
              await onResume?.(options);
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
