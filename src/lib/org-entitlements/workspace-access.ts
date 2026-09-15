import type { OrgModule } from './types';

export const ORG_MODULE_NAV_ORDER: OrgModule[] = [
  'dashboard',
  'email',
  'crm',
  'website',
  'settings',
];

export const ORG_MODULE_DEFAULT_PATHS: Record<OrgModule, string> = {
  dashboard: '/',
  email: '/email/campaigns',
  crm: '/crm',
  website: '/website',
  settings: '/settings',
};

export function isOrgModuleEnabled(
  enabledModules: OrgModule[] | undefined,
  module: OrgModule,
): boolean {
  if (!enabledModules || enabledModules.length === 0) {
    return true;
  }

  return enabledModules.includes(module);
}

export function getFirstEnabledModulePath(
  enabledModules: OrgModule[] | undefined,
): string {
  for (const orgModule of ORG_MODULE_NAV_ORDER) {
    if (isOrgModuleEnabled(enabledModules, orgModule)) {
      return ORG_MODULE_DEFAULT_PATHS[orgModule];
    }
  }

  return ORG_MODULE_DEFAULT_PATHS.settings;
}

export function resolveOrgHomePath(
  enabledModules: OrgModule[] | undefined,
): string {
  if (isOrgModuleEnabled(enabledModules, 'dashboard')) {
    return ORG_MODULE_DEFAULT_PATHS.dashboard;
  }

  return getFirstEnabledModulePath(enabledModules);
}
