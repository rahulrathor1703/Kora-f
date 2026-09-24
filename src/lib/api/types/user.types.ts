export interface TeamMember {
  id: string;
  email: string;
  username: string | null;
  roleId: string | null;
  roleName: string | null;
  hierarchyLevel: number;
  status: 'active' | 'disabled';
  joinedAt: string;
}

export interface UpdateTeamMemberInput {
  roleId?: string;
  hierarchyLevel?: number;
}

export interface UpdateTeamMemberStatusInput {
  status: 'active' | 'disabled';
}
