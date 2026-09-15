import type { SenderMailbox } from '@/lib/email/mailbox-types';

export const MAILBOX_TEST_CONNECTION_STORAGE_KEY =
  'email-mailboxes.testConnectionPassed';

export type MailboxTestConnectionSnapshots = Record<string, string>;

export function readMailboxTestConnectionSnapshots(): MailboxTestConnectionSnapshots {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(MAILBOX_TEST_CONNECTION_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === 'string' && typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

export function writeMailboxTestConnectionSnapshots(
  snapshots: MailboxTestConnectionSnapshots,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    MAILBOX_TEST_CONNECTION_STORAGE_KEY,
    JSON.stringify(snapshots),
  );
}

export function isMailboxTestConnectionPassed(
  mailbox: SenderMailbox,
  snapshots: MailboxTestConnectionSnapshots,
): boolean {
  const snapshot = snapshots[mailbox.id];
  if (!snapshot || !mailbox.updatedAt) {
    return false;
  }

  return snapshot === mailbox.updatedAt;
}

export function markMailboxTestConnectionPassed(
  mailbox: SenderMailbox,
  snapshots: MailboxTestConnectionSnapshots,
): MailboxTestConnectionSnapshots {
  if (!mailbox.updatedAt) {
    return snapshots;
  }

  return {
    ...snapshots,
    [mailbox.id]: mailbox.updatedAt,
  };
}
