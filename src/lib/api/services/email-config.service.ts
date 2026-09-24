import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateEmailConfigOptionInput,
  EmailConfigCategory,
  EmailConfigOption,
  UpdateEmailConfigOptionInput,
} from '../types/email-config.types';

export const emailConfigService = {
  getAll(category?: EmailConfigCategory) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient.get<EmailConfigOption[]>(
      `${ENDPOINTS.emailConfig.options.list}${query}`,
    );
  },

  getById(id: string) {
    return apiClient.get<EmailConfigOption>(
      ENDPOINTS.emailConfig.options.byId(id),
    );
  },

  create(input: CreateEmailConfigOptionInput) {
    return apiClient.post<EmailConfigOption>(
      ENDPOINTS.emailConfig.options.list,
      input,
    );
  },

  update(id: string, input: UpdateEmailConfigOptionInput) {
    return apiClient.patch<EmailConfigOption>(
      ENDPOINTS.emailConfig.options.byId(id),
      input,
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.emailConfig.options.byId(id));
  },
};
