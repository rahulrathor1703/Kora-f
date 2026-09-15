import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateEmailTemplateInput,
  EmailTemplate,
  ListEmailTemplatesOptions,
  UpdateEmailTemplateInput,
} from '../types/email-template.types';

function buildListQuery(options?: ListEmailTemplatesOptions): string {
  const params = new URLSearchParams();

  if (options?.type) {
    params.set('type', options.type);
  }

  if (options?.includeInactive) {
    params.set('includeInactive', 'true');
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const emailTemplateService = {
  getAll(options?: ListEmailTemplatesOptions) {
    return apiClient.get<EmailTemplate[]>(
      `${ENDPOINTS.emailTemplates.list}${buildListQuery(options)}`,
    );
  },

  getById(id: string) {
    return apiClient.get<EmailTemplate>(ENDPOINTS.emailTemplates.byId(id));
  },

  create(input: CreateEmailTemplateInput) {
    return apiClient.post<EmailTemplate>(ENDPOINTS.emailTemplates.list, input);
  },

  update(id: string, input: UpdateEmailTemplateInput) {
    return apiClient.patch<EmailTemplate>(
      ENDPOINTS.emailTemplates.byId(id),
      input,
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.emailTemplates.byId(id));
  },
};
