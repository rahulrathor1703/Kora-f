export type AbacPolicyEffect = 'allow' | 'deny';

export interface AbacHierarchyLevelCondition {
  min?: number;
  max?: number;
}

export interface AbacPolicyConditions {
  hierarchyLevel?: AbacHierarchyLevelCondition;
  roleSlugs?: string[];
  status?: 'active' | 'disabled';
}

export interface AbacPolicyAssignedUser {
  id: string;
  email: string;
  username: string | null;
}

export interface AbacPolicy {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  effect: AbacPolicyEffect;
  isEnabled: boolean;
  assignedUserCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AbacPolicyDetail {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  effect: AbacPolicyEffect;
  isEnabled: boolean;
  conditions: AbacPolicyConditions;
  assignedUsers: AbacPolicyAssignedUser[];
  createdAt: string;
  updatedAt: string;
}

export interface UserAbacPolicySummary {
  id: string;
  name: string;
  resource: string;
  action: string;
  effect: AbacPolicyEffect;
  isEnabled: boolean;
}

export interface CreateAbacPolicyInput {
  name: string;
  description?: string;
  resource: string;
  action: string;
  effect: AbacPolicyEffect;
  isEnabled?: boolean;
  conditions?: AbacPolicyConditions;
  userIds?: string[];
}

export interface UpdateAbacPolicyInput {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  effect?: AbacPolicyEffect;
  isEnabled?: boolean;
  conditions?: AbacPolicyConditions;
  userIds?: string[];
}

export interface AssignUserPoliciesInput {
  policyIds: string[];
}

export type BulkAssignAbacPoliciesMode = 'add' | 'replace';

export interface BulkAssignAbacPoliciesInput {
  policyIds: string[];
  userIds: string[];
  mode: BulkAssignAbacPoliciesMode;
}

export interface BulkAssignAbacPoliciesResult {
  mode: BulkAssignAbacPoliciesMode;
  affectedUsers: number;
  assignmentsCreated: number;
  assignmentsRemoved: number;
}
