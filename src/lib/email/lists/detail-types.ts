export interface ListEngagementStats {
  totalContacts: number;
  eligible: number;
  sent: number;
  replied: number;
}

export interface LinkedCampaignSummary {
  id: string;
  name: string;
  status: string;
  audienceCount: number;
  createdAt: string;
}

export interface ContactListFieldDefinition {
  key: string;
  label: string;
}

export interface ContactListFieldSchema {
  email: ContactListFieldDefinition;
  fields: ContactListFieldDefinition[];
}

export type ListEmailStatus =
  | 'not_contacted'
  | 'sent'
  | 'replied'
  | 'bounced';

export interface ContactListDetail {
  id: string;
  name: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
  fieldSchema: ContactListFieldSchema;
  stats: ListEngagementStats;
  campaigns: LinkedCampaignSummary[];
}

export interface ContactListMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
  customFields: Record<string, string>;
  emailStatus: ListEmailStatus;
  createdAt: string;
}

export interface ContactListMembersPage {
  items: ContactListMember[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateContactListMemberInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  customFields?: Record<string, string>;
}

export interface ContactListMembersQuery {
  search?: string;
  emailStatus?: ListEmailStatus;
  page?: number;
  pageSize?: number;
}

export interface ContactListAppendImportInput {
  fieldMapping: {
    email: string;
    additionalFields: Array<{
      key: string;
      sourceColumn: string;
      secondarySourceColumn?: string;
    }>;
  };
}

export interface ContactListAppendResult {
  list: {
    id: string;
    name: string;
    contactCount: number;
    createdAt: string;
    updatedAt: string;
  };
  importedCount: number;
  skippedCount: number;
  importedEmails: string[];
}

export interface ListCampaignRemovalImpact {
  campaignId: string;
  campaignName: string;
  status: string;
  recipientId: string;
  contactDisposition: string;
}

export interface ListCampaignRemovalAction {
  campaignId: string;
  action: 'stop' | 'exclude_globally';
}

export interface ContactListMemberRemovalPreview {
  email: string;
  campaignImpacts: ListCampaignRemovalImpact[];
}

export interface ContactListMemberRemovalResult {
  removed: boolean;
  campaignResults: Array<{
    campaignId: string;
    success: boolean;
    error?: string;
  }>;
}

export interface ListCampaignEnrollmentOption {
  campaignId: string;
  campaignName: string;
  status: string;
  requiresSchedule: boolean;
  canEnroll: boolean;
  alreadyEnrolled: boolean;
  reason?: string;
}

export interface ContactListEnrollmentOptionsResult {
  options: ListCampaignEnrollmentOption[];
}

export interface ContactListEnrollMembersInput {
  emails: string[];
  campaignIds: string[];
}

export interface ContactListEnrollMembersResult {
  results: Array<{
    campaignId: string;
    email: string;
    success: boolean;
    error?: string;
  }>;
  addedCount: number;
  skippedCount: number;
}
