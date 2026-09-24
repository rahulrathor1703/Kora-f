export interface ContactList {
  id: string;
  name: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedFieldMapping {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
}

export interface ContactListImportPreview {
  columns: string[];
  sampleRows: Record<string, string>[];
  suggestedMapping: SuggestedFieldMapping;
  rowCount: number;
}

export interface AdditionalFieldMapping {
  key: string;
  sourceColumn: string;
  secondarySourceColumn?: string;
}

export interface ContactListFieldMapping {
  email: string;
  additionalFields: AdditionalFieldMapping[];
}

export interface ProspectSyncResult {
  created: number;
  skipped: number;
  failed: number;
}

export interface ProspectFieldMapping {
  emailColumnKey: string;
  nameColumnKey?: string;
}

export interface ContactListImportInput {
  name: string;
  fieldMapping: ContactListFieldMapping;
  syncToProspects?: boolean;
}

export interface ContactListImportResult {
  list: ContactList;
  importedCount: number;
  skippedCount: number;
  prospectSync?: ProspectSyncResult;
}
