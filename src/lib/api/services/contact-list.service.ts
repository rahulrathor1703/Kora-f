import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  ContactList,
  ContactListImportInput,
  ContactListImportPreview,
  ContactListImportResult,
} from '@/lib/email/lists/types';
import type {
  ContactListAppendImportInput,
  ContactListAppendResult,
  ContactListDetail,
  ContactListEnrollMembersInput,
  ContactListEnrollMembersResult,
  ContactListEnrollmentOptionsResult,
  ContactListMemberRemovalPreview,
  ContactListMemberRemovalResult,
  ContactListMembersPage,
  ContactListMembersQuery,
  CreateContactListMemberInput,
  ContactListMember,
  ListCampaignRemovalAction,
} from '@/lib/email/lists/detail-types';

function buildImportFormData(
  file: File,
  payload?: ContactListImportInput | ContactListAppendImportInput,
): FormData {
  const formData = new FormData();
  formData.append('file', file);

  if (payload) {
    formData.append('payload', JSON.stringify(payload));
  }

  return formData;
}

function buildMembersQuery(query: ContactListMembersQuery = {}): string {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.emailStatus) {
    params.set('emailStatus', query.emailStatus);
  }

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const contactListService = {
  getAll() {
    return apiClient.get<ContactList[]>(ENDPOINTS.contactLists.list);
  },

  getById(id: string) {
    return apiClient.get<ContactListDetail>(ENDPOINTS.contactLists.byId(id));
  },

  getMembers(id: string, query?: ContactListMembersQuery) {
    return apiClient.get<ContactListMembersPage>(
      `${ENDPOINTS.contactLists.members(id)}${buildMembersQuery(query)}`,
    );
  },

  addMember(id: string, input: CreateContactListMemberInput) {
    return apiClient.post<ContactListMember>(
      ENDPOINTS.contactLists.members(id),
      input,
    );
  },

  previewImport(file: File) {
    return apiClient.postFormData<ContactListImportPreview>(
      ENDPOINTS.contactLists.importPreview,
      buildImportFormData(file),
    );
  },

  previewAppendImport(id: string, file: File) {
    return apiClient.postFormData<ContactListImportPreview>(
      ENDPOINTS.contactLists.appendImportPreview(id),
      buildImportFormData(file),
    );
  },

  importList(file: File, input: ContactListImportInput) {
    return apiClient.postFormData<ContactListImportResult>(
      ENDPOINTS.contactLists.import,
      buildImportFormData(file, input),
    );
  },

  appendImport(id: string, file: File, input: ContactListAppendImportInput) {
    return apiClient.postFormData<ContactListAppendResult>(
      ENDPOINTS.contactLists.appendImport(id),
      buildImportFormData(file, input),
    );
  },

  getMemberRemovalPreview(listId: string, memberId: string) {
    return apiClient.get<ContactListMemberRemovalPreview>(
      ENDPOINTS.contactLists.memberRemovalPreview(listId, memberId),
    );
  },

  removeMember(
    listId: string,
    memberId: string,
    campaignActions?: ListCampaignRemovalAction[],
  ) {
    return apiClient.delete<ContactListMemberRemovalResult>(
      ENDPOINTS.contactLists.memberById(listId, memberId),
      { campaignActions: campaignActions ?? [] },
    );
  },

  getEnrollmentOptions(listId: string, emails: string[]) {
    const params = new URLSearchParams();
    if (emails.length > 0) {
      params.set('emails', emails.join(','));
    }

    const query = params.toString();
    return apiClient.get<ContactListEnrollmentOptionsResult>(
      `${ENDPOINTS.contactLists.enrollmentOptions(listId)}${query ? `?${query}` : ''}`,
    );
  },

  enrollMembersInCampaigns(
    listId: string,
    input: ContactListEnrollMembersInput,
  ) {
    return apiClient.post<ContactListEnrollMembersResult>(
      ENDPOINTS.contactLists.enrollInCampaigns(listId),
      input,
    );
  },
};
