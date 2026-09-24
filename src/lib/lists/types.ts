export interface ManualListColumn {
  key: string;
  label: string;
}

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

export interface ManualListSummary {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManualListRow {
  id: string;
  rowIndex: number;
  values: Record<string, string>;
}

export interface ManualListDetail extends ManualListSummary {
  columns: ManualListColumn[];
  rows: ManualListRow[];
  stats: ListEngagementStats;
  campaigns: LinkedCampaignSummary[];
}

export interface CreateManualListInput {
  name: string;
  columns: Array<{ label: string }>;
  rows: Array<{ values: Record<string, string> }>;
  syncToProspects?: boolean;
  prospectFieldMapping?: ProspectFieldMapping;
}

export interface ManualListCreateResult extends ManualListDetail {
  prospectSync?: ProspectSyncResult;
}

export interface ProspectFieldMapping {
  emailColumnKey: string;
  nameColumnKey?: string;
}

export interface ProspectSyncResult {
  created: number;
  skipped: number;
  failed: number;
}

export interface CreateManualListRowInput {
  values: Record<string, string>;
}

export interface ManualListColumnMapping {
  listColumnKey: string;
  sourceColumn: string;
}

export interface ManualListAppendImportInput {
  columnMappings: ManualListColumnMapping[];
}

export interface ManualListAppendResult {
  list: ManualListSummary;
  importedCount: number;
  skippedCount: number;
  importedRowIds: string[];
}

export interface ManualListRowRemovalPreview {
  email: string | null;
  campaignImpacts: Array<{
    campaignId: string;
    campaignName: string;
    status: string;
    recipientId: string;
    contactDisposition: string;
  }>;
}

export interface ManualListRowRemovalResult {
  removed: boolean;
  campaignResults: Array<{
    campaignId: string;
    success: boolean;
    error?: string;
  }>;
}

export interface ManualListEnrollmentOptionsResult {
  options: Array<{
    campaignId: string;
    campaignName: string;
    status: string;
    requiresSchedule: boolean;
    canEnroll: boolean;
    alreadyEnrolled: boolean;
    reason?: string;
  }>;
}

export interface ManualListEnrollRowsInput {
  rowIds: string[];
  campaignIds: string[];
}

export interface ManualListEnrollRowsResult {
  results: Array<{
    campaignId: string;
    email: string;
    success: boolean;
    error?: string;
  }>;
  addedCount: number;
  skippedCount: number;
}
