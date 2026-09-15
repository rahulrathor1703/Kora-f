import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CampaignCustomFieldDefinition,
  CreateCampaignCustomFieldDefinitionInput,
  CreateCampaignCustomFieldOptionInput,
  CampaignCustomFieldOption,
} from '@/lib/email/campaigns/custom-field-types';

export const campaignCustomFieldsService = {
  getAll() {
    return apiClient.get<CampaignCustomFieldDefinition[]>(
      ENDPOINTS.emailCampaigns.customFields.list,
    );
  },

  createDefinition(input: CreateCampaignCustomFieldDefinitionInput) {
    return apiClient.post<CampaignCustomFieldDefinition>(
      ENDPOINTS.emailCampaigns.customFields.list,
      input,
    );
  },

  createOption(fieldDefinitionId: string, input: CreateCampaignCustomFieldOptionInput) {
    return apiClient.post<CampaignCustomFieldOption>(
      ENDPOINTS.emailCampaigns.customFields.options(fieldDefinitionId),
      input,
    );
  },
};
