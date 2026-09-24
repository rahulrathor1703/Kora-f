import type { ChipProps } from '@mui/material/Chip';

export type EmailCampaignReplyCategory =
  | 'interested'
  | 'not_now'
  | 'no'
  | 'ooo'
  | 'wrong_person';

export const REPLY_CATEGORY_OPTIONS: Array<{
  value: EmailCampaignReplyCategory;
  label: string;
}> = [
  { value: 'interested', label: 'Interested' },
  { value: 'not_now', label: 'Not now' },
  { value: 'no', label: 'No' },
  { value: 'ooo', label: 'Out of office' },
  { value: 'wrong_person', label: 'Wrong person' },
];

export const REPLY_CATEGORY_LABELS: Record<EmailCampaignReplyCategory, string> =
  {
    interested: 'Interested',
    not_now: 'Not now',
    no: 'No',
    ooo: 'Out of office',
    wrong_person: 'Wrong person',
  };

export const REPLY_CATEGORY_CHIP_COLORS: Record<
  EmailCampaignReplyCategory,
  NonNullable<ChipProps['color']>
> = {
  interested: 'success',
  not_now: 'warning',
  no: 'error',
  ooo: 'info',
  wrong_person: 'default',
};

export const REPLY_CATEGORY_TEXT_CLASSES: Record<
  EmailCampaignReplyCategory,
  string
> = {
  interested: 'text-emerald-500',
  not_now: 'text-amber-500',
  no: 'text-red-500',
  ooo: 'text-sky-500',
  wrong_person: 'text-text-secondary',
};

export function formatReplyCategoryLabel(
  category: string | null | undefined,
): string {
  if (!category) {
    return '—';
  }

  return (
    REPLY_CATEGORY_LABELS[category as EmailCampaignReplyCategory] ??
    category.replaceAll('_', ' ')
  );
}

export function getReplyCategoryChipColor(
  category: string | null | undefined,
): NonNullable<ChipProps['color']> {
  if (!category) {
    return 'default';
  }

  return (
    REPLY_CATEGORY_CHIP_COLORS[category as EmailCampaignReplyCategory] ??
    'default'
  );
}

export function getReplyCategoryTextClass(
  category: string,
): string {
  return REPLY_CATEGORY_TEXT_CLASSES[category as EmailCampaignReplyCategory] ?? 'text-foreground';
}
