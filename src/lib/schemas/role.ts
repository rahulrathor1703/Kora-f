import { z } from 'zod';

export const roleFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  permissionIds: z
    .array(z.string().uuid())
    .min(1, 'Select at least one permission'),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
