'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import CampaignWizardShell from '@/components/email/campaigns/create/CampaignWizardShell';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useEmailCampaign } from '@/hooks/useEmailCampaigns';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  mapCampaignToWizardForm,
  resolveWizardStepIndex,
} from '@/lib/email/campaigns/campaign-wizard-hydrate';

interface EditCampaignPageContentProps {
  campaignId: string;
}

export default function EditCampaignPageContent({
  campaignId,
}: EditCampaignPageContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { data: campaign, error, isLoading } = useEmailCampaign(campaignId);

  useEffect(() => {
    if (!campaign || campaign.status === 'draft') {
      return;
    }

    router.replace(toOrgPath(`/email/campaigns/${campaignId}`));
  }, [campaign, campaignId, router, toOrgPath]);

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton width={160} height={40} className="rounded-2xl" />
        <Skeleton width="40%" height={48} />
        <Skeleton width="100%" height={320} className="rounded-2xl" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={3}>
        <SettingsNavButton href="/email/campaigns" label="Back to campaigns" />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
      </Stack>
    );
  }

  if (!campaign || campaign.status !== 'draft') {
    return null;
  }

  return (
    <CampaignWizardShell
      mode="resume"
      initialValues={mapCampaignToWizardForm(campaign)}
      initialStepIndex={resolveWizardStepIndex(campaign)}
    />
  );
}
