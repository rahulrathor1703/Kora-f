import { z } from 'zod';

const hierarchyLevelConditionSchema = z
  .object({
    min: z.number().int().min(1).max(10).optional(),
    max: z.number().int().min(1).max(10).optional(),
  })
  .optional();

const conditionsSchema = z
  .object({
    hierarchyLevel: hierarchyLevelConditionSchema,
    roleSlugs: z.array(z.string()).optional(),
    status: z.enum(['active', 'disabled']).optional(),
  })
  .optional();

export const abacPolicyFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  resource: z.string().min(1, 'Select a resource'),
  action: z.string().min(1, 'Select an action'),
  effect: z.enum(['allow', 'deny']),
  isEnabled: z.boolean(),
  conditions: conditionsSchema,
  userIds: z.array(z.string().uuid()),
});

export type AbacPolicyFormValues = z.infer<typeof abacPolicyFormSchema>;

export const bulkAssignAbacPoliciesSchema = z.object({
  policyIds: z.array(z.string().uuid()).min(1, 'Select at least one policy'),
  userIds: z.array(z.string().uuid()).min(1, 'Select at least one member'),
  mode: z.enum(['add', 'replace']),
});

export type BulkAssignAbacPoliciesFormValues = z.infer<
  typeof bulkAssignAbacPoliciesSchema
>;

export const ABAC_RESOURCES = [
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'prospects', label: 'Prospects' },
  { value: 'users', label: 'Users' },
  { value: 'settings', label: 'Settings' },
  { value: 'rbac', label: 'RBAC' },
  { value: 'abac', label: 'ABAC' },
  { value: 'forms', label: 'Forms' },
] as const;

export const ABAC_ACTIONS = [
  { value: 'read', label: 'Read' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'request-delete', label: 'Request delete' },
  { value: 'approve-delete', label: 'Approve delete' },
  { value: 'manage', label: 'Manage' },
  { value: 'invite', label: 'Invite' },
] as const;
