import type { CrmImportEntityType } from '@/lib/crm/import/types';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

type ImportField =
  | ProspectFieldDefinition
  | CompanyFieldDefinition;

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function getImportableHeaders(fields: ImportField[]): string[] {
  const headers: string[] = [];

  for (const field of fields) {
    if (field.type === 'section') {
      continue;
    }

    if (field.type === 'location') {
      for (const component of field.locationComponents ?? []) {
        headers.push(`${field.label} (${component})`);
      }
      continue;
    }

    headers.push(field.label);
  }

  return headers;
}

function getExampleValue(field: ImportField, component?: string): string {
  if (field.type === 'location' && component) {
    if (component === 'city') {
      return 'San Francisco';
    }
    if (component === 'state') {
      return 'California';
    }
    if (component === 'country') {
      return 'United States';
    }
    return 'North America';
  }

  switch (field.key) {
    case 'fullName':
      return 'Jane Doe';
    case 'email':
      return 'jane@example.com';
    case 'brokerName':
      return 'Acme Brokers';
    case 'phone':
      return '+1 555 0100';
    default:
      break;
  }

  if (field.type === 'select' && field.options?.[0]) {
    return field.options[0].label;
  }

  if (field.type === 'multiselect' && field.options?.length) {
    return field.options
      .slice(0, 2)
      .map((option) => option.label)
      .join(', ');
  }

  if (field.type === 'number') {
    return '100';
  }

  if (field.type === 'date') {
    return '2026-01-15';
  }

  if (field.type === 'email') {
    return 'contact@example.com';
  }

  return '';
}

function getExampleRow(fields: ImportField[]): string[] {
  const values: string[] = [];

  for (const field of fields) {
    if (field.type === 'section') {
      continue;
    }

    if (field.type === 'location') {
      for (const component of field.locationComponents ?? []) {
        values.push(getExampleValue(field, component));
      }
      continue;
    }

    values.push(getExampleValue(field));
  }

  return values;
}

export function buildCrmImportTemplateCsv(
  entityType: CrmImportEntityType,
  fields: ImportField[],
): string {
  void entityType;

  const headers = getImportableHeaders(fields);
  const exampleRow = getExampleRow(fields);

  return [
    headers.map(escapeCsvCell).join(','),
    exampleRow.map(escapeCsvCell).join(','),
  ].join('\n');
}

export function downloadCrmImportTemplate(
  entityType: CrmImportEntityType,
  fields: ImportField[],
): void {
  const csv = buildCrmImportTemplateCsv(entityType, fields);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    entityType === 'prospect'
      ? 'prospects-import-template.csv'
      : 'companies-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function applySuggestedFieldMapping(
  suggestedMapping: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(suggestedMapping).filter(
      ([, column]) => column.trim().length > 0,
    ),
  );
}

export function collectUsedSourceColumns(
  fieldMapping: Record<string, string>,
  currentColumn: string,
): Set<string> {
  const used = new Set<string>();

  for (const [, column] of Object.entries(fieldMapping)) {
    if (column.trim() && column !== currentColumn) {
      used.add(column);
    }
  }
  return used;
}
