import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CompaniesPage,
  CompaniesQuery,
  Company,
  CompanyFieldSchema,
  CreateCompanyInput,
  UpdateCompanyFieldSchemaInput,
  UpdateCompanyInput,
} from '@/lib/crm/companies/types';
import type {
  CrmImportPayload,
  CrmImportPreview,
  CrmImportResult,
} from '@/lib/crm/import/types';

function buildCompaniesQuery(query: CompaniesQuery = {}): string {
  const params = new URLSearchParams();

  if (query.q?.trim()) {
    params.set('q', query.q.trim());
  }

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }

  if (query.filters && Object.keys(query.filters).length > 0) {
    params.set('filters', JSON.stringify(query.filters));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function buildImportFormData(
  file: File,
  payload?: CrmImportPayload,
): FormData {
  const formData = new FormData();
  formData.append('file', file);

  if (payload) {
    formData.append('payload', JSON.stringify(payload));
  }

  return formData;
}

export const companiesService = {
  getFieldSchema() {
    return apiClient.get<CompanyFieldSchema>(ENDPOINTS.companies.fieldSchema);
  },

  updateFieldSchema(input: UpdateCompanyFieldSchemaInput) {
    return apiClient.put<CompanyFieldSchema>(
      ENDPOINTS.companies.fieldSchema,
      input,
    );
  },

  getCompanies(query?: CompaniesQuery) {
    return apiClient.get<CompaniesPage>(
      `${ENDPOINTS.companies.list}${buildCompaniesQuery(query)}`,
    );
  },

  getCompany(id: string) {
    return apiClient.get<Company>(ENDPOINTS.companies.byId(id));
  },

  createCompany(input: CreateCompanyInput) {
    return apiClient.post<Company>(ENDPOINTS.companies.list, input);
  },

  updateCompany(id: string, input: UpdateCompanyInput) {
    return apiClient.patch<Company>(ENDPOINTS.companies.byId(id), input);
  },

  deleteCompany(id: string) {
    return apiClient.delete<void>(ENDPOINTS.companies.byId(id));
  },

  previewImport(file: File, payload?: CrmImportPayload) {
    return apiClient.postFormData<CrmImportPreview>(
      ENDPOINTS.companies.importPreview,
      buildImportFormData(file, payload),
    );
  },

  importRows(file: File, payload: CrmImportPayload) {
    return apiClient.postFormData<CrmImportResult>(
      ENDPOINTS.companies.import,
      buildImportFormData(file, payload),
    );
  },
};
