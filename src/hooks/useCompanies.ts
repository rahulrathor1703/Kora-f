'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { companiesService } from '@/lib/api/services/companies.service';
import type {
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

export function useCompanies(query: CompaniesQuery) {
  const queryKey = [
    'companies.list',
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

  const updateFieldSchema = useCallback(
    (input: UpdateCompanyFieldSchemaInput) => updateFieldSchemaMutate(input),
    [updateFieldSchemaMutate],
  );

  const createCompany = useCallback(
    (input: CreateCompanyInput) => createCompanyMutate(input),
    [createCompanyMutate],
  );

  const updateCompany = useCallback(
    (id: string, input: UpdateCompanyInput) =>
      updateCompanyMutate({ id, input }),
    [updateCompanyMutate],
  );

  const deleteCompany = useCallback(
    (id: string) => deleteCompanyMutate(id),
    [deleteCompanyMutate],
  );

  return {
    createCompany,
    updateCompany,
    updateFieldSchema,
    deleteCompany,
    isCreating,
    isUpdating,
    isUpdatingSchema,
    isDeleting,
    error: createError ?? updateError ?? schemaError ?? deleteError,
  };
}
