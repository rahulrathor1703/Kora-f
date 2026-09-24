import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItem {
  label: string;
  href: string;
  icon: SvgIconComponent;
}

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export const platformNavItems: NavItem[] = [
  {
    label: 'Organizations',
    href: '/platform/tenants',
    icon: AdminPanelSettingsOutlinedIcon,
  },
  {
    label: 'Forms',
    href: '/platform/forms',
    icon: DynamicFormOutlinedIcon,
  },
  {
    label: 'Audit logs',
    href: '/platform/audit-logs',
    icon: HistoryOutlinedIcon,
  },
  {
    label: 'Sign-in OAuth',
    href: '/platform/auth-oauth',
    icon: LoginOutlinedIcon,
  },
];

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/platform/tenants/') && pathname !== '/platform/tenants') {
    return 'Organization';
  }

  if (pathname.startsWith('/platform/tenants')) {
    return 'Organizations';
  }

  if (pathname.startsWith('/platform')) {
    return 'Platform';
  }

  const exact = platformNavItems.find((item) => item.href === pathname);
  if (exact) {
    return exact.label;
  }

  const nested = platformNavItems.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  );
  return nested?.label ?? 'Platform';
}

export function getPageDescription(pathname: string): string | null {
  if (pathname.startsWith('/platform/tenants/') && pathname !== '/platform/tenants') {
    return 'Manage organization access and module limits.';
  }

  if (pathname.startsWith('/platform/tenants')) {
    return 'Review registered organization admins across the Markos platform.';
  }

  if (pathname.startsWith('/platform/forms')) {
    return 'Manage platform-wide form baselines and field layouts.';
  }

  if (pathname.startsWith('/platform/audit-logs')) {
    return 'Cross-tenant audit activity with optional organization filtering.';
  }

  if (pathname.startsWith('/platform/auth-oauth')) {
    return 'Configure Google and Apple sign-in for the platform login and signup pages.';
  }

  if (pathname.startsWith('/platform')) {
    return 'Manage platform-wide settings and organizations.';
  }

  return null;
}
