import type { SenderMailbox } from '@/lib/email/mailbox-types';

export function computeTotalDailyCapacity(mailboxes: SenderMailbox[]): number {
  return mailboxes.reduce((total, mailbox) => total + mailbox.dailySendLimit, 0);
}

export function computeTotalAllocatedQuota(
  mailboxSenders: Array<{ dailySendQuota: number }>,
): number {
  return mailboxSenders.reduce(
    (total, sender) => total + sender.dailySendQuota,
    0,
  );
}

export function splitDailyBatchEqually(
  batchSize: number,
  mailboxCount: number,
): number[] {
  if (mailboxCount <= 0) {
    return [];
  }

  const base = Math.floor(batchSize / mailboxCount);
  const remainder = batchSize % mailboxCount;

  return Array.from({ length: mailboxCount }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

export function splitDailyBatchByMailboxLimits(
  batchSize: number,
  mailboxLimits: number[],
): number[] {
  const count = mailboxLimits.length;
  if (count === 0) {
    return [];
  }

  const quotas = splitDailyBatchEqually(batchSize, count).map((quota, index) =>
    Math.min(quota, mailboxLimits[index]),
  );

  let remaining = batchSize - quotas.reduce((sum, quota) => sum + quota, 0);

  while (remaining > 0) {
    const eligible = quotas
      .map((quota, index) => ({
        index,
        headroom: mailboxLimits[index] - quota,
      }))
      .filter(({ headroom }) => headroom > 0);

    if (eligible.length === 0) {
      break;
    }

    const base = Math.floor(remaining / eligible.length);
    let leftover = remaining % eligible.length;
    let distributed = 0;

    for (const { index, headroom } of eligible) {
      const add = Math.min(headroom, base + (leftover > 0 ? 1 : 0));
      if (leftover > 0) {
        leftover -= 1;
      }

      quotas[index] += add;
      distributed += add;
    }

    remaining -= distributed;

    if (distributed === 0) {
      break;
    }
  }

  return quotas;
}

export function findMailboxQuotaLimitViolations(
  mailboxSenders: Array<{ mailboxId: string; dailySendQuota: number }>,
  mailboxesById: Map<string, SenderMailbox>,
): Array<{ index: number; message: string }> {
  return mailboxSenders.flatMap((sender, index) => {
    const mailbox = mailboxesById.get(sender.mailboxId);
    if (!mailbox) {
      return [];
    }

    const message = buildMailboxQuotaLimitError(
      sender.dailySendQuota,
      mailbox.dailySendLimit,
    );

    return message ? [{ index, message }] : [];
  });
}

export function getDefaultMailboxSendQuota(
  dailyBatchSize: number,
  mailboxDailyLimit: number,
): number {
  return Math.min(dailyBatchSize, mailboxDailyLimit);
}

export function buildMailboxQuotaLimitError(
  quota: number,
  mailboxDailyLimit: number,
): string | null {
  if (quota > mailboxDailyLimit) {
    return `Cannot exceed mailbox limit of ${mailboxDailyLimit.toLocaleString()}/day`;
  }

  return null;
}

export function buildTotalQuotaBatchError(
  totalQuota: number,
  dailyBatchSize: number,
): string | null {
  if (totalQuota > dailyBatchSize) {
    return `Total allocated (${totalQuota.toLocaleString()}) exceeds daily batch size (${dailyBatchSize.toLocaleString()})`;
  }

  return null;
}

export function buildAutoSplitCapacityNote(
  allocatedTotal: number,
  dailyBatchSize: number,
): string | null {
  if (allocatedTotal >= dailyBatchSize) {
    return null;
  }

  const emailLabel = allocatedTotal === 1 ? 'email' : 'emails';

  return `Only ${allocatedTotal.toLocaleString()} ${emailLabel} can be sent daily based on your mailbox limits. Your daily batch size is ${dailyBatchSize.toLocaleString()}.`;
}

export function resolveSelectedMailboxes(
  mailboxSenders: Array<{ mailboxId: string }>,
  mailboxes: SenderMailbox[],
): SenderMailbox[] {
  const mailboxIds = new Set(mailboxSenders.map((sender) => sender.mailboxId));
  return mailboxes.filter((mailbox) => mailboxIds.has(mailbox.id));
}

interface AudienceCapacityMessageInput {
  listCount: number;
  mailboxCapacity: number;
  selectedMailboxCount: number;
}

export function buildAudienceCapacityMessage({
  listCount,
  mailboxCapacity,
  selectedMailboxCount,
}: AudienceCapacityMessageInput): string | null {
  if (listCount <= 0 || mailboxCapacity <= 0 || selectedMailboxCount <= 0) {
    return null;
  }

  const mailboxLabel =
    selectedMailboxCount === 1 ? 'mailbox' : 'mailboxes';

  if (listCount <= mailboxCapacity) {
    return `${listCount.toLocaleString()} contacts — within your ${mailboxCapacity.toLocaleString()}/day ${mailboxLabel} capacity.`;
  }

  return `This list has ${listCount.toLocaleString()} contacts. Your ${selectedMailboxCount} selected ${mailboxLabel} can send up to ${mailboxCapacity.toLocaleString()}/day combined — remaining contacts will send on following days.`;
}

export function buildDailyBatchCapacityHelperText(
  dailyBatchSize: number,
  mailboxCapacity: number,
): string | null {
  if (mailboxCapacity <= 0 || dailyBatchSize <= mailboxCapacity) {
    return null;
  }

  return `Exceeds combined mailbox limit (${mailboxCapacity.toLocaleString()}/day); extra sends will queue for the next day.`;
}
