import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateEmailCampaignInput,
  EmailCampaign,
  ScheduleEmailCampaignInput,
  UpdateEmailCampaignAudienceInput,
  UpdateEmailCampaignInput,
  UpdateEmailCampaignStatusInput,
  PauseEmailCampaignInput,
  PauseCampaignMailboxSenderInput,
  StopCampaignMailboxSenderInput,
  ResumeEmailCampaignInput,
  CreateEmailCampaignMailboxSenderInput,
  UpdateCampaignMailboxSenderInput,
  CampaignDeleteRequest,
  CampaignDeleteRequestsQuery,
  CampaignDeleteRequestSummaryCounts,
  CreateCampaignDeleteRequestInput,
  RejectCampaignDeleteRequestInput,
} from '@/lib/email/campaigns/types';
import type {
  CampaignDailyActivityResponse,
  CampaignTrackingHealth,
  CampaignTrackingStatus,
  EmailCampaignProgress,
  EmailCampaignRecipient,
  SyncTrackingResult,
  UpdateEmailCampaignRecipientInput,
} from '@/lib/email/campaigns/progress-types';
import type {
  CampaignRecipientDetail,
  CampaignRecipientsQuery,
  PaginatedCampaignRecipients,
  AddCampaignRecipientInput,
} from '@/lib/email/campaigns/recipient-types';
import { mapCampaignRecipientsPageFromApi } from '@/lib/email/campaigns/recipient-mapper';
import type {
  CampaignAudienceQuery,
  PaginatedCampaignAudience,
} from '@/lib/email/campaigns/audience-types';
import type {
  CampaignEventsQuery,
  PaginatedCampaignEvents,
} from '@/lib/email/campaigns/event-types';
import type { EmailCampaignListMetricsRecord } from '@/lib/email/campaigns/list-metrics-types';
import type { MergeFieldCatalog } from '@/lib/email/campaigns/merge-field-catalog';

function buildDeleteRequestsQuery(query: CampaignDeleteRequestsQuery = {}) {
  const params = new URLSearchParams();

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.campaignId) {
    params.set('campaignId', query.campaignId);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return suffix;
}

export const emailCampaignService = {
  getAll() {
    return apiClient.get<EmailCampaign[]>(ENDPOINTS.emailCampaigns.list);
  },

  getMergeFieldCatalog() {
    return apiClient.get<MergeFieldCatalog>(
      ENDPOINTS.emailCampaigns.mergeFieldCatalog,
    );
  },

  getMetricsSummary() {
    return apiClient.get<EmailCampaignListMetricsRecord[]>(
      ENDPOINTS.emailCampaigns.metricsSummary,
    );
  },

  getById(id: string) {
    return apiClient.get<EmailCampaign>(ENDPOINTS.emailCampaigns.byId(id));
  },

  getProgress(id: string) {
    return apiClient.get<EmailCampaignProgress>(
      ENDPOINTS.emailCampaigns.progress(id),
    );
  },

  getRecipients(id: string, query: CampaignRecipientsQuery = {}) {
    const params = new URLSearchParams();

    if (query.search) {
      params.set('search', query.search);
    }

    if (query.status) {
      params.set('status', query.status);
    }

    if (query.disposition) {
      params.set('disposition', query.disposition);
    }

    if (query.page) {
      params.set('page', String(query.page));
    }

    if (query.limit) {
      params.set('limit', String(query.limit));
    }

    const suffix = params.size > 0 ? `?${params.toString()}` : '';

    return apiClient
      .get<PaginatedCampaignRecipients>(
        `${ENDPOINTS.emailCampaigns.recipients(id)}${suffix}`,
      )
      .then(mapCampaignRecipientsPageFromApi);
  },

  getRecipient(campaignId: string, recipientId: string) {
    return apiClient.get<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.recipient(campaignId, recipientId),
    );
  },

  getEvents(campaignId: string, query: CampaignEventsQuery = {}) {
    const params = new URLSearchParams();

    if (query.search) {
      params.set('search', query.search);
    }

    if (query.eventType) {
      params.set('eventType', query.eventType);
    }

    if (query.recipientId) {
      params.set('recipientId', query.recipientId);
    }

    if (query.stepOrder) {
      params.set('stepOrder', String(query.stepOrder));
    }

    if (query.page) {
      params.set('page', String(query.page));
    }

    if (query.limit) {
      params.set('limit', String(query.limit));
    }

    const suffix = params.size > 0 ? `?${params.toString()}` : '';

    return apiClient.get<PaginatedCampaignEvents>(
      `${ENDPOINTS.emailCampaigns.events(campaignId)}${suffix}`,
    );
  },

  getRecipientEvents(
    campaignId: string,
    recipientId: string,
    page = 1,
    limit = 100,
  ) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    return apiClient.get<PaginatedCampaignEvents>(
      `${ENDPOINTS.emailCampaigns.recipientEvents(campaignId, recipientId)}?${params.toString()}`,
    );
  },

  updateRecipient(
    campaignId: string,
    recipientId: string,
    input: UpdateEmailCampaignRecipientInput,
  ) {
    return apiClient.patch<EmailCampaignRecipient>(
      ENDPOINTS.emailCampaigns.recipient(campaignId, recipientId),
      input,
    );
  },

  getAudienceRecipients(query: CampaignAudienceQuery = {}) {
    const params = new URLSearchParams();

    if (query.campaignId) {
      params.set('campaignId', query.campaignId);
    }

    if (query.disposition) {
      params.set('disposition', query.disposition);
    }

    if (query.search) {
      params.set('search', query.search);
    }

    if (query.page) {
      params.set('page', String(query.page));
    }

    if (query.limit) {
      params.set('limit', String(query.limit));
    }

    const suffix = params.size > 0 ? `?${params.toString()}` : '';

    return apiClient.get<PaginatedCampaignAudience>(
      `${ENDPOINTS.emailCampaigns.audienceRecipients}${suffix}`,
    );
  },

  excludeRecipient(campaignId: string, recipientId: string) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.excludeRecipient(campaignId, recipientId),
    );
  },

  includeRecipient(campaignId: string, recipientId: string) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.includeRecipient(campaignId, recipientId),
    );
  },

  pauseRecipient(
    campaignId: string,
    recipientId: string,
    input: { pausedUntil: string },
  ) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.pauseRecipient(campaignId, recipientId),
      input,
    );
  },

  stopRecipient(campaignId: string, recipientId: string) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.stopRecipient(campaignId, recipientId),
    );
  },

  resumeRecipient(campaignId: string, recipientId: string) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.resumeRecipient(campaignId, recipientId),
    );
  },

  excludeRecipientGlobally(campaignId: string, recipientId: string) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.excludeRecipientGlobally(campaignId, recipientId),
    );
  },

  addRecipient(campaignId: string, input: AddCampaignRecipientInput) {
    return apiClient.post<CampaignRecipientDetail>(
      ENDPOINTS.emailCampaigns.recipients(campaignId),
      input,
    );
  },

  create(input: CreateEmailCampaignInput) {
    return apiClient.post<EmailCampaign>(ENDPOINTS.emailCampaigns.list, input);
  },

  update(id: string, input: UpdateEmailCampaignInput) {
    return apiClient.patch<EmailCampaign>(
      ENDPOINTS.emailCampaigns.byId(id),
      input,
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.emailCampaigns.delete(id));
  },

  getDeleteRequests(query?: CampaignDeleteRequestsQuery) {
    return apiClient.get<CampaignDeleteRequest[]>(
      `${ENDPOINTS.emailCampaigns.deleteRequests}${buildDeleteRequestsQuery(query)}`,
    );
  },

  getPendingDeleteRequestCount() {
    return apiClient.get<number>(
      ENDPOINTS.emailCampaigns.deleteRequestPendingCount,
    );
  },

  getDeleteRequestSummaryCounts() {
    return apiClient.get<CampaignDeleteRequestSummaryCounts>(
      ENDPOINTS.emailCampaigns.deleteRequestSummaryCount,
    );
  },

  createDeleteRequest(input: CreateCampaignDeleteRequestInput) {
    return apiClient.post<CampaignDeleteRequest>(
      ENDPOINTS.emailCampaigns.deleteRequests,
      input,
    );
  },

  approveDeleteRequest(id: string) {
    return apiClient.patch<CampaignDeleteRequest>(
      ENDPOINTS.emailCampaigns.deleteRequestApprove(id),
      {},
    );
  },

  rejectDeleteRequest(id: string, input: RejectCampaignDeleteRequestInput) {
    return apiClient.patch<CampaignDeleteRequest>(
      ENDPOINTS.emailCampaigns.deleteRequestReject(id),
      input,
    );
  },

  cancelDeleteRequest(id: string) {
    return apiClient.patch<CampaignDeleteRequest>(
      ENDPOINTS.emailCampaigns.deleteRequestCancel(id),
      {},
    );
  },

  updateAudience(id: string, input: UpdateEmailCampaignAudienceInput) {
    return apiClient.patch<EmailCampaign>(
      ENDPOINTS.emailCampaigns.byId(id),
      input,
    );
  },

  schedule(id: string, input: ScheduleEmailCampaignInput) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.schedule(id),
      input,
    );
  },

  updateStatus(id: string, input: UpdateEmailCampaignStatusInput) {
    return apiClient.patch<EmailCampaign>(
      ENDPOINTS.emailCampaigns.status(id),
      input,
    );
  },

  pauseCampaign(id: string, input: PauseEmailCampaignInput) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.pause(id),
      input,
    );
  },

  stopCampaign(id: string) {
    return apiClient.post<EmailCampaign>(ENDPOINTS.emailCampaigns.stop(id));
  },

  resumeCampaign(id: string, input?: ResumeEmailCampaignInput) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.resume(id),
      input,
    );
  },

  addCampaignMailboxSender(
    campaignId: string,
    input: CreateEmailCampaignMailboxSenderInput,
  ) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.mailboxSenders(campaignId),
      input,
    );
  },

  updateCampaignMailboxSender(
    campaignId: string,
    senderId: string,
    input: UpdateCampaignMailboxSenderInput,
  ) {
    return apiClient.patch<EmailCampaign>(
      ENDPOINTS.emailCampaigns.mailboxSender(campaignId, senderId),
      input,
    );
  },

  pauseCampaignMailboxSender(
    campaignId: string,
    senderId: string,
    input?: PauseCampaignMailboxSenderInput,
  ) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.pauseMailboxSender(campaignId, senderId),
      input,
    );
  },

  stopCampaignMailboxSender(
    campaignId: string,
    senderId: string,
    input?: StopCampaignMailboxSenderInput,
  ) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.stopMailboxSender(campaignId, senderId),
      input,
    );
  },

  resumeCampaignMailboxSender(campaignId: string, senderId: string) {
    return apiClient.post<EmailCampaign>(
      ENDPOINTS.emailCampaigns.resumeMailboxSender(campaignId, senderId),
    );
  },

  syncTracking() {
    return apiClient.post<SyncTrackingResult>(
      ENDPOINTS.emailCampaigns.syncTracking,
    );
  },

  getDailyEvents(campaignId: string) {
    return apiClient.get<CampaignDailyActivityResponse>(
      ENDPOINTS.emailCampaigns.dailyEvents(campaignId),
    );
  },

  getTrackingHealth(campaignId: string) {
    return apiClient.get<CampaignTrackingHealth>(
      ENDPOINTS.emailCampaigns.trackingHealth(campaignId),
    );
  },

  getTrackingStatus() {
    return apiClient.get<CampaignTrackingStatus>(
      ENDPOINTS.emailCampaigns.trackingStatus,
    );
  },
};
