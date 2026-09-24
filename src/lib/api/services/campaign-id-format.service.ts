import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CampaignIdFormatResponse,
  SetCampaignIdFormatInput,
} from '@/lib/email/campaign-id-format/types';

export const campaignIdFormatService = {
  getFormat() {
    return apiClient.get<CampaignIdFormatResponse>(
      ENDPOINTS.emailCampaignIdFormat.get,
    );
  },

  setFormat(input: SetCampaignIdFormatInput) {
    return apiClient.put<CampaignIdFormatResponse>(
      ENDPOINTS.emailCampaignIdFormat.set,
      input,
    );
  },
};
