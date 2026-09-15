'use client';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditMailboxDialog from '@/components/email/mailboxes/EditMailboxDialog';
import FixSpamRatingPricingDialog from '@/components/email/mailboxes/FixSpamRatingPricingDialog';
import MailboxDetailHeader from '@/components/email/mailboxes/detail/MailboxDetailHeader';
import MailboxDetailTabs from '@/components/email/mailboxes/detail/MailboxDetailTabs';
import MailboxMetricsBar from '@/components/email/mailboxes/detail/MailboxMetricsBar';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useConfirm } from '@/hooks/useConfirm';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useMailbox } from '@/hooks/useMailbox';
import { useMailboxCampaigns } from '@/hooks/useMailboxCampaigns';
import { useMailboxes } from '@/hooks/useMailboxes';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMailboxErrorMessage } from '@/lib/email/mailbox-error-messages';
import type { SenderMailboxDetail } from '@/lib/email/mailbox-types';

interface MailboxDetailContentProps {
  mailboxId: string;
}

export default function MailboxDetailContent({ mailboxId }: MailboxDetailContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const confirm = useConfirm();
  const { notifySuccess, notifyError } = useNotify();
  const [editingMailbox, setEditingMailbox] = useState<SenderMailboxDetail | null>(
    null,
  );
  const [fixSpamRatingMailboxes, setFixSpamRatingMailboxes] = useState<
    Pick<SenderMailboxDetail, 'id' | 'email' | 'displayName'>[] | null
  >(null);

  const canUpdate = useHasPermission('mailboxes:update');
  const canDelete = useHasPermission('mailboxes:delete');
  const {
    data: mailbox,
    error,
    isLoading,
    refetch: refetchMailbox,
  } = useMailbox(mailboxId);

  const {
    data: campaignsData,
    isLoading: isCampaignsLoading,
    refetch: refetchCampaigns,
  } = useMailboxCampaigns(mailboxId);

  const {
    updateMailbox,
    setMailboxStatus,
    deleteMailbox,
    isSaving,
  } = useMailboxes();

  async function handleUpdate(
    id: string,
    input: Parameters<typeof updateMailbox>[1],
  ) {
    try {
      await updateMailbox(id, input);
      await refetchMailbox();
      notifySuccess('Mailbox updated.');
    } catch (err) {
      notifyError(
        getMailboxErrorMessage(
          getApiErrorMessage(err, 'Failed to update mailbox'),
          'Failed to update mailbox',
        ),
      );
      throw err;
    }
  }

  async function handleDeactivate() {
    if (!mailbox) {
      return;
    }

    const confirmed = await confirm({
      title: 'Deactivate mailbox?',
      description: (
        <>
          Deactivating <strong>{mailbox.displayName}</strong> will stop all
          campaigns from sending through this account.
        </>
      ),
      variant: 'warning',
      confirmLabel: 'Deactivate',
    });

    if (!confirmed) {
      return;
    }

    try {
      await setMailboxStatus(mailbox.id, 'inactive');
      await refetchMailbox();
      notifySuccess(`${mailbox.displayName} deactivated.`);
    } catch (err) {
      notifyError(
        getMailboxErrorMessage(
          getApiErrorMessage(err, 'Failed to deactivate mailbox'),
          'Failed to deactivate mailbox',
        ),
      );
    }
  }

  async function handleReactivate() {
    if (!mailbox) {
      return;
    }

    try {
      await setMailboxStatus(mailbox.id, 'active');
      await refetchMailbox();
      notifySuccess(`${mailbox.displayName} reactivated.`);
    } catch (err) {
      notifyError(
        getMailboxErrorMessage(
          getApiErrorMessage(err, 'Failed to reactivate mailbox'),
          'Failed to reactivate mailbox',
        ),
      );
    }
  }

  async function handleDelete() {
    if (!mailbox) {
      return;
    }

    const confirmed = await confirm({
      title: 'Delete mailbox?',
      description: (
        <>
          Deleting <strong>{mailbox.displayName}</strong> is permanent and removes
          stored credentials. If this mailbox is assigned to email campaigns, you
          must remove it from those campaigns first.
        </>
      ),
      variant: 'destructive',
      confirmLabel: 'Delete',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteMailbox(mailbox.id);
      notifySuccess(`${mailbox.displayName} deleted.`);
      router.push(toOrgPath('/email/mailboxes'));
    } catch (err) {
      notifyError(
        getMailboxErrorMessage(
          getApiErrorMessage(err, 'Failed to delete mailbox'),
          'Failed to delete mailbox',
        ),
      );
    }
  }

  if (error && !isLoading) {
    return (
      <Stack spacing={3}>
        <SettingsNavButton href="/email/mailboxes" label="Back to mailboxes" />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              Mailbox not found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              This mailbox may have been removed or you may not have access to
              view it.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <MailboxDetailHeader
        mailbox={mailbox}
        isLoading={isLoading}
        isSaving={isSaving}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onEdit={() => {
          if (mailbox) {
            setEditingMailbox(mailbox);
          }
        }}
        onFixSpamRating={() => {
          if (mailbox) {
            setFixSpamRatingMailboxes([
              {
                id: mailbox.id,
                email: mailbox.email,
                displayName: mailbox.displayName,
              },
            ]);
          }
        }}
        onDeactivate={() => void handleDeactivate()}
        onReactivate={() => void handleReactivate()}
        onDelete={() => void handleDelete()}
      />

      <MailboxMetricsBar
        mailbox={mailbox}
        campaignsData={campaignsData}
        isLoading={isLoading || isCampaignsLoading}
      />

      {mailbox ? (
        <MailboxDetailTabs
          mailbox={mailbox}
          campaignsData={campaignsData}
          isCampaignsLoading={isCampaignsLoading}
        />
      ) : null}

      <FixSpamRatingPricingDialog
        mailboxes={fixSpamRatingMailboxes}
        onClose={() => setFixSpamRatingMailboxes(null)}
      />

      <EditMailboxDialog
        mailbox={editingMailbox}
        onClose={() => setEditingMailbox(null)}
        onUpdate={async (id, input) => {
          await handleUpdate(id, input);
          await refetchCampaigns();
        }}
        isSaving={isSaving}
      />
    </Stack>
  );
}
