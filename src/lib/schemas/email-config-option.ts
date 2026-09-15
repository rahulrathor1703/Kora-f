import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const emailConfigOptionFormSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(120),
  value: z
    .string()
    .trim()
    .max(64)
    .refine((value) => value === '' || slugPattern.test(value), {
      message: 'Use lowercase letters, numbers, and hyphens only',
    }),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type EmailConfigOptionFormValues = z.infer<
  typeof emailConfigOptionFormSchema
>;

export function slugifyLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
