'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import AddCampaignMailboxSenderDialog from '@/components/email/campaigns/detail/AddCampaignMailboxSenderDialog';
import CampaignMailboxSendersTable from '@/components/email/campaigns/detail/CampaignMailboxSendersTable';
import EditCampaignMailboxSenderDialog from '@/components/email/campaigns/detail/EditCampaignMailboxSenderDialog';
import { useCampaignMailboxSenderActions } from '@/hooks/useCampaignMailboxSenderActions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useEmailCampaign } from '@/hooks/useEmailCampaigns';
import { useMailboxes } from '@/hooks/useMailboxes';
import {
  computeTotalAllocatedQuota,
  buildTotalQuotaBatchError,
} from '@/lib/email/campaigns/mailbox-capacity';
import { countActiveMailboxSenders } from '@/lib/email/campaigns/mailbox-sender-utils';
import type { EmailCampaign, EmailCampaignMailboxSender } from '@/lib/email/campaigns/types';

interface MailboxesTabProps {
  campaign: EmailCampaign;
}

export default function MailboxesTab({ campaign }: MailboxesTabProps) {
  const canUpdateCampaigns = useHasPermission('email-campaigns:update');
  const { mailboxes } = useMailboxes();
  const { refetch } = useEmailCampaign(campaign.id);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSender, setEditingSender] =
    useState<EmailCampaignMailboxSender | null>(null);

  const {
    addMailboxSender,
    updateMailboxSender,
    pauseMailboxSender,
    stopMailboxSender,
    resumeMailboxSender,
    isUpdating,
  } = useCampaignMailboxSenderActions({
    onSuccess: async () => {
      await refetch();
    },
  });

  const mailboxesById = useMemo(
    () => new Map(mailboxes.map((mailbox) => [mailbox.id, mailbox])),
    [mailboxes],
  );

  const senders = campaign.mailboxSenders ?? [];
  const activeSenders = senders.filter((sender) => sender.status === 'active');
  const activeQuotaTotal = computeTotalAllocatedQuota(
    activeSenders.map((sender) => ({
      dailySendQuota: sender.dailySendQuota ?? 0,
    })),
  );
  const assignedMailboxIds = senders
    .filter((sender) => sender.status === 'active' || sender.status === 'paused')
    .map((sender) => sender.mailboxId);
  const quotaBatchError = buildTotalQuotaBatchError(
    activeQuotaTotal,
    campaign.dailyBatchSize,
  );

  const refreshAfterMutation = async () => {
    await refetch();
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" className="font-bold">
            Campaign mailboxes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage senders while the campaign runs. Pausing or stopping the last
            active mailbox while the campaign is sending will pause the campaign.
            Stopping the last mailbox requires adding a new mailbox before you can
            resume sending.
          </Typography>
        </Box>

        {canUpdateCampaigns ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="shrink-0 rounded-xl normal-case"
            onClick={() => setIsAddOpen(true)}
          >
            Add mailbox
          </Button>
        ) : null}
      </Stack>

      <Card variant="outlined" className="rounded-2xl border-surface-border">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2" className="font-bold">
              Daily allocation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active mailboxes: {countActiveMailboxSenders(senders)} · Allocated{' '}
              {activeQuotaTotal.toLocaleString()} /{' '}
              {campaign.dailyBatchSize.toLocaleString()} daily batch
            </Typography>
            {quotaBatchError ? (
              <Alert severity="warning">{quotaBatchError}</Alert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <CampaignMailboxSendersTable
        campaignId={campaign.id}
        campaignName={campaign.name}
        campaignStatus={campaign.status}
        activeSenderCount={countActiveMailboxSenders(senders)}
        senders={senders}
        mailboxesById={mailboxesById}
        isUpdating={isUpdating}
        onEdit={setEditingSender}
        onPause={pauseMailboxSender}
        onStop={stopMailboxSender}
        onResume={resumeMailboxSender}
      />

      {canUpdateCampaigns ? (
        <>
          <AddCampaignMailboxSenderDialog
            open={isAddOpen}
            campaignId={campaign.id}
            dailyBatchSize={campaign.dailyBatchSize}
            assignedMailboxIds={assignedMailboxIds}
            activeQuotaTotal={activeQuotaTotal}
            onClose={() => setIsAddOpen(false)}
            isSubmitting={isUpdating}
            onSubmit={async (input) => {
              const mailbox = mailboxesById.get(input.mailboxId);
              await addMailboxSender(
                campaign.id,
                input,
                mailbox?.email ?? input.senderEmail,
              );
              await refreshAfterMutation();
            }}
          />

          <EditCampaignMailboxSenderDialog
            open={editingSender !== null}
            campaignId={campaign.id}
            sender={editingSender}
            dailyBatchSize={campaign.dailyBatchSize}
            assignedMailboxIds={assignedMailboxIds}
            activeQuotaTotal={activeQuotaTotal}
            onClose={() => setEditingSender(null)}
            isSubmitting={isUpdating}
            onSubmit={async (input) => {
              if (!editingSender) {
                return;
              }

              const mailbox = mailboxesById.get(
                input.mailboxId ?? editingSender.mailboxId,
              );
              await updateMailboxSender(
                campaign.id,
                editingSender.id,
                input,
                mailbox?.email ?? editingSender.senderEmail,
              );
              await refreshAfterMutation();
            }}
          />
        </>
      ) : null}
    </Stack>
  );
}
