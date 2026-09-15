import type {
  FieldStoredValue,
  LocationComponent,
  LocationInputMode,
} from '@/lib/crm/location/types';

export type CompanyConfigCategory = 'category' | 'location';

export type CompanyFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'number'
  | 'date'
  | 'company-category'
  | 'company-location'
  | 'location'
  | 'section';

export interface CompanyFieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface CompanyFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: CompanyFieldType;
  required?: boolean;
  sortOrder: number;
  showInTable: boolean;
  showInForm: boolean;
  filterable?: boolean;
  options?: CompanyFieldOption[];
  locationComponents?: LocationComponent[];
  locationInputMode?: LocationInputMode;
  sectionId?: string;
  system?: boolean;
  editableOnDetail?: boolean;
  formColSpan?: number;
}

export interface CompanyFieldSchema {
  fields: CompanyFieldDefinition[];
  fieldKeysInUse?: string[];
  updatedAt: string;
}

export interface UpdateCompanyFieldSchemaInput {
  fields: CompanyFieldDefinition[];
}

export const BROKER_NAME_FIELD_KEY = 'brokerName';

export interface CompanyConfigOption {
  id: string;
  category: CompanyConfigCategory;
  value: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyConfigOptionInput {
  category: CompanyConfigCategory;
  label: string;
  value?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCompanyConfigOptionInput {
  label?: string;
  value?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Company {
  id: string;
  brokerName: string;
  values: Record<string, FieldStoredValue>;
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesPage {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CompaniesQuery {
  q?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string>;
}

export interface CreateCompanyInput {
  brokerName: string;
  values: Record<string, FieldStoredValue>;
}

export interface UpdateCompanyInput {
  brokerName?: string;
  values?: Record<string, FieldStoredValue>;
}
