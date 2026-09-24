export const LEAD_STATUS_FIELD_KEY = 'leadStatus';
export const PIPELINE_STAGE_FIELD_KEY = LEAD_STATUS_FIELD_KEY;
export const PROTECTED_PIPELINE_STAGE_VALUE = 'new';
export const PIPELINE_COLUMN_PAGE_SIZE = 50;

export function getPipelineColumnId(stageValue: string): string {
  return `column-${stageValue}`;
}

export function parsePipelineColumnId(columnId: string): string | null {
  return columnId.startsWith('column-') ? columnId.slice(7) : null;
}
