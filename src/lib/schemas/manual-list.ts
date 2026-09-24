import { z } from 'zod';

export const manualListColumnSchema = z.object({
  label: z.string().trim().min(1, 'Column header is required').max(64),
});

export const manualListRowSchema = z.object({
  values: z.record(z.string(), z.string()),
});

export const manualListBuilderSchema = z
  .object({
    name: z.string().trim().min(1, 'List name is required').max(255),
    columns: z
      .array(manualListColumnSchema)
      .min(1, 'Add at least one column')
      .max(50, 'Maximum 50 columns allowed'),
    rows: z.array(manualListRowSchema).max(500, 'Maximum 500 rows allowed'),
  })
  .superRefine((values, context) => {
    const labels = new Set<string>();

    values.columns.forEach((column, index) => {
      const normalized = column.label.trim().toLowerCase();
      if (!normalized) {
        return;
      }

      if (labels.has(normalized)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Column headers must be unique',
          path: ['columns', index, 'label'],
        });
        return;
      }

      labels.add(normalized);
    });
  });

export type ManualListBuilderFormValues = z.infer<
  typeof manualListBuilderSchema
>;

export const MANUAL_LIST_BUILDER_DEFAULT_VALUES: ManualListBuilderFormValues = {
  name: '',
  columns: [{ label: 'Email' }, { label: 'First name' }, { label: 'Last name' }],
  rows: [],
};
