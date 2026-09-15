import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const registerSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(120, 'Organization name is too long'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Slug must be at least 3 characters')
    .max(64, 'Slug is too long')
    .regex(
      slugPattern,
      'Use lowercase letters, numbers, and hyphens only (e.g. acme-corp)',
    ),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]{3,30}$/,
      'Username must be 3–30 characters (letters, numbers, _ or -)',
    )
    .optional()
    .or(z.literal('')),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
