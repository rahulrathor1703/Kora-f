import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  TeamMember,
  UpdateTeamMemberInput,
  UpdateTeamMemberStatusInput,
} from '../types';

export const userService = {
  getAll() {
    return apiClient.get<TeamMember[]>(ENDPOINTS.users.list);
  },

  update(id: string, input: UpdateTeamMemberInput) {
    return apiClient.patch<TeamMember>(ENDPOINTS.users.byId(id), input);
  },

  updateStatus(id: string, input: UpdateTeamMemberStatusInput) {
    return apiClient.patch<TeamMember>(ENDPOINTS.users.status(id), input);
  },
};
