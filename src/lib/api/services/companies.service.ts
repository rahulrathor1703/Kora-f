import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  BulkDeleteCompaniesInput,
  BulkDeleteCompaniesResult,
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

  async updateFieldSchema(input: UpdateCompanyFieldSchemaInput) {
    const { updateOrgFormSchema } = await import('@/lib/forms/api');
    const { CRM_COMPANY_CREATE_FORM_KEY } = await import(
      '@/lib/forms/crm-form-keys'
    );
    const schema = await updateOrgFormSchema(CRM_COMPANY_CREATE_FORM_KEY, {
      fields: input.fields,
    });

    return {
      fields: schema.fields as CompanyFieldSchema['fields'],
      fieldKeysInUse: schema.fieldKeysInUse,
      updatedAt: new Date().toISOString(),
    } satisfies CompanyFieldSchema;
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

  bulkDeleteCompanies(input: BulkDeleteCompaniesInput) {
    return apiClient.post<BulkDeleteCompaniesResult>(
      ENDPOINTS.companies.bulkDelete,
      input,
    );
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
