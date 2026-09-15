export const EMAIL_STATUS_LABELS = {
  not_contacted: 'Not contacted',
  sent: 'Sent',
  replied: 'Replied',
  bounced: 'Bounced',
} as const;

export const EMAIL_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'not_contacted', label: EMAIL_STATUS_LABELS.not_contacted },
  { value: 'sent', label: EMAIL_STATUS_LABELS.sent },
  { value: 'replied', label: EMAIL_STATUS_LABELS.replied },
  { value: 'bounced', label: EMAIL_STATUS_LABELS.bounced },
] as const;
