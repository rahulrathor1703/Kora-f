export const ORG_MODULES = ['dashboard', 'email', 'crm', 'website', 'settings'] as const;

export type OrgModule = (typeof ORG_MODULES)[number];

export type OrgLimitKey =
  | 'email.mailboxes'
  | 'email.campaigns'
  | 'crm.prospects'
  | 'crm.companies'
  | 'website.projects'
  | 'settings.members';

export type OrgLimitValue = number | null;

export type OrgLimitsMap = Partial<Record<OrgLimitKey, OrgLimitValue>>;

export interface OrgLimitUsage {
  effective: number | null;
  used: number;
  platformCap: number | null;
  orgLimit: number | null;
}

export interface OrgEntitlementsSnapshot {
  organizationId: string;
  enabledModules: OrgModule[];
  platformCaps: OrgLimitsMap;
  orgLimits: OrgLimitsMap;
  limits: Record<OrgLimitKey, OrgLimitUsage>;
}

export interface OrgLimitDefinition {
  key: OrgLimitKey;
  module: OrgModule;
  label: string;
}

export const ORG_LIMIT_DEFINITIONS: OrgLimitDefinition[] = [
  { key: 'email.mailboxes', module: 'email', label: 'Mailboxes' },
  { key: 'email.campaigns', module: 'email', label: 'Campaigns' },
  { key: 'crm.prospects', module: 'crm', label: 'Prospects' },
  { key: 'crm.companies', module: 'crm', label: 'Companies' },
  { key: 'website.projects', module: 'website', label: 'Projects' },
  { key: 'settings.members', module: 'settings', label: 'Team members' },
];

export const ORG_MODULE_LABELS: Record<OrgModule, string> = {
  dashboard: 'Dashboard',
  email: 'Email',
  crm: 'CRM',
  website: 'Website',
  settings: 'Settings',
};

export interface UpdatePlatformEntitlementsInput {
  enabledModules?: OrgModule[];
  platformCaps?: OrgLimitsMap;
}

export interface UpdateOrgLimitsInput {
  orgLimits: OrgLimitsMap;
}

export interface OrgLimitReachedErrorBody {
  code: 'ORG_LIMIT_REACHED';
  limitKey: OrgLimitKey;
  effectiveLimit: number;
  currentUsage: number;
  message: string;
}

export function isOrgLimitReachedBody(
  value: unknown,
): value is OrgLimitReachedErrorBody {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const body = value as OrgLimitReachedErrorBody;
  return body.code === 'ORG_LIMIT_REACHED' && typeof body.limitKey === 'string';
}

export function getLimitsForModule(
  module: OrgModule,
): OrgLimitDefinition[] {
  return ORG_LIMIT_DEFINITIONS.filter((definition) => definition.module === module);
}
