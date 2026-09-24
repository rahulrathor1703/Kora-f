'use client';

import { useCallback } from 'react';
import {
  invalidateQueriesByPrefix,
  invalidateQuery,
  useApiMutation,
  useApiQuery,
} from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { companiesService } from '@/lib/api/services/companies.service';
import { CRM_COMPANY_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import type {
  BulkDeleteCompaniesInput,
  CompaniesQuery,
  CreateCompanyInput,
  UpdateCompanyFieldSchemaInput,
  UpdateCompanyInput,
} from '@/lib/crm/companies/types';

export function useCompanyFieldSchema() {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(`companies.field-schema.${orgScopeKey}`, () =>
    companiesService.getFieldSchema(),
  );
}

function invalidateCompanyListCaches(orgScopeKey: string) {
  invalidateQueriesByPrefix(`companies.list.${orgScopeKey}`);
  invalidateQueriesByPrefix(`companies.search.${orgScopeKey}`);
  invalidateQuery(`companies.browse.recent.${orgScopeKey}`);
}

export function useCompanySearch(q: string, enabled: boolean) {
  const orgScopeKey = useOrgScopeKey();
  const trimmed = q.trim();
  const queryKey = `companies.search.${orgScopeKey}.${trimmed}`;

  return useApiQuery(
    queryKey,
    () =>
      companiesService.getCompanies({
        q: trimmed,
        page: 1,
        pageSize: 10,
      }),
    { enabled: enabled && trimmed.length >= 2 },
  );
}

/** Recent companies for pickers when the user has not typed a search yet. */
export function useCompanyBrowseList(enabled: boolean) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `companies.browse.recent.${orgScopeKey}`,
    () =>
      companiesService.getCompanies({
        page: 1,
        pageSize: 25,
      }),
    { enabled, refetchOnWindowFocus: true },
  );
}

export function useCompanies(query: CompaniesQuery) {
  const orgScopeKey = useOrgScopeKey();
  const queryKey = [
    'companies.list',
    orgScopeKey,
    query.q ?? '',
    query.page ?? 1,
    query.pageSize ?? 25,
    JSON.stringify(query.filters ?? {}),
  ].join('.');

  return useApiQuery(queryKey, () => companiesService.getCompanies(query));
}

export function useCompany(id: string) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `companies.detail.${orgScopeKey}.${id}`,
    () => companiesService.getCompany(id),
    { enabled: id.trim().length > 0 },
  );
}

export function useCompanyMutations() {
  const orgScopeKey = useOrgScopeKey();

  const {
    mutate: updateFieldSchemaMutate,
    isLoading: isUpdatingSchema,
    error: schemaError,
  } = useApiMutation((input: UpdateCompanyFieldSchemaInput) =>
    companiesService.updateFieldSchema(input),
  );

  const {
    mutate: createCompanyMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateCompanyInput) =>
    companiesService.createCompany(input),
  );

  const {
    mutate: updateCompanyMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateCompanyInput }) =>
      companiesService.updateCompany(id, input),
  );

  const {
    mutate: deleteCompanyMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation((id: string) => companiesService.deleteCompany(id));

  const {
    mutate: bulkDeleteCompaniesMutate,
    isLoading: isBulkDeleting,
    error: bulkDeleteError,
  } = useApiMutation((input: BulkDeleteCompaniesInput) =>
    companiesService.bulkDeleteCompanies(input),
  );

  const updateFieldSchema = useCallback(
    async (input: UpdateCompanyFieldSchemaInput) => {
      const result = await updateFieldSchemaMutate(input);
      invalidateQuery(`forms.schema.${orgScopeKey}.${CRM_COMPANY_CREATE_FORM_KEY}`);
      invalidateQuery(`forms.registry.${orgScopeKey}`);
      invalidateQuery(`companies.field-schema.${orgScopeKey}`);
      return result;
    },
    [orgScopeKey, updateFieldSchemaMutate],
  );

  const createCompany = useCallback(
    async (input: CreateCompanyInput) => {
      const result = await createCompanyMutate(input);
      invalidateCompanyListCaches(orgScopeKey);
      return result;
    },
    [createCompanyMutate, orgScopeKey],
  );

  const updateCompany = useCallback(
    async (id: string, input: UpdateCompanyInput) => {
      const result = await updateCompanyMutate({ id, input });
      invalidateCompanyListCaches(orgScopeKey);
      invalidateQuery(`companies.detail.${orgScopeKey}.${id}`);
      return result;
    },
    [orgScopeKey, updateCompanyMutate],
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      const result = await deleteCompanyMutate(id);
      invalidateCompanyListCaches(orgScopeKey);
      invalidateQuery(`companies.detail.${orgScopeKey}.${id}`);
      return result;
    },
    [deleteCompanyMutate, orgScopeKey],
  );

  const bulkDeleteCompanies = useCallback(
    async (input: BulkDeleteCompaniesInput) => {
      const result = await bulkDeleteCompaniesMutate(input);
      invalidateCompanyListCaches(orgScopeKey);
      return result;
    },
    [bulkDeleteCompaniesMutate, orgScopeKey],
  );

  return {
    createCompany,
    updateCompany,
    updateFieldSchema,
    deleteCompany,
    bulkDeleteCompanies,
    isCreating,
    isUpdating,
    isUpdatingSchema,
    isDeleting,
    isBulkDeleting,
    error:
      createError ??
      updateError ??
      schemaError ??
      deleteError ??
      bulkDeleteError,
  };
}
