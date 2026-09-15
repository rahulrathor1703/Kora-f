import type { CampaignRecipientDetail } from '@/lib/email/campaigns/recipient-types';
import { mapCampaignRecipientFromApi } from '@/lib/email/campaigns/recipient-mapper';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';
import type {
  ProspectCampaignItem,
  ProspectCampaignList,
} from '@/lib/crm/prospects/campaign-types';

function readAudienceListType(
  value: unknown,
): ProspectCampaignItem['audienceListType'] {
  if (value === 'contact' || value === 'manual') {
    return value;
  }

  return null;
}

export function mapProspectCampaignItemFromApi(
  raw: Record<string, unknown>,
): ProspectCampaignItem {
  const recipientRaw = raw.recipient;

  return {
    campaignId: String(raw.campaignId ?? ''),
    campaignName: String(raw.campaignName ?? ''),
    campaignStatus: String(raw.campaignStatus ?? 'draft') as EmailCampaignStatus,
    audienceListType: readAudienceListType(raw.audienceListType),
    audienceListId:
      typeof raw.audienceListId === 'string' ? raw.audienceListId : null,
    recipient: mapCampaignRecipientFromApi(
      (recipientRaw ?? {}) as CampaignRecipientDetail | Record<string, unknown>,
    ),
  };
}

export function mapProspectCampaignListFromApi(
  raw: ProspectCampaignList | Record<string, unknown>,
): ProspectCampaignList {
  const payload = raw as Record<string, unknown>;

  return {
    total: typeof payload.total === 'number' ? payload.total : 0,
    items: Array.isArray(payload.items)
      ? payload.items.map((item) =>
          mapProspectCampaignItemFromApi(item as Record<string, unknown>),
        )
      : [],
  };
}
