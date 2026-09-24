import type {
  AdditionalFieldMapping,
  ContactListFieldMapping,
  SuggestedFieldMapping,
} from '@/lib/email/lists/types';

interface ColumnMappingRowFormValues {
  sourceColumn: string;
  fieldName: string;
  isEmail: boolean;
}

export type FieldMappingFormShape = ContactListFieldMapping;

export interface UsedColumnExclude {
  rowIndex?: number;
  field?: 'email' | 'primary' | 'secondary';
}

const RESERVED_KEY_ALIASES: Record<
  string,
  'firstName' | 'lastName' | 'company' | 'phone'
> = {
  firstname: 'firstName',
  lastname: 'lastName',
  company: 'company',
  phone: 'phone',
};

export function normalizeFieldKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function mergeColumnValues(
  primary: string | undefined,
  secondary: string | undefined,
): string {
  const parts = [primary, secondary]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return parts.join(' ');
}

export function readMergedValue(
  row: Record<string, string>,
  sourceColumn: string,
  secondarySourceColumn?: string,
): string {
  const primary = (row[sourceColumn] ?? '').trim();
  const secondary = secondarySourceColumn
    ? (row[secondarySourceColumn] ?? '').trim()
    : '';

  return mergeColumnValues(primary, secondary);
}

export function collectUsedSourceColumns(
  mapping: FieldMappingFormShape,
  exclude?: UsedColumnExclude,
): Set<string> {
  const used = new Set<string>();

  if (mapping.email.trim()) {
    used.add(mapping.email);
  }

  mapping.additionalFields.forEach((field, index) => {
    const isExcludedRow = exclude?.rowIndex === index;

    if (
      field.sourceColumn.trim() &&
      !(isExcludedRow && exclude?.field === 'primary')
    ) {
      used.add(field.sourceColumn);
    }

    if (
      field.secondarySourceColumn?.trim() &&
      !(isExcludedRow && exclude?.field === 'secondary')
    ) {
      used.add(field.secondarySourceColumn);
    }
  });

  if (exclude?.field === 'email' && mapping.email.trim()) {
    used.delete(mapping.email);
  }

  return used;
}

export function buildSuggestedAdditionalFields(
  suggestedMapping: SuggestedFieldMapping,
): AdditionalFieldMapping[] {
  const suggestions: Array<{ key: string; sourceColumn?: string }> = [
    { key: 'firstName', sourceColumn: suggestedMapping.firstName },
    { key: 'lastName', sourceColumn: suggestedMapping.lastName },
    { key: 'company', sourceColumn: suggestedMapping.company },
    { key: 'phone', sourceColumn: suggestedMapping.phone },
  ];

  return suggestions
    .filter(
      (suggestion): suggestion is { key: string; sourceColumn: string } =>
        Boolean(suggestion.sourceColumn?.trim()),
    )
    .map((suggestion) => ({
      key: suggestion.key,
      sourceColumn: suggestion.sourceColumn,
      secondarySourceColumn: '',
    }));
}

export function buildMappedPreviewRow(
  sampleRow: Record<string, string>,
  mapping: FieldMappingFormShape,
): Record<string, string> {
  const result: Record<string, string> = {
    Email: sampleRow[mapping.email]?.trim() || '—',
  };

  for (const field of mapping.additionalFields) {
    if (!field.key.trim() || !field.sourceColumn.trim()) {
      continue;
    }

    const value = readMergedValue(
      sampleRow,
      field.sourceColumn,
      field.secondarySourceColumn?.trim() || undefined,
    );

    result[field.key.trim()] = value || '—';
  }

  return result;
}

export function formatSourceColumnLabel(
  sourceColumn: string,
  secondarySourceColumn?: string,
): string {
  if (secondarySourceColumn?.trim()) {
    return `${sourceColumn} + ${secondarySourceColumn}`;
  }

  return sourceColumn;
}

export function isReservedStandardKey(key: string): boolean {
  const normalized = normalizeFieldKey(key);
  return normalized in RESERVED_KEY_ALIASES;
}

export function getReservedStandardKey(
  key: string,
): 'firstName' | 'lastName' | 'company' | 'phone' | null {
  const normalized = normalizeFieldKey(key);
  return RESERVED_KEY_ALIASES[normalized] ?? null;
}

export const STANDARD_CONTACT_FIELDS = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone' },
] as const;

export type StandardContactFieldKey =
  (typeof STANDARD_CONTACT_FIELDS)[number]['key'];

const SAMPLE_VALUE_MAX_LENGTH = 32;

function truncateSampleValue(value: string): string {
  if (value.length <= SAMPLE_VALUE_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, SAMPLE_VALUE_MAX_LENGTH - 1)}…`;
}

export function getColumnSampleValues(
  sampleRows: Record<string, string>[],
  column: string,
  limit = 2,
): string[] {
  const samples: string[] = [];

  for (const row of sampleRows) {
    const value = (row[column] ?? '').trim();
    if (!value || samples.includes(value)) {
      continue;
    }

    samples.push(value);
    if (samples.length >= limit) {
      break;
    }
  }

  return samples;
}

export function formatColumnOptionLabel(
  column: string,
  sampleRows: Record<string, string>[],
): string {
  const [firstSample] = getColumnSampleValues(sampleRows, column, 1);
  if (!firstSample) {
    return column;
  }

  return `${column} · ${truncateSampleValue(firstSample)}`;
}

export function formatSamplePreview(
  sampleRows: Record<string, string>[],
  column: string,
  limit = 2,
): string {
  const samples = getColumnSampleValues(sampleRows, column, limit);
  if (samples.length === 0) {
    return '';
  }

  return samples.map(truncateSampleValue).join(', ');
}

export function findAdditionalFieldIndex(
  additionalFields: AdditionalFieldMapping[],
  key: string,
): number {
  const normalizedKey = normalizeFieldKey(key);

  return additionalFields.findIndex(
    (field) => normalizeFieldKey(field.key) === normalizedKey,
  );
}

export function upsertStandardField(
  additionalFields: AdditionalFieldMapping[],
  key: StandardContactFieldKey,
  sourceColumn: string,
): AdditionalFieldMapping[] {
  const trimmedColumn = sourceColumn.trim();
  const existingIndex = findAdditionalFieldIndex(additionalFields, key);

  if (!trimmedColumn) {
    if (existingIndex === -1) {
      return additionalFields;
    }

    return additionalFields.filter((_, index) => index !== existingIndex);
  }

  const nextField: AdditionalFieldMapping = {
    key,
    sourceColumn: trimmedColumn,
    secondarySourceColumn: '',
  };

  if (existingIndex === -1) {
    return [...additionalFields, nextField];
  }

  return additionalFields.map((field, index) =>
    index === existingIndex ? nextField : field,
  );
}

export function removeStandardField(
  additionalFields: AdditionalFieldMapping[],
  key: StandardContactFieldKey,
): AdditionalFieldMapping[] {
  const existingIndex = findAdditionalFieldIndex(additionalFields, key);
  if (existingIndex === -1) {
    return additionalFields;
  }

  return additionalFields.filter((_, index) => index !== existingIndex);
}

export function getStandardFieldSourceColumn(
  additionalFields: AdditionalFieldMapping[],
  key: StandardContactFieldKey,
): string {
  const existingIndex = findAdditionalFieldIndex(additionalFields, key);
  if (existingIndex === -1) {
    return '';
  }

  return additionalFields[existingIndex]?.sourceColumn ?? '';
}

export function isStandardContactFieldKey(key: string): key is StandardContactFieldKey {
  return STANDARD_CONTACT_FIELDS.some((field) => field.key === key);
}

export function getCustomAdditionalFieldIndices(
  additionalFields: AdditionalFieldMapping[],
): number[] {
  return additionalFields.reduce<number[]>((indices, field, index) => {
    if (!isStandardContactFieldKey(field.key)) {
      indices.push(index);
    }

    return indices;
  }, []);
}

export function countAutoMatchedFields(
  suggestedMapping: SuggestedFieldMapping,
): number {
  return Object.values(suggestedMapping).filter((value) => value?.trim()).length;
}

export function getUnmappedColumns(
  columns: string[],
  mapping: FieldMappingFormShape,
): string[] {
  const used = collectUsedSourceColumns(mapping);
  return columns.filter((column) => !used.has(column));
}

const SUGGESTED_FIELD_KEYS: Record<
  keyof SuggestedFieldMapping,
  string
> = {
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  company: 'company',
  phone: 'phone',
};

export function headerToFieldName(header: string): string {
  const trimmed = header.trim();
  if (!trimmed) {
    return 'field';
  }

  const words = trimmed.split(/[\s_-]+/).filter(Boolean);
  if (words.length === 1) {
    return words[0]!.charAt(0).toLowerCase() + words[0]!.slice(1);
  }

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function suggestFieldNameForColumn(
  sourceColumn: string,
  suggestedMapping: SuggestedFieldMapping,
): string {
  for (const [field, column] of Object.entries(suggestedMapping) as Array<
    [keyof SuggestedFieldMapping, string | undefined]
  >) {
    if (column === sourceColumn && field !== 'email') {
      return SUGGESTED_FIELD_KEYS[field];
    }
  }

  return headerToFieldName(sourceColumn);
}

export function buildColumnMappingsFromPreview(
  preview: Pick<
    { columns: string[]; suggestedMapping: SuggestedFieldMapping },
    'columns' | 'suggestedMapping'
  >,
): ColumnMappingRowFormValues[] {
  const emailColumn =
    preview.suggestedMapping.email ??
    preview.columns.find(
      (column) => normalizeFieldKey(column) === 'email',
    ) ??
    preview.columns[0] ??
    '';

  return preview.columns.map((sourceColumn) => ({
    sourceColumn,
    fieldName:
      sourceColumn === emailColumn
        ? 'email'
        : suggestFieldNameForColumn(sourceColumn, preview.suggestedMapping),
    isEmail: sourceColumn === emailColumn,
  }));
}

export function buildColumnMappingsFromFieldMapping(
  columns: string[],
  mapping: ContactListFieldMapping,
): ColumnMappingRowFormValues[] {
  const mappedColumns = new Set([
    mapping.email,
    ...mapping.additionalFields.map((field) => field.sourceColumn),
  ]);

  const rows: ColumnMappingRowFormValues[] = columns
    .filter((column) => mappedColumns.has(column))
    .map((sourceColumn) => {
      if (sourceColumn === mapping.email) {
        return {
          sourceColumn,
          fieldName: 'email',
          isEmail: true,
        };
      }

      const additionalField = mapping.additionalFields.find(
        (field) => field.sourceColumn === sourceColumn,
      );

      return {
        sourceColumn,
        fieldName: additionalField?.key ?? headerToFieldName(sourceColumn),
        isEmail: false,
      };
    });

  if (!rows.some((row) => row.isEmail) && mapping.email) {
    rows.unshift({
      sourceColumn: mapping.email,
      fieldName: 'email',
      isEmail: true,
    });
  }

  return rows;
}

export function buildFieldMappingFromColumnMappings(
  columnMappings: ColumnMappingRowFormValues[],
): ContactListFieldMapping {
  const emailRow = columnMappings.find((row) => row.isEmail);

  if (!emailRow) {
    return { email: '', additionalFields: [] };
  }

  return {
    email: emailRow.sourceColumn,
    additionalFields: columnMappings
      .filter((row) => !row.isEmail)
      .map((row) => ({
        key: row.fieldName.trim(),
        sourceColumn: row.sourceColumn,
      })),
  };
}

export function buildPreviewRowsFromColumnMappings(
  sampleRows: Record<string, string>[],
  columnMappings: ColumnMappingRowFormValues[],
): Record<string, string>[] {
  return sampleRows.map((row) => {
    const mappedRow: Record<string, string> = {};

    for (const mapping of columnMappings) {
      mappedRow[mapping.fieldName.trim()] =
        (row[mapping.sourceColumn] ?? '').trim() || '—';
    }

    return mappedRow;
  });
}

export function getPreviewColumnsFromColumnMappings(
  columnMappings: ColumnMappingRowFormValues[],
): string[] {
  return columnMappings.map((row) => row.fieldName.trim());
}
