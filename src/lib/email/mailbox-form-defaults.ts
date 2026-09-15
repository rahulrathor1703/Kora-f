export const DEFAULT_MAILBOX_DAILY_SEND_LIMIT = 50;

export function deriveMailboxIdentityFromEmail(email: string): {
  displayName: string;
  fromName: string;
} {
  const trimmed = email.trim();
  const localPart = trimmed.split('@')[0] ?? trimmed;
  const displayName =
    localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase()) || trimmed;

  return {
    displayName,
    fromName: displayName,
  };
}
