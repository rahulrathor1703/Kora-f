import { CRM_EMPTY_CELL_LABEL } from '@/lib/crm/fields/crm-empty-cell';
import { isIsoDateString } from './inferColumns';

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return CRM_EMPTY_CELL_LABEL;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string' && isIsoDateString(value)) {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return String(value);
}
