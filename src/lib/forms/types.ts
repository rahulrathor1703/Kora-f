import type {
  LocationComponent,
  LocationInputMode,
} from '@/lib/crm/location/types';
import type { FormFieldValidationType } from '@/lib/forms/form-field-validation.types';

export type { FormFieldValidationType };

export type FormModule = 'crm' | 'email' | 'settings' | 'website';

export type FormType = 'single' | 'wizard' | 'inline';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'password'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'location'
  | 'company-category'
  | 'company-location'
  | 'section'
  | 'rich-text'
  | 'role-picker'
  | 'permission-matrix'
  | 'prospect-search'
  | 'list-picker'
  | 'mailbox-picker'
  | 'color';

export interface FormFieldOption {
  value: string;
  label: string;
  color?: string;
  /** Present on resolved pipeline stage options from the API. */
  source?: 'platform' | 'org';
}

export type FormTableColumnType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date';

export interface FormTableColumnDefinition {
  id: string;
  key: string;
  label: string;
  type: FormTableColumnType;
  required: boolean;
  sortOrder: number;
  system?: boolean;
  source?: 'platform' | 'org';
}

export interface FormFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  validationType?: FormFieldValidationType;
  sortOrder: number;
  showInTable?: boolean;
  showInForm?: boolean;
  filterable?: boolean;
  options?: FormFieldOption[];
  /** Read-only CRM display: render option values as chips (select / multiselect). */
  displayOptionsAsChips?: boolean;
  locationComponents?: LocationComponent[];
  locationInputMode?: LocationInputMode;
  sectionId?: string;
  system?: boolean;
  pipelineStage?: boolean;
  editableOnDetail?: boolean;
  formColSpan?: number;
  placeholder?: string;
  helpText?: string;
  source?: 'platform' | 'org';
  /** Org custom fields: prevents layout moves and property edits until unlocked. */
  layoutLocked?: boolean;
  /** Section fields only: `main` = outer block; `sub` = inner subsection header. */
  sectionTier?: 'main' | 'sub';
}

export interface FormWizardStepDefinition {
  id: string;
  label: string;
  sortOrder: number;
  widget?: string;
  fieldKeys?: string[];
}

export interface FormLayoutConfig {
  columns?: number;
}

export interface ResolvedFormSchema {
  formKey: string;
  fields: FormFieldDefinition[];
  tableColumns?: FormTableColumnDefinition[];
  steps?: FormWizardStepDefinition[] | null;
  layout?: FormLayoutConfig | null;
  version?: number;
  fieldKeysInUse?: string[];
  publishedVersion?: number;
  hasUnpublishedChanges?: boolean;
  publishedFields?: FormFieldDefinition[];
  publishedTableColumns?: FormTableColumnDefinition[];
  publishedLayout?: FormLayoutConfig | null;
  publishedSteps?: FormWizardStepDefinition[] | null;
}

export interface FormRegistryListItem {
  key: string;
  module: FormModule;
  label: string;
  formType: FormType;
  supportsOrgExtensions: boolean;
  supportsTableColumns?: boolean;
  hideFromOrgRegistry?: boolean;
  customWidgets?: string[];
  hasPlatformSchema: boolean;
  hasOrgExtensions: boolean;
}

export interface FormRegistryListResponse {
  forms: FormRegistryListItem[];
}

export interface UpdateFormSchemaInput {
  fields: FormFieldDefinition[];
  tableColumns?: FormTableColumnDefinition[];
  steps?: FormWizardStepDefinition[] | null;
  layout?: FormLayoutConfig | null;
  version?: number;
}

export type FormEditorMode = 'platform' | 'org';
