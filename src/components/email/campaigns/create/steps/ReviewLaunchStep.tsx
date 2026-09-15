'use client';

import Grid from '@mui/material/Grid';
import { useFormContext } from 'react-hook-form';
import CampaignSummaryCard from '@/components/email/campaigns/create/CampaignSummaryCard';
import MailboxCapacitySummary from '@/components/email/campaigns/create/MailboxCapacitySummary';
import ReviewSectionBox from '@/components/email/campaigns/create/ReviewSectionBox';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function ReviewLaunchStep() {
  const { watch } = useFormContext<CampaignWizardFormValues>();
  const mailboxSenders = watch('mailboxSenders');
  const showMailboxCapacity = (mailboxSenders?.length ?? 0) > 0;

  return (
    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
      {showMailboxCapacity ? (
        <Grid size={{ xs: 12, md: 6 }}>
          <ReviewSectionBox title="Mailbox capacity">
            <MailboxCapacitySummary />
          </ReviewSectionBox>
        </Grid>
      ) : null}
      <CampaignSummaryCard />
    </Grid>
  );
}
