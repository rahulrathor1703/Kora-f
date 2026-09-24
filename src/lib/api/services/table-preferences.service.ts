import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  EffectiveTablePreferences,
  StoredColumnPref,
  UpsertTablePreferencesInput,
} from '../types/table-preferences.types';

export const tablePreferencesService = {
  getEffective(tableName: string) {
    return apiClient.get<EffectiveTablePreferences>(
      ENDPOINTS.tablePreferences.effective(tableName),
    );
  },

  getDefaults(tableName: string) {
    return apiClient.get<StoredColumnPref[]>(
      ENDPOINTS.tablePreferences.defaults(tableName),
    );
  },

  saveUserPreferences(tableName: string, input: UpsertTablePreferencesInput) {
    return apiClient.put<EffectiveTablePreferences>(
      ENDPOINTS.tablePreferences.user(tableName),
      input,
    );
  },

  saveTeamDefaults(tableName: string, input: UpsertTablePreferencesInput) {
    return apiClient.put<StoredColumnPref[]>(
      ENDPOINTS.tablePreferences.defaults(tableName),
      input,
    );
  },

  resetUserPreferences(tableName: string) {
    return apiClient.delete<EffectiveTablePreferences>(
      ENDPOINTS.tablePreferences.user(tableName),
    );
  },
};
