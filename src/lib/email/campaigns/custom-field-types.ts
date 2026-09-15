export type CampaignCustomFieldType = 'select' | 'text';

export interface CampaignCustomFieldOption {
  id: string;
  label: string;
  value: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CampaignCustomFieldDefinition {
  id: string;
  label: string;
  key: string;
  type: CampaignCustomFieldType;
  isActive: boolean;
  sortOrder: number;
  options: CampaignCustomFieldOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignCustomFieldDefinitionInput {
  label: string;
  type: CampaignCustomFieldType;
}

export interface CreateCampaignCustomFieldOptionInput {
  label: string;
  value?: string;
}

export type CampaignCustomFieldValues = Record<string, string>;
