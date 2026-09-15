'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { campaignCustomFieldsService } from '@/lib/api/services/campaign-custom-fields.service';
import type {
  CreateCampaignCustomFieldDefinitionInput,
  CreateCampaignCustomFieldOptionInput,
} from '@/lib/email/campaigns/custom-field-types';

export function useCampaignCustomFields() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('emailCampaigns.customFields', () =>
    campaignCustomFieldsService.getAll(),
  );

  const {
    mutate: createDefinitionMutate,
    isLoading: isCreatingDefinition,
    error: createDefinitionError,
  } = useApiMutation(campaignCustomFieldsService.createDefinition);

  const {
    mutate: createOptionMutate,
    isLoading: isCreatingOption,
    error: createOptionError,
  } = useApiMutation(
    ({
      fieldDefinitionId,
      input,
    }: {
      fieldDefinitionId: string;
      input: CreateCampaignCustomFieldOptionInput;
    }) => campaignCustomFieldsService.createOption(fieldDefinitionId, input),
  );

  const createDefinition = useCallback(
    async (input: CreateCampaignCustomFieldDefinitionInput) => {
      const result = await createDefinitionMutate(input);
      await refetch();
      return result;
    },
    [createDefinitionMutate, refetch],
  );

  const createOption = useCallback(
    async (fieldDefinitionId: string, input: CreateCampaignCustomFieldOptionInput) => {
      const result = await createOptionMutate({ fieldDefinitionId, input });
      await refetch();
      return result;
    },
    [createOptionMutate, refetch],
  );

  return {
    definitions: data ?? [],
    isLoading,
    isCreatingDefinition,
    isCreatingOption,
    error: fetchError ?? createDefinitionError ?? createOptionError,
    createDefinition,
    createOption,
    refetch,
  };
}
