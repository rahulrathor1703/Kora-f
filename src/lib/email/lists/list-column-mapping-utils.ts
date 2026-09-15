import type { ContactListFieldMapping } from '@/lib/email/lists/types';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import type {
  ListColumnMappingTarget,
  SchemaColumnMappingRowFormValues,
} from '@/lib/schemas/list-column-mapping';

function normalizeMatchValue(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function autoMatchSourceColumn(
  target: ListColumnMappingTarget,
  fileColumns: string[],
): string {
  const normalizedKey = normalizeMatchValue(target.key);
  const normalizedLabel = normalizeMatchValue(target.label);

  const matched = fileColumns.find((fileColumn) => {
    const normalizedFileColumn = normalizeMatchValue(fileColumn);
    return (
      normalizedFileColumn === normalizedKey ||
      normalizedFileColumn === normalizedLabel
    );
  });

  return matched ?? '';
}

export function buildMappingsFromTableColumns(
  tableColumns: FormTableColumnDefinition[] | ListColumnMappingTarget[],
  fileColumns: string[],
): SchemaColumnMappingRowFormValues[] {
  return tableColumns.map((column) => ({
    targetColumnKey: column.key,
    sourceColumn: autoMatchSourceColumn(column, fileColumns),
  }));
}

export function buildFieldMappingFromTableColumnMappings(
  tableColumns: FormTableColumnDefinition[] | ListColumnMappingTarget[],
  mappings: SchemaColumnMappingRowFormValues[],
): ContactListFieldMapping {
  const emailColumn = tableColumns.find(
    (column) => 'type' in column && column.type === 'email',
  );
  const emailKey = emailColumn?.key ?? 'email';
  const emailMapping = mappings.find(
    (mapping) => mapping.targetColumnKey === emailKey,
  );

  return {
    email: emailMapping?.sourceColumn.trim() ?? '',
    additionalFields: mappings
      .filter(
        (mapping) =>
          mapping.targetColumnKey !== emailKey && mapping.sourceColumn.trim(),
      )
      .map((mapping) => ({
        key: mapping.targetColumnKey,
        sourceColumn: mapping.sourceColumn.trim(),
      })),
  };
}

export function buildPreviewRowsFromTableMappings(
  sampleRows: Record<string, string>[],
  mappings: SchemaColumnMappingRowFormValues[],
  tableColumns: FormTableColumnDefinition[] | ListColumnMappingTarget[],
): Record<string, string>[] {
  const labelByKey = new Map(
    tableColumns.map((column) => [column.key, column.label]),
  );

  return sampleRows.map((row) => {
    const previewRow: Record<string, string> = {};

    for (const mapping of mappings) {
      const sourceColumn = mapping.sourceColumn.trim();
      if (!sourceColumn) {
        continue;
      }

      const label = labelByKey.get(mapping.targetColumnKey) ?? mapping.targetColumnKey;
      previewRow[label] = (row[sourceColumn] ?? '').trim();
    }

    return previewRow;
  });
}

export function getPreviewColumnsFromTableMappings(
  mappings: SchemaColumnMappingRowFormValues[],
  tableColumns: FormTableColumnDefinition[] | ListColumnMappingTarget[],
): string[] {
  const labelByKey = new Map(
    tableColumns.map((column) => [column.key, column.label]),
  );

  return mappings
    .filter((mapping) => mapping.sourceColumn.trim())
    .map(
      (mapping) =>
        labelByKey.get(mapping.targetColumnKey) ?? mapping.targetColumnKey,
    );
}

export function countAutoMatchedTableColumns(
  mappings: SchemaColumnMappingRowFormValues[],
): number {
  return mappings.filter((mapping) => mapping.sourceColumn.trim()).length;
}
