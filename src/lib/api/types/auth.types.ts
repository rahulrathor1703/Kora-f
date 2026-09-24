import type { OrgLimitKey, OrgModule } from '@/lib/org-entitlements/types';

export interface AuthUserRole {
  id: string;
  name: string;
  slug: string;
}

export interface AuthUserOrganization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  enabledModules: OrgModule[];
  limits: Record<
    OrgLimitKey,
    {
      effective: number | null;
      used: number;
    }
  >;
}

export type UserRole = 'superadmin' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  username: string | null;
  hierarchyLevel: number;
  status: 'active' | 'disabled';
  onboardingStep: number;
  permissions: string[];
  roles: AuthUserRole[];
  organizationId: string | null;
  organization: AuthUserOrganization | null;
}

/** Compatibility alias for ported MarketNiti components */
export function getSessionOrganization(user: AuthUser | null | undefined) {
  return user?.organization ?? null;
}

export function isPlatformOwner(
  user: { role?: UserRole } | null | undefined,
): boolean {
  return user?.role === 'superadmin';
}

/** @deprecated Use isPlatformOwner — platform owner is not an assignable org role. */
export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return isPlatformOwner(user);
}

export function hasPermission(
  user: Pick<AuthUser, 'role' | 'permissions'> | null | undefined,
  permission: string,
): boolean {
  if (isPlatformOwner(user)) {
    return true;
  }

  return user?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(
  user: Pick<AuthUser, 'role' | 'permissions'> | null | undefined,
  permissions: string[],
): boolean {
  if (isPlatformOwner(user)) {
    return true;
  }

  return permissions.some((permission) =>
    user?.permissions.includes(permission),
  );
}
