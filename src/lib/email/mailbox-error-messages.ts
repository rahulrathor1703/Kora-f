const GMAIL_CONNECTION_PATTERNS = [
  'could not connect to gmail',
  'gmail app password is required',
  'gmail rejected the email or password',
];

const OUTLOOK_CONNECTION_PATTERNS = [
  'could not connect to outlook',
  'outlook app password is required',
];

const DUPLICATE_EMAIL_PATTERNS = [
  'mailbox with this email already exists',
];

const CAMPAIGN_REFERENCE_PATTERNS = [
  'assigned to one or more email campaigns',
];

export function getMailboxErrorMessage(
  rawMessage: string,
  fallback = 'Something went wrong. Please try again.',
): string {
  const normalized = rawMessage.trim().toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (normalized.includes('gmail does not accept regular login passwords')) {
    return 'Gmail does not accept regular login passwords for sending. Turn on 2-Step Verification on the sender account, create a 16-character App Password, and paste it here.';
  }

  if (GMAIL_CONNECTION_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return 'We couldn’t sign in to Gmail with that email and app password. Double-check both, or create a new App Password for Mail.';
  }

  if (normalized.includes('gmail app password must be 16 characters')) {
    return 'Enter all 16 characters of your Gmail App Password.';
  }

  if (normalized.includes('could not reach gmail smtp')) {
    return 'Could not reach Gmail’s servers. Check your internet connection and try again.';
  }

  if (OUTLOOK_CONNECTION_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return 'We couldn’t sign in to Outlook with that email and app password. Double-check both, or create a new App Password for Mail.';
  }

  if (normalized.includes('outlook app password must be 16 characters')) {
    return 'Enter all 16 characters of your Outlook App Password.';
  }

  if (DUPLICATE_EMAIL_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return 'This email is already connected as a mailbox in your organization.';
  }

  if (CAMPAIGN_REFERENCE_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return 'This mailbox is assigned to one or more email campaigns. Remove it from those campaigns before deleting.';
  }

  if (normalized.includes('google sign-in expired')) {
    return 'Your Google sign-in expired. Please connect again.';
  }

  if (normalized.includes('google oauth is not configured')) {
    return 'Google sign-in isn’t set up on this server yet. Connect with the sender email and app password instead.';
  }

  if (normalized.includes('microsoft oauth is not configured')) {
    return 'Microsoft sign-in isn’t set up on this server yet. Connect with the sender email and app password instead.';
  }

  return rawMessage;
}
