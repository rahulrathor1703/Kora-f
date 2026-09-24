import type {
  FieldStoredValue,
  LocationComponent,
  LocationInputMode,
} from '@/lib/crm/location/types';
import type { FormFieldValidationType } from '@/lib/forms/form-field-validation.types';
import type { FollowUpRange } from '@/lib/crm/followups/types';

export type ProspectFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'date'
  | 'location'
  | 'section';

export interface ProspectFieldOption {
  value: string;
  label: string;
  color?: string;
  source?: 'platform' | 'org';
}

export interface ProspectFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: ProspectFieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  validationType?: FormFieldValidationType;
  sortOrder: number;
  showInTable: boolean;
  showInForm: boolean;
  filterable?: boolean;
  options?: ProspectFieldOption[];
  displayOptionsAsChips?: boolean;
  locationComponents?: LocationComponent[];
  locationInputMode?: LocationInputMode;
  sectionId?: string;
  system?: boolean;
  pipelineStage?: boolean;
  editableOnDetail?: boolean;
  formColSpan?: number;
  source?: 'platform' | 'org';
}

export interface ProspectFieldSchema {
  fields: ProspectFieldDefinition[];
  fieldKeysInUse?: string[];
  updatedAt: string;
}

export interface Prospect {
  id: string;
  fullName: string;
  email: string;
  values: Record<string, FieldStoredValue>;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectsPage {
  items: Prospect[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProspectsQuery {
  q?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string>;
  followUpRange?: FollowUpRange;
}

export interface PipelineSummaryQuery {
  followUpRange?: FollowUpRange;
}

export interface ProspectSearchResult {
  id: string;
  fullName: string;
  email: string;
}

export type UserCreatableProspectEngagementType =
  | 'call'
  | 'meeting'
  | 'email'
  | 'linkedin'
  | 'whatsapp';

export const USER_CREATABLE_ENGAGEMENT_TYPES: UserCreatableProspectEngagementType[] =
  ['call', 'email', 'meeting', 'linkedin', 'whatsapp'];

export type ProspectEngagementType =
  | UserCreatableProspectEngagementType
  | 'status_change';

export const PROSPECT_ENGAGEMENT_TYPES: ProspectEngagementType[] = [
  ...USER_CREATABLE_ENGAGEMENT_TYPES,
  'status_change',
];
export type ProspectEngagementOutcome =
  | 'positive'
  | 'neutral'
  | 'negative'
  | 'no-answer';

export interface CreateProspectEngagementInput {
  type: UserCreatableProspectEngagementType;
  discussion: string;
  outcome: ProspectEngagementOutcome;
  nextStep?: string;
}

export interface ProspectEngagement {
  id: string;
  prospectId: string;
  type: ProspectEngagementType;
  discussion: string;
  outcome: ProspectEngagementOutcome;
  nextStep: string | null;
  createdAt: string;
  createdByName: string;
  createdByEmail: string;
  fromStageValue: string | null;
  toStageValue: string | null;
  fromStageLabel: string | null;
  toStageLabel: string | null;
}

export interface CreateProspectInput {
  values: Record<string, FieldStoredValue>;
}

export interface CreateProspectStubInput {
  displayName: string;
}

export interface UpdateProspectFieldSchemaInput {
  fields: ProspectFieldDefinition[];
}

export interface UpdateProspectInput {
  values: Record<string, FieldStoredValue>;
}

export interface PipelineStageSummary {
  value: string;
  label: string;
  color?: string;
  count: number;
}

export interface PipelineSummary {
  stages: PipelineStageSummary[];
}

export type ProspectDeleteRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface ProspectDeleteRequest {
  id: string;
  prospectId: string | null;
  prospectFullName: string;
  prospectEmail: string;
  reason: string;
  status: ProspectDeleteRequestStatus;
  requestedByUserId: string;
  requestedByName: string;
  requestedByEmail: string;
  reviewedByUserId: string | null;
  reviewedByName: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProspectDeleteRequestInput {
  prospectId: string;
  reason: string;
}

export interface ProspectDeleteRequestsQuery {
  status?: ProspectDeleteRequestStatus;
  prospectId?: string;
}

export interface RejectProspectDeleteRequestInput {
  reviewNote?: string;
}

export interface ProspectDeleteRequestSummaryCounts {
  pendingReviewCount: number;
  myRaisedCount: number;
  myRaisedPendingCount: number;
}
