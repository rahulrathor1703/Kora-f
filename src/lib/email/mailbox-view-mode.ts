export type MailboxViewMode = 'cards' | 'table';

export const MAILBOX_VIEW_MODE_STORAGE_KEY = 'email-mailboxes.viewMode';

export function readStoredMailboxViewMode(): MailboxViewMode {
  if (typeof window === 'undefined') {
    return 'cards';
  }

  const stored = window.localStorage.getItem(MAILBOX_VIEW_MODE_STORAGE_KEY);
  if (stored === 'table' || stored === 'cards') {
    return stored;
  }

  return 'cards';
}
