import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { EmailStepAttachment } from '@/lib/email/campaigns/attachment-types';

function buildUploadFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

export const emailAttachmentService = {
  listCampaignStepAttachments(campaignId: string, stepOrder: number) {
    return apiClient.get<EmailStepAttachment[]>(
      ENDPOINTS.emailAttachments.campaignStep(campaignId, stepOrder),
    );
  },

  uploadCampaignStepAttachment(
    campaignId: string,
    stepOrder: number,
    file: File,
  ) {
    return apiClient.postFormData<EmailStepAttachment>(
      ENDPOINTS.emailAttachments.campaignStep(campaignId, stepOrder),
      buildUploadFormData(file),
    );
  },

  copyTemplateAttachmentsToCampaignStep(
    campaignId: string,
    stepOrder: number,
    templateStepId: string,
  ) {
    return apiClient.post<EmailStepAttachment[]>(
      ENDPOINTS.emailAttachments.copyFromTemplate(
        campaignId,
        stepOrder,
        templateStepId,
      ),
    );
  },

  listTemplateStepAttachments(templateId: string, stepOrder: number) {
    return apiClient.get<EmailStepAttachment[]>(
      ENDPOINTS.emailAttachments.templateStep(templateId, stepOrder),
    );
  },

  uploadTemplateStepAttachment(
    templateId: string,
    stepOrder: number,
    file: File,
  ) {
    return apiClient.postFormData<EmailStepAttachment>(
      ENDPOINTS.emailAttachments.templateStep(templateId, stepOrder),
      buildUploadFormData(file),
    );
  },

  deleteAttachment(attachmentId: string) {
    return apiClient.delete<void>(ENDPOINTS.emailAttachments.byId(attachmentId));
  },
};
