export type EmailTemplateType = 'single' | 'sequence';

export type EmailTemplateVisibility = 'private' | 'org';

export type EmailTemplateDelayMode = 'relative' | 'absolute';

export interface EmailTemplateStep {
  id: string;
  stepOrder: number;
  subject: string;
  body: string;
  delayMode: EmailTemplateDelayMode;
  delayDays: number;
  scheduledDate: string | null;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  type: EmailTemplateType;
  visibility: EmailTemplateVisibility;
  isActive: boolean;
  createdByUserId: string;
  steps: EmailTemplateStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateStepInput {
  stepOrder: number;
  subject: string;
  body: string;
  delayMode?: EmailTemplateDelayMode;
  delayDays?: number;
  scheduledDate?: string;
}

export interface CreateEmailTemplateInput {
  name: string;
  description?: string;
  type: EmailTemplateType;
  visibility?: EmailTemplateVisibility;
  isActive?: boolean;
  steps: CreateEmailTemplateStepInput[];
}

export interface UpdateEmailTemplateInput {
  name?: string;
  description?: string;
  visibility?: EmailTemplateVisibility;
  isActive?: boolean;
  steps?: CreateEmailTemplateStepInput[];
}

export interface ListEmailTemplatesOptions {
  type?: EmailTemplateType;
  includeInactive?: boolean;
}
