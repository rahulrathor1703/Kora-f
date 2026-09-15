export interface Invitation {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  hierarchyLevel: number;
  status: string;
  invitedByEmail: string;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationValidation {
  email: string;
  roleName: string;
  hierarchyLevel: number;
  expiresAt: string;
}

export interface CreateInvitationInput {
  email: string;
  roleId: string;
  hierarchyLevel: number;
}

export interface CreateInvitationResponse {
  invitation: Invitation;
  inviteUrl: string;
}

export interface AcceptInvitationInput {
  username: string;
  password: string;
}

export interface AcceptInvitationResponse {
  user: import('./auth.types').AuthUser;
}
