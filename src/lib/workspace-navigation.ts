import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { crmTabs, getCrmPageTitle } from '@/lib/crm/navigation';
import {
  emailPrimaryTabs,
  emailSecondaryTabs,
  getEmailPageTitle,
} from '@/lib/email/navigation';
import { getWebsitePageTitle, websiteTabs } from '@/lib/website/navigation';
import { getEmailConfigCategoryFromPathname } from '@/lib/email/settings-navigation';
import { getSettingsPageTitle } from '@/lib/settings-navigation';
import { resolveOrgHomePath } from '@/lib/org-entitlements/workspace-access';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';
import type { OrgModule } from '@/lib/org-entitlements/types';

export interface NavItem {
  label: string;
  href: string;
  icon: SvgIconComponent;
  children?: NavItem[];
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
  orgModule?: OrgModule;
  dividerBefore?: boolean;
}

export function hasNavPermission(
  item: Pick<NavItem, 'requiredPermission' | 'requiredAnyPermissions'>,
  permissions: string[],
  isSuperAdmin = false,
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  if (item.requiredAnyPermissions && item.requiredAnyPermissions.length > 0) {
    return item.requiredAnyPermissions.some((permission) =>
      permissions.includes(permission),
    );
  }

  if (!item.requiredPermission) {
    return true;
  }

  return permissions.includes(item.requiredPermission);
}

export function hasOrgModule(
  item: Pick<NavItem, 'orgModule'>,
  enabledModules: OrgModule[] | undefined,
): boolean {
  if (!item.orgModule) {
    return true;
  }

  if (!enabledModules || enabledModules.length === 0) {
    return true;
  }

  return enabledModules.includes(item.orgModule);
}

export function isActiveRoute(pathname: string, href: string, orgSlug: string): boolean {
  const relativePath = stripOrgPrefix(pathname, orgSlug);
  const targetPath = stripOrgPrefix(href, orgSlug);

  if (targetPath === '/') {
    return relativePath === '/';
  }

  return relativePath === targetPath || relativePath.startsWith(`${targetPath}/`);
}

function filterVisibleNavChildren(
  item: NavItem,
  permissions: string[],
  isSuperAdmin: boolean,
): NavItem[] | undefined {
  if (!item.children) {
    return undefined;
  }

  return item.children.filter((child) =>
    hasNavPermission(child, permissions, isSuperAdmin),
  );
}

export function mapVisibleWorkspaceNavItems(
  items: NavItem[],
  enabledModules: OrgModule[] | undefined,
  permissions: string[],
  isSuperAdmin: boolean,
): NavItem[] {
  return items
    .filter((item) => hasOrgModule(item, enabledModules))
    .filter((item) => hasNavPermission(item, permissions, isSuperAdmin))
    .map((item) => {
      const children = filterVisibleNavChildren(item, permissions, isSuperAdmin);

      return children ? { ...item, children } : item;
    })
    .filter((item) => !item.children || item.children.length > 0);
}

export function getSingleVisibleMainModule(mainItems: NavItem[]): NavItem | null {
  if (mainItems.length !== 1) {
    return null;
  }

  return mainItems[0] ?? null;
}

export function shouldFlattenSingleModuleNav(mainItems: NavItem[]): boolean {
  const singleModule = getSingleVisibleMainModule(mainItems);
  return Boolean(singleModule?.children?.length);
}

export function resolveWorkspaceHomePath(
  enabledModules: OrgModule[] | undefined,
  permissions: string[],
  isSuperAdmin: boolean,
): string {
  const mainItems = mapVisibleWorkspaceNavItems(
    workspaceNavItems,
    enabledModules,
    permissions,
    isSuperAdmin,
  );
  const bottomItems = mapVisibleWorkspaceNavItems(
    [workspaceSettingsNavItem],
    enabledModules,
    permissions,
    isSuperAdmin,
  );
  const singleMainModule = getSingleVisibleMainModule(mainItems);

  if (singleMainModule?.children?.length) {
    return singleMainModule.children[0].href;
  }

  if (singleMainModule) {
    return singleMainModule.href;
  }

  if (mainItems.length === 0 && bottomItems.length === 1) {
    return bottomItems[0].href;
  }

  return resolveOrgHomePath(enabledModules);
}

export const workspaceNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: DashboardOutlinedIcon,
    orgModule: 'dashboard',
  },
  {
    label: 'Email',
    href: '/email',
    icon: EmailOutlinedIcon,
    orgModule: 'email',
    children: [
      ...emailPrimaryTabs.map((tab) => ({
        label: tab.label,
        href: tab.href,
        icon: tab.icon,
        requiredPermission: tab.requiredPermission,
        requiredAnyPermissions: tab.requiredAnyPermissions,
      })),
      ...emailSecondaryTabs.map((tab) => ({
        label: tab.label,
        href: tab.href,
        icon: tab.icon,
        requiredPermission: tab.requiredPermission,
        requiredAnyPermissions: tab.requiredAnyPermissions,
      })),
    ],
  },
  {
    label: 'CRM',
    href: '/crm',
    icon: ContactsOutlinedIcon,
    orgModule: 'crm',
    children: crmTabs.map((tab) => ({
      label: tab.label,
      href: tab.href,
      icon: tab.icon,
      requiredPermission: tab.requiredPermission,
      requiredAnyPermissions: tab.requiredAnyPermissions,
    })),
  },
  {
    label: 'Website',
    href: '/website',
    icon: LanguageOutlinedIcon,
    orgModule: 'website',
    children: websiteTabs.map((tab) => ({
      label: tab.label,
      href: tab.href,
      icon: tab.icon,
      requiredPermission: tab.requiredPermission,
    })),
  },
];

export const workspaceSettingsNavItem: NavItem = {
  label: 'Settings',
  href: '/settings',
  icon: SettingsOutlinedIcon,
  orgModule: 'settings',
};

/** @deprecated Use workspaceSettingsNavItem — settings lives in the header, not the sidebar. */
export const workspaceBottomNavItems: NavItem[] = [workspaceSettingsNavItem];

export function getPageTitle(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  const relativePath = orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;

  const settingsTitle = getSettingsPageTitle(relativePath);
  if (settingsTitle) {
    return settingsTitle;
  }

  const emailConfigCategory = getEmailConfigCategoryFromPathname(pathname);
  if (emailConfigCategory) {
    return 'Email Configuration';
  }

  const emailTitle = getEmailPageTitle(pathname);
  if (emailTitle) {
    return emailTitle;
  }

  const crmTitle = getCrmPageTitle(pathname);
  if (crmTitle) {
    return crmTitle;
  }

  const websiteTitle = getWebsitePageTitle(pathname);
  if (websiteTitle) {
    return websiteTitle;
  }

  if (relativePath === '/') {
    return 'Dashboard';
  }

  return 'Workspace';
}
