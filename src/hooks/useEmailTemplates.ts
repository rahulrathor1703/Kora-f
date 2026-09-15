'use client';

import { useCallback } from 'react';
import { emailTemplateService } from '@/lib/api';
import type {
  CreateEmailTemplateInput,
  EmailTemplateType,
  ListEmailTemplatesOptions,
  UpdateEmailTemplateInput,
} from '@/lib/api';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useEmailTemplates(options?: ListEmailTemplatesOptions) {
  const queryKey = options?.type
    ? `emailTemplates.${options.type}${options.includeInactive ? '.all' : ''}`
    : 'emailTemplates.all';

  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () => emailTemplateService.getAll(options));

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(emailTemplateService.create);

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateEmailTemplateInput }) =>
      emailTemplateService.update(id, input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation(emailTemplateService.delete);

  const createTemplate = useCallback(
    async (input: CreateEmailTemplateInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updateTemplate = useCallback(
    async (id: string, input: UpdateEmailTemplateInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [updateMutate, refetch],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    templates: data ?? [],
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error: fetchError ?? createError ?? updateError ?? deleteError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch,
  };
}

export function useEmailTemplate(id: string | null) {
  return useApiQuery(
    `emailTemplate.${id ?? 'none'}`,
    () => emailTemplateService.getById(id!),
    { enabled: Boolean(id) },
  );
}

export function useEmailTemplatesByType(type: EmailTemplateType) {
  return useEmailTemplates({ type });
}
