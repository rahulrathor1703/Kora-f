export interface PlatformTenantListItem {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  userCount: number;
  campaignCount: number;
  emailCampaignCount: number;
  mailboxCount: number;
  createdAt: string;
}

export interface PlatformTenantDetail extends PlatformTenantListItem {
  updatedAt: string;
}

export interface UpdatePlatformTenantInput {
  name?: string;
  status?: 'active' | 'suspended';
}

export interface PlatformTenantUser {
  id: string;
  email: string;
  username: string | null;
  roleId: string;
  roleName: string;
  hierarchyLevel: number;
  status: string;
  joinedAt: string;
}

export interface PlatformTenantInvitation {
  id: string;
  email: string;
  roleId: string;
  hierarchyLevel: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  role?: {
    name: string;
  };
  invitedBy?: {
    email: string;
  };
}
