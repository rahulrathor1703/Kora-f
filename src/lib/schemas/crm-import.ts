import { z } from 'zod';

export const CRM_IMPORT_WIZARD_STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'mapping', label: 'Map fields' },
  { id: 'review', label: 'Review' },
] as const;

export const crmImportWizardSchema = z.object({
  fieldMapping: z.record(z.string(), z.string()),
});

export type CrmImportWizardFormValues = z.infer<typeof crmImportWizardSchema>;

export const CRM_IMPORT_WIZARD_DEFAULT_VALUES: CrmImportWizardFormValues = {
  fieldMapping: {},
};

export function buildCrmImportFieldMappingPayload(
  values: CrmImportWizardFormValues,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values.fieldMapping).filter(
      ([, column]) => column.trim().length > 0,
    ),
  );
}

export function validateRequiredFieldMappings(
  importableFields: Array<{ key: string; label: string; required: boolean; type: string }>,
  fieldMapping: Record<string, string>,
): string | null {
  const requiredRoots = new Set<string>();

  for (const field of importableFields) {
    if (!field.required) {
      continue;
    }

    if (field.type === 'location-component') {
      requiredRoots.add(field.key.split('.')[0] ?? field.key);
      continue;
    }

    if (!fieldMapping[field.key]?.trim()) {
      return `${field.label} must be mapped`;
    }
  }

  for (const rootKey of requiredRoots) {
    const hasMappedComponent = importableFields.some(
      (field) =>
        field.key.startsWith(`${rootKey}.`) && fieldMapping[field.key]?.trim(),
    );

    if (!hasMappedComponent) {
      const label =
        importableFields.find((field) => field.key.startsWith(`${rootKey}.`))
          ?.label ?? rootKey;
      return `${label} must be mapped`;
    }
  }

  return null;
}
