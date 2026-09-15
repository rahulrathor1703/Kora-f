import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { ContactListImportPreview } from '@/lib/email/lists/types';
import type {
  CreateManualListInput,
  CreateManualListRowInput,
  ManualListAppendImportInput,
  ManualListAppendResult,
  ManualListCreateResult,
  ManualListDetail,
  ManualListEnrollRowsInput,
  ManualListEnrollRowsResult,
  ManualListEnrollmentOptionsResult,
  ManualListRow,
  ManualListRowRemovalPreview,
  ManualListRowRemovalResult,
  ManualListSummary,
} from '@/lib/lists/types';
import type { ListCampaignRemovalAction } from '@/lib/email/lists/detail-types';

function buildImportFormData(
  file: File,
  payload?: ManualListAppendImportInput,
): FormData {
  const formData = new FormData();
  formData.append('file', file);

  if (payload) {
    formData.append('payload', JSON.stringify(payload));
  }

  return formData;
}

export const manualListService = {
  getAll() {
    return apiClient.get<ManualListSummary[]>(ENDPOINTS.manualLists.list);
  },

  getById(id: string) {
    return apiClient.get<ManualListDetail>(ENDPOINTS.manualLists.byId(id));
  },

  create(input: CreateManualListInput) {
    return apiClient.post<ManualListCreateResult>(
      ENDPOINTS.manualLists.create,
      input,
    );
  },

  addRow(id: string, input: CreateManualListRowInput) {
    return apiClient.post<ManualListRow>(ENDPOINTS.manualLists.rows(id), input);
  },

  previewAppendImport(id: string, file: File) {
    return apiClient.postFormData<ContactListImportPreview>(
      ENDPOINTS.manualLists.appendImportPreview(id),
      buildImportFormData(file),
    );
  },

  appendImport(id: string, file: File, input: ManualListAppendImportInput) {
    return apiClient.postFormData<ManualListAppendResult>(
      ENDPOINTS.manualLists.appendImport(id),
      buildImportFormData(file, input),
    );
  },

  getRowRemovalPreview(listId: string, rowId: string) {
    return apiClient.get<ManualListRowRemovalPreview>(
      ENDPOINTS.manualLists.rowRemovalPreview(listId, rowId),
    );
  },

  removeRow(
    listId: string,
    rowId: string,
    campaignActions?: ListCampaignRemovalAction[],
  ) {
    return apiClient.delete<ManualListRowRemovalResult>(
      ENDPOINTS.manualLists.rowById(listId, rowId),
      { campaignActions: campaignActions ?? [] },
    );
  },

  getEnrollmentOptions(listId: string, rowIds: string[]) {
    const params = new URLSearchParams();
    if (rowIds.length > 0) {
      params.set('rowIds', rowIds.join(','));
    }

    const query = params.toString();
    return apiClient.get<ManualListEnrollmentOptionsResult>(
      `${ENDPOINTS.manualLists.enrollmentOptions(listId)}${query ? `?${query}` : ''}`,
    );
  },

  enrollRowsInCampaigns(listId: string, input: ManualListEnrollRowsInput) {
    return apiClient.post<ManualListEnrollRowsResult>(
      ENDPOINTS.manualLists.enrollInCampaigns(listId),
      input,
    );
  },
};
