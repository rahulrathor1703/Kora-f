import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  BantSettingsResponse,
  ProspectBantResponse,
  UpdateBantSettingsInput,
  UpdateProspectBantInput,
} from '@/lib/crm/bant/types';

export const bantSettingsService = {
  getSettings() {
    return apiClient.get<BantSettingsResponse>(ENDPOINTS.bantSettings.get);
  },

  updateSettings(input: UpdateBantSettingsInput) {
    return apiClient.put<BantSettingsResponse>(
      ENDPOINTS.bantSettings.update,
      input,
    );
  },

  getProspectBant(prospectId: string) {
    return apiClient.get<ProspectBantResponse>(
      ENDPOINTS.prospects.bant(prospectId),
    );
  },

  updateProspectBant(prospectId: string, input: UpdateProspectBantInput) {
    return apiClient.put<ProspectBantResponse>(
      ENDPOINTS.prospects.bant(prospectId),
      input,
    );
  },
};
