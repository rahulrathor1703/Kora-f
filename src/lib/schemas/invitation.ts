import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.email('Enter a valid email address'),
  roleId: z.string().uuid('Select a role'),
  hierarchyLevel: z.number().int().min(1).max(10),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export const acceptInviteSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens',
      ),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;
