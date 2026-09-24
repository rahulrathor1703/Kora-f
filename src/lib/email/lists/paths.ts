import type { AudienceListType } from '@/lib/email/campaigns/types';

export function getAudienceListPath(
  audienceListType: AudienceListType,
  audienceListId: string,
): string {
  return audienceListType === 'contact'
    ? `/email/lists/${audienceListId}`
    : `/email/lists/manual/${audienceListId}`;
}
