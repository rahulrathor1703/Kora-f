import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateProspectDeleteRequestInput,
  CreateProspectEngagementInput,
  CreateProspectInput,
  CreateProspectStubInput,
  PipelineSummary,
  PipelineSummaryQuery,
  Prospect,
  ProspectDeleteRequest,
  ProspectDeleteRequestsQuery,
  ProspectDeleteRequestSummaryCounts,
  ProspectEngagement,
  ProspectFieldSchema,
  ProspectSearchResult,
  ProspectsPage,
  ProspectsQuery,
  RejectProspectDeleteRequestInput,
  UpdateProspectFieldSchemaInput,
  UpdateProspectInput,
} from '@/lib/crm/prospects/types';
import type { ProspectCampaignList } from '@/lib/crm/prospects/campaign-types';
import { mapProspectCampaignListFromApi } from '@/lib/crm/prospects/campaign-mapper';
import type { FollowUpsQuery } from '@/lib/crm/followups/types';
import type {
  CrmImportPayload,
  CrmImportPreview,
  CrmImportResult,
} from '@/lib/crm/import/types';

function buildProspectsQuery(query: ProspectsQuery = {}): string {
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

  if (query.followUpRange) {
    params.set('followUpRange', query.followUpRange);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function buildPipelineSummaryQuery(query: PipelineSummaryQuery = {}): string {
  const params = new URLSearchParams();

  if (query.followUpRange) {
    params.set('followUpRange', query.followUpRange);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function buildFollowUpsQuery(query: FollowUpsQuery): string {
  const params = new URLSearchParams();
  params.set('range', query.range);

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }

  return `?${params.toString()}`;
}

function buildDeleteRequestsQuery(
  query: ProspectDeleteRequestsQuery = {},
): string {
  const params = new URLSearchParams();

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.prospectId) {
    params.set('prospectId', query.prospectId);
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

export const prospectsService = {
  getFieldSchema() {
    return apiClient.get<ProspectFieldSchema>(ENDPOINTS.prospects.fieldSchema);
  },

  async updateFieldSchema(input: UpdateProspectFieldSchemaInput) {
    const { updateOrgFormSchema } = await import('@/lib/forms/api');
    const { CRM_PROSPECT_CREATE_FORM_KEY } = await import(
      '@/lib/forms/crm-form-keys'
    );
    const schema = await updateOrgFormSchema(CRM_PROSPECT_CREATE_FORM_KEY, {
      fields: input.fields,
    });

    return {
      fields: schema.fields as ProspectFieldSchema['fields'],
      fieldKeysInUse: schema.fieldKeysInUse,
      updatedAt: new Date().toISOString(),
    } satisfies ProspectFieldSchema;
  },

  getProspects(query?: ProspectsQuery) {
    return apiClient.get<ProspectsPage>(
      `${ENDPOINTS.prospects.list}${buildProspectsQuery(query)}`,
    );
  },

  getFollowUps(query: FollowUpsQuery) {
    return apiClient.get<ProspectsPage>(
      `${ENDPOINTS.prospects.followups}${buildFollowUpsQuery(query)}`,
    );
  },

  getProspect(id: string) {
    return apiClient.get<Prospect>(ENDPOINTS.prospects.byId(id));
  },

  createProspect(input: CreateProspectInput) {
    return apiClient.post<Prospect>(ENDPOINTS.prospects.list, input);
  },

  createProspectStub(input: CreateProspectStubInput) {
    return apiClient.post<ProspectSearchResult>(ENDPOINTS.prospects.stub, input);
  },

  updateProspect(id: string, input: UpdateProspectInput) {
    return apiClient.patch<Prospect>(ENDPOINTS.prospects.byId(id), input);
  },

  getPipelineSummary(query?: PipelineSummaryQuery) {
    return apiClient.get<PipelineSummary>(
      `${ENDPOINTS.prospects.pipelineSummary}${buildPipelineSummaryQuery(query)}`,
    );
  },

  deleteProspect(id: string) {
    return apiClient.delete<void>(ENDPOINTS.prospects.byId(id));
  },

  searchProspects(q: string, limit = 10) {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return apiClient.get<ProspectSearchResult[]>(
      `${ENDPOINTS.prospects.search}?${params.toString()}`,
    );
  },

  createEngagement(prospectId: string, input: CreateProspectEngagementInput) {
    return apiClient.post<ProspectEngagement>(
      ENDPOINTS.prospects.engagements(prospectId),
      input,
    );
  },

  getEngagements(prospectId: string) {
    return apiClient.get<ProspectEngagement[]>(
      ENDPOINTS.prospects.engagements(prospectId),
    );
  },

  getCampaigns(prospectId: string) {
    return apiClient
      .get<ProspectCampaignList>(ENDPOINTS.prospects.campaigns(prospectId))
      .then(mapProspectCampaignListFromApi);
  },

  getDeleteRequests(query?: ProspectDeleteRequestsQuery) {
    return apiClient.get<ProspectDeleteRequest[]>(
      `${ENDPOINTS.prospects.deleteRequests}${buildDeleteRequestsQuery(query)}`,
    );
  },

  getPendingDeleteRequestCount() {
    return apiClient.get<number>(ENDPOINTS.prospects.deleteRequestPendingCount);
  },

  getDeleteRequestSummaryCounts() {
    return apiClient.get<ProspectDeleteRequestSummaryCounts>(
      ENDPOINTS.prospects.deleteRequestSummaryCount,
    );
  },

  createDeleteRequest(input: CreateProspectDeleteRequestInput) {
    return apiClient.post<ProspectDeleteRequest>(
      ENDPOINTS.prospects.deleteRequests,
      input,
    );
  },

  approveDeleteRequest(id: string) {
    return apiClient.patch<ProspectDeleteRequest>(
      ENDPOINTS.prospects.deleteRequestApprove(id),
      {},
    );
  },

  rejectDeleteRequest(id: string, input: RejectProspectDeleteRequestInput) {
    return apiClient.patch<ProspectDeleteRequest>(
      ENDPOINTS.prospects.deleteRequestReject(id),
      input,
    );
  },

  cancelDeleteRequest(id: string) {
    return apiClient.patch<ProspectDeleteRequest>(
      ENDPOINTS.prospects.deleteRequestCancel(id),
      {},
    );
  },

  previewImport(file: File, payload?: CrmImportPayload) {
    return apiClient.postFormData<CrmImportPreview>(
      ENDPOINTS.prospects.importPreview,
      buildImportFormData(file, payload),
    );
  },

  importRows(file: File, payload: CrmImportPayload) {
    return apiClient.postFormData<CrmImportResult>(
      ENDPOINTS.prospects.import,
      buildImportFormData(file, payload),
    );
  },
};
