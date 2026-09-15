'use client';

import { useCallback } from 'react';
import { invalidateQuery, useApiMutation, useApiQuery } from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import {
  getFormSchema,
  getPlatformFormSchema,
  listFormRegistry,
  listPlatformForms,
  updateOrgFormSchema,
  updatePlatformFormSchema,
} from '@/lib/forms/api';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

export function useFormRegistry() {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(`forms.registry.${orgScopeKey}`, listFormRegistry);
}

export function useFormSchema(formKey: string | null) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    formKey ? `forms.schema.${orgScopeKey}.${formKey}` : 'forms.schema.disabled',
    () => getFormSchema(formKey!),
    { enabled: Boolean(formKey) },
  );
}

export function usePlatformFormRegistry() {
  return useApiQuery('platform.forms.registry', listPlatformForms);
}

export function usePlatformFormSchema(formKey: string | null) {
  return useApiQuery(
    formKey ? `platform.forms.schema.${formKey}` : 'platform.forms.schema.disabled',
    () => getPlatformFormSchema(formKey!),
    { enabled: Boolean(formKey) },
  );
}

export function useFormMutations(formKey: string) {
  const orgScopeKey = useOrgScopeKey();

  const {
    mutate: updateOrgSchemaMutate,
    isLoading: isUpdatingOrg,
    error: orgError,
  } = useApiMutation((input: UpdateFormSchemaInput) =>
    updateOrgFormSchema(formKey, input),
  );

  const {
    mutate: updatePlatformSchemaMutate,
    isLoading: isUpdatingPlatform,
    error: platformError,
  } = useApiMutation((input: UpdateFormSchemaInput) =>
    updatePlatformFormSchema(formKey, input),
  );

  const updateOrgSchema = useCallback(
    async (input: UpdateFormSchemaInput) => {
      const result = await updateOrgSchemaMutate(input);
      invalidateQuery(`forms.schema.${orgScopeKey}.${formKey}`);
      invalidateQuery(`forms.registry.${orgScopeKey}`);
      invalidateQuery(`prospects.field-schema.${orgScopeKey}`);
      invalidateQuery(`companies.field-schema.${orgScopeKey}`);
      return result;
    },
    [formKey, orgScopeKey, updateOrgSchemaMutate],
  );

  const updatePlatformSchema = useCallback(
    async (input: UpdateFormSchemaInput) => {
      const result = await updatePlatformSchemaMutate(input);
      invalidateQuery(`platform.forms.schema.${formKey}`);
      invalidateQuery('platform.forms.registry');
      invalidateQuery(`forms.schema.${orgScopeKey}.${formKey}`);
      return result;
    },
    [formKey, orgScopeKey, updatePlatformSchemaMutate],
  );

  return {
    updateOrgSchema,
    updatePlatformSchema,
    isUpdatingOrg,
    isUpdatingPlatform,
    orgError,
    platformError,
  };
}
