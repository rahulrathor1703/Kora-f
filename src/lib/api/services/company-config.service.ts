import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateCompanyConfigOptionInput,
  CompanyConfigCategory,
  CompanyConfigOption,
  UpdateCompanyConfigOptionInput,
} from '@/lib/crm/companies/types';

export const companyConfigService = {
  getAll(category?: CompanyConfigCategory) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient.get<CompanyConfigOption[]>(
      `${ENDPOINTS.companyConfig.options.list}${query}`,
    );
  },

  getById(id: string) {
    return apiClient.get<CompanyConfigOption>(
      ENDPOINTS.companyConfig.options.byId(id),
    );
  },

  create(input: CreateCompanyConfigOptionInput) {
    return apiClient.post<CompanyConfigOption>(
      ENDPOINTS.companyConfig.options.list,
      input,
    );
  },

  update(id: string, input: UpdateCompanyConfigOptionInput) {
    return apiClient.patch<CompanyConfigOption>(
      ENDPOINTS.companyConfig.options.byId(id),
      input,
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.companyConfig.options.byId(id));
  },
};
