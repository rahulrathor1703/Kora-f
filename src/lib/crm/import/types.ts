export interface CrmImportFieldDescriptor {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

export interface CrmImportRowError {
  row: number;
  key: string;
  message: string;
}

export interface CrmImportPreview {
  columns: string[];
  sampleRows: Record<string, string>[];
  rowCount: number;
  importableFields: CrmImportFieldDescriptor[];
  suggestedMapping: Record<string, string>;
  rowIssues?: CrmImportRowError[];
}

export interface CrmImportResult {
  created: number;
  failed: number;
  skipped?: number;
  errors: CrmImportRowError[];
}

export interface CrmImportPayload {
  fieldMapping: Record<string, string>;
}

export type CrmImportEntityType = 'prospect' | 'company';
