import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  AbacPolicy,
  AbacPolicyDetail,
  AssignUserPoliciesInput,
  BulkAssignAbacPoliciesInput,
  BulkAssignAbacPoliciesResult,
  CreateAbacPolicyInput,
  UpdateAbacPolicyInput,
  UserAbacPolicySummary,
} from '../types';

export const abacPolicyService = {
  getAll() {
    return apiClient.get<AbacPolicy[]>(ENDPOINTS.abacPolicies.list);
  },

  getById(id: string) {
    return apiClient.get<AbacPolicyDetail>(ENDPOINTS.abacPolicies.byId(id));
  },

  create(input: CreateAbacPolicyInput) {
    return apiClient.post<AbacPolicyDetail>(ENDPOINTS.abacPolicies.list, input);
  },

  update(id: string, input: UpdateAbacPolicyInput) {
    return apiClient.patch<AbacPolicyDetail>(
      ENDPOINTS.abacPolicies.byId(id),
      input,
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.abacPolicies.byId(id));
  },

  getForUser(userId: string) {
    return apiClient.get<UserAbacPolicySummary[]>(
      ENDPOINTS.users.abacPolicies(userId),
    );
  },

  assignToUser(userId: string, input: AssignUserPoliciesInput) {
    return apiClient.put<UserAbacPolicySummary[]>(
      ENDPOINTS.users.abacPolicies(userId),
      input,
    );
  },

  bulkAssign(input: BulkAssignAbacPoliciesInput) {
    return apiClient.post<BulkAssignAbacPoliciesResult>(
      ENDPOINTS.abacPolicies.bulkAssign,
      input,
    );
  },
};
