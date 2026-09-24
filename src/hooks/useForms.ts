'use client';

import { useCallback } from 'react';
import {
  invalidateQueriesByPrefix,
  invalidateQuery,
  setQueryData,
  useApiMutation,
  useApiQuery,
} from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import {
  getFormSchema,
  getPlatformFormSchema,
  listFormRegistry,
  listPlatformForms,
  publishPlatformFormSchema,
  updateOrgFormSchema,
  updatePlatformFormSchema,
} from '@/lib/forms/api';
import type { ResolvedFormSchema, UpdateFormSchemaInput } from '@/lib/forms/types';

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

  const {
    mutate: publishPlatformSchemaMutate,
    isLoading: isPublishingPlatform,
    error: publishPlatformError,
  } = useApiMutation(() => publishPlatformFormSchema(formKey));

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
      setQueryData<ResolvedFormSchema>(
        `platform.forms.schema.${formKey}`,
        result,
      );
      invalidateQuery('platform.forms.registry');
      return result;
    },
    [formKey, updatePlatformSchemaMutate],
  );

  const publishPlatformSchema = useCallback(async () => {
    const result = await publishPlatformSchemaMutate(undefined);
    setQueryData<ResolvedFormSchema>(
      `platform.forms.schema.${formKey}`,
      result,
    );
    invalidateQuery('platform.forms.registry');
    invalidateQueriesByPrefix('forms.schema.');
    invalidateQueriesByPrefix('prospects.field-schema.');
    invalidateQueriesByPrefix('companies.field-schema.');
    return result;
  }, [formKey, publishPlatformSchemaMutate]);

  return {
    updateOrgSchema,
    updatePlatformSchema,
    publishPlatformSchema,
    isUpdatingOrg,
    isUpdatingPlatform,
    isPublishingPlatform,
    orgError,
    platformError,
    publishPlatformError,
  };
}
