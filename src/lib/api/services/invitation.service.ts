import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  AcceptInvitationInput,
  AcceptInvitationResponse,
  CreateInvitationInput,
  CreateInvitationResponse,
  Invitation,
  InvitationValidation,
} from '../types';

export const invitationService = {
  getAllPending() {
    return apiClient.get<Invitation[]>(ENDPOINTS.invitations.list);
  },

  create(input: CreateInvitationInput) {
    return apiClient.post<CreateInvitationResponse>(
      ENDPOINTS.invitations.list,
      input,
    );
  },

  revoke(id: string) {
    return apiClient.delete<void>(ENDPOINTS.invitations.byId(id));
  },

  validateToken(token: string) {
    return apiClient.get<InvitationValidation>(
      ENDPOINTS.invitations.validate(token),
    );
  },

  accept(token: string, input: AcceptInvitationInput) {
    return apiClient.post<AcceptInvitationResponse>(
      ENDPOINTS.invitations.accept(token),
      input,
    );
  },
};
