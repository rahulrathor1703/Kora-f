import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateMailboxInput,
  DomainDnsCheckResult,
  MailboxCampaignsResponse,
  MailboxStatus,
  MailboxTestSendResult,
  SenderMailbox,
  SenderMailboxDetail,
  UpdateMailboxInput,
} from '@/lib/email/mailbox-types';

export const mailboxService = {
  getAll() {
    return apiClient.get<SenderMailbox[]>(ENDPOINTS.mailboxes.list);
  },

  getById(id: string) {
    return apiClient.get<SenderMailboxDetail>(ENDPOINTS.mailboxes.byId(id));
  },

  getCampaigns(id: string) {
    return apiClient.get<MailboxCampaignsResponse>(ENDPOINTS.mailboxes.campaigns(id));
  },

  getOAuthAvailability() {
    return apiClient.get<{ google: boolean; microsoft: boolean }>(
      ENDPOINTS.mailboxes.oauthAvailability,
    );
  },

  checkDomainDns(email: string) {
    const query = new URLSearchParams({ email: email.trim() }).toString();
    return apiClient.get<DomainDnsCheckResult>(
      `${ENDPOINTS.mailboxes.domainDns}?${query}`,
    );
  },

  create(input: CreateMailboxInput) {
    return apiClient.post<SenderMailbox>(ENDPOINTS.mailboxes.list, input);
  },

  update(id: string, input: UpdateMailboxInput) {
    return apiClient.patch<SenderMailbox>(ENDPOINTS.mailboxes.byId(id), input);
  },

  updateStatus(id: string, status: MailboxStatus) {
    return apiClient.patch<SenderMailbox>(ENDPOINTS.mailboxes.status(id), {
      status,
    });
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.mailboxes.byId(id));
  },

  sendTestEmail(id: string, to: string) {
    return apiClient.post<MailboxTestSendResult>(ENDPOINTS.mailboxes.testSend(id), {
      to: to.trim(),
    });
  },
};
