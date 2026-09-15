export type EmailConfigCategory = 'campaign-type' | 'brand' | 'region';

export interface EmailConfigOption {
  id: string;
  category: EmailConfigCategory;
  value: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailConfigOptionInput {
  category: EmailConfigCategory;
  label: string;
  value?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateEmailConfigOptionInput {
  label?: string;
  value?: string;
  isActive?: boolean;
  sortOrder?: number;
}
