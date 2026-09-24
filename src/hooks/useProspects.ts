'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  invalidateQueriesByPrefix,
  invalidateQuery,
  useApiMutation,
  useApiQuery,
} from '@/hooks/api';
import { useOrgScopeKey } from '@/hooks/useAuth';
import { prospectsService } from '@/lib/api/services/prospects.service';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import type {
  CreateProspectEngagementInput,
  CreateProspectInput,
  CreateProspectStubInput,
  PipelineSummaryQuery,
  ProspectsQuery,
  UpdateProspectFieldSchemaInput,
  UpdateProspectInput,
} from '@/lib/crm/prospects/types';

export function useProspectFieldSchema() {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(`prospects.field-schema.${orgScopeKey}`, () =>
    prospectsService.getFieldSchema(),
  );
}

export function usePipelineSummary(
  refreshToken = 0,
  query: PipelineSummaryQuery = {},
) {
  const orgScopeKey = useOrgScopeKey();

  const { refetch, ...result } = useApiQuery(
    [
      'prospects.pipeline-summary',
      orgScopeKey,
      query.followUpRange ?? '',
    ].join('.'),
    () => prospectsService.getPipelineSummary(query),
  );

  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    if (refreshTokenRef.current === refreshToken) {
      return;
    }

    refreshTokenRef.current = refreshToken;
    void refetch();
  }, [refreshToken, refetch]);

  return { ...result, refetch };
}

export function useProspects(query: ProspectsQuery) {
  const orgScopeKey = useOrgScopeKey();
  const queryKey = [
    'prospects.list',
    orgScopeKey,
    query.q ?? '',
    query.page ?? 1,
    query.pageSize ?? 25,
    JSON.stringify(query.filters ?? {}),
  ].join('.');

  return useApiQuery(queryKey, () => prospectsService.getProspects(query));
}

export function useProspect(id: string) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `prospects.detail.${orgScopeKey}.${id}`,
    () => prospectsService.getProspect(id),
    { enabled: id.trim().length > 0 },
  );
}

export function useProspectEngagements(prospectId: string, refreshToken = 0) {
  const orgScopeKey = useOrgScopeKey();

  const { refetch, ...result } = useApiQuery(
    `prospects.engagements.${orgScopeKey}.${prospectId}.${refreshToken}`,
    () => prospectsService.getEngagements(prospectId),
    { enabled: prospectId.trim().length > 0 },
  );

  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    if (refreshTokenRef.current === refreshToken) {
      return;
    }

    refreshTokenRef.current = refreshToken;
    void refetch();
  }, [refreshToken, refetch]);

  return { ...result, refetch };
}

export function useProspectCampaigns(prospectId: string) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `prospects.campaigns.${orgScopeKey}.${prospectId}`,
    () => prospectsService.getCampaigns(prospectId),
    { enabled: prospectId.trim().length > 0 },
  );
}

function invalidateProspectListCaches(orgScopeKey: string) {
  invalidateQueriesByPrefix(`prospects.list.${orgScopeKey}`);
  invalidateQueriesByPrefix(`prospects.search.${orgScopeKey}`);
  invalidateQuery(`prospects.browse.recent.${orgScopeKey}`);
}

export function useProspectSearch(q: string, enabled: boolean) {
  const orgScopeKey = useOrgScopeKey();
  const trimmed = q.trim();
  const queryKey = `prospects.search.${orgScopeKey}.${trimmed}`;

  return useApiQuery(
    queryKey,
    () => prospectsService.searchProspects(trimmed),
    { enabled: enabled && trimmed.length >= 2 },
  );
}

/** Recent prospects for pickers when the user has not typed a search yet. */
export function useProspectBrowseList(enabled: boolean) {
  const orgScopeKey = useOrgScopeKey();

  return useApiQuery(
    `prospects.browse.recent.${orgScopeKey}`,
    async () => {
      const page = await prospectsService.getProspects({
        page: 1,
        pageSize: 25,
      });

      return page.items.map((prospect) => ({
        id: prospect.id,
        fullName: prospect.fullName,
        email: prospect.email,
      }));
    },
    { enabled, refetchOnWindowFocus: true },
  );
}

export function useProspectMutations() {
  const orgScopeKey = useOrgScopeKey();

  const {
    mutate: createProspectMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateProspectInput) =>
    prospectsService.createProspect(input),
  );

  const {
    mutate: createProspectStubMutate,
    isLoading: isCreatingStub,
    error: createStubError,
  } = useApiMutation((input: CreateProspectStubInput) =>
    prospectsService.createProspectStub(input),
  );

  const {
    mutate: updateFieldSchemaMutate,
    isLoading: isUpdatingSchema,
    error: schemaError,
  } = useApiMutation((input: UpdateProspectFieldSchemaInput) =>
    prospectsService.updateFieldSchema(input),
  );

  const {
    mutate: createEngagementMutate,
    isLoading: isLoggingEngagement,
    error: engagementError,
  } = useApiMutation(
    ({
      prospectId,
      input,
    }: {
      prospectId: string;
      input: CreateProspectEngagementInput;
    }) => prospectsService.createEngagement(prospectId, input),
  );

  const {
    mutate: updateProspectMutate,
    isLoading: isUpdatingProspect,
    error: updateProspectError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateProspectInput }) =>
      prospectsService.updateProspect(id, input),
  );

  const {
    mutate: deleteProspectMutate,
    isLoading: isDeletingProspect,
    error: deleteProspectError,
  } = useApiMutation((id: string) => prospectsService.deleteProspect(id));

  const createProspect = useCallback(
    async (input: CreateProspectInput) => {
      const result = await createProspectMutate(input);
      invalidateProspectListCaches(orgScopeKey);
      return result;
    },
    [createProspectMutate, orgScopeKey],
  );

  const createProspectStub = useCallback(
    async (input: CreateProspectStubInput) => {
      const result = await createProspectStubMutate(input);
      invalidateProspectListCaches(orgScopeKey);
      return result;
    },
    [createProspectStubMutate, orgScopeKey],
  );

  const updateFieldSchema = useCallback(
    async (input: UpdateProspectFieldSchemaInput) => {
      const result = await updateFieldSchemaMutate(input);
      invalidateQuery(`forms.schema.${orgScopeKey}.${CRM_PROSPECT_CREATE_FORM_KEY}`);
      invalidateQuery(`forms.registry.${orgScopeKey}`);
      invalidateQuery(`prospects.field-schema.${orgScopeKey}`);
      return result;
    },
    [orgScopeKey, updateFieldSchemaMutate],
  );

  const createEngagement = useCallback(
    (prospectId: string, input: CreateProspectEngagementInput) =>
      createEngagementMutate({ prospectId, input }),
    [createEngagementMutate],
  );

  const updateProspect = useCallback(
    (id: string, input: UpdateProspectInput) => updateProspectMutate({ id, input }),
    [updateProspectMutate],
  );

  const deleteProspect = useCallback(
    (id: string) => deleteProspectMutate(id),
    [deleteProspectMutate],
  );

  return {
    createProspect,
    createProspectStub,
    updateFieldSchema,
    updateProspect,
    deleteProspect,
    createEngagement,
    isCreating,
    isCreatingStub,
    isUpdatingSchema,
    isUpdatingProspect,
    isDeletingProspect,
    isLoggingEngagement,
    error:
      createError ??
      createStubError ??
      schemaError ??
      engagementError ??
      updateProspectError ??
      deleteProspectError,
  };
}
