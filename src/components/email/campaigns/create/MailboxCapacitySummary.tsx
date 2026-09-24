'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useFormContext } from 'react-hook-form';
import {
  ReviewSummaryRow,
  ReviewSummaryRows,
} from '@/components/email/campaigns/create/ReviewSummaryRows';
import { useMailboxes } from '@/hooks/useMailboxes';
import {
  buildDailyBatchCapacityHelperText,
  buildTotalQuotaBatchError,
  computeTotalAllocatedQuota,
  computeTotalDailyCapacity,
  resolveSelectedMailboxes,
} from '@/lib/email/campaigns/mailbox-capacity';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function MailboxCapacitySummary() {
  const { watch } = useFormContext<CampaignWizardFormValues>();
  const dailyBatchSize = watch('dailyBatchSize');
  const mailboxSenders = watch('mailboxSenders');
  const { mailboxes } = useMailboxes();

  const selectedMailboxes = resolveSelectedMailboxes(
    mailboxSenders ?? [],
    mailboxes,
  );

  if (selectedMailboxes.length === 0) {
    return null;
  }

  const mailboxCapacity = computeTotalDailyCapacity(selectedMailboxes);
  const totalAllocated = computeTotalAllocatedQuota(mailboxSenders ?? []);
  const capacityWarning = buildDailyBatchCapacityHelperText(
    dailyBatchSize,
    mailboxCapacity,
  );
  const totalQuotaError = buildTotalQuotaBatchError(
    totalAllocated,
    dailyBatchSize,
  );
  const mailboxesById = new Map(
    selectedMailboxes.map((mailbox) => [mailbox.id, mailbox]),
  );

  return (
    <Stack spacing={1.5}>
      <ReviewSummaryRows>
        <ReviewSummaryRow
          label="Daily batch size"
          value={`${dailyBatchSize.toLocaleString()} emails/day`}
        />
        {(mailboxSenders ?? []).map((sender) => {
          const mailbox = mailboxesById.get(sender.mailboxId);
          const capacity = (
            mailbox?.dailySendLimit ?? sender.dailySendQuota
          ).toLocaleString();

          return (
            <ReviewSummaryRow
              key={sender.mailboxId}
              label={mailbox?.displayName ?? sender.senderName}
              value={`${capacity} emails/day`}
            />
          );
        })}
        {selectedMailboxes.length > 1 ? (
          <ReviewSummaryRow
            label="Combined mailbox capacity"
            value={`${mailboxCapacity.toLocaleString()} emails/day`}
          />
        ) : null}
      </ReviewSummaryRows>

      {totalQuotaError ? (
        <Alert severity="error" className="rounded-xl">
          {totalQuotaError}
        </Alert>
      ) : null}

      {capacityWarning ? (
        <Alert severity="warning" className="rounded-xl">
          {capacityWarning}
        </Alert>
      ) : null}
    </Stack>
  );
}
