import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateRoleInput,
  PermissionsResponse,
  Role,
  RoleDetail,
  UpdateRoleInput,
} from '../types';

export const roleService = {
  getAll() {
    return apiClient.get<Role[]>(ENDPOINTS.roles.list);
  },

  getById(id: string) {
    return apiClient.get<RoleDetail>(ENDPOINTS.roles.byId(id));
  },

  getPermissions() {
    return apiClient.get<PermissionsResponse>(ENDPOINTS.permissions.list);
  },

  create(input: CreateRoleInput) {
    return apiClient.post<RoleDetail>(ENDPOINTS.roles.list, input);
  },

  update(id: string, input: UpdateRoleInput) {
    return apiClient.patch<RoleDetail>(ENDPOINTS.roles.byId(id), input);
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.roles.byId(id));
  },
};
