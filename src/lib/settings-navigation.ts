import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export type SettingsSectionId = 'preferences' | 'team' | 'access';

export interface SettingsNavItem {
  label: string;
  href: string;
  description: string;
  icon: SvgIconComponent;
  section: SettingsSectionId;
  requiredPermission?: string;
  platformOwnerOnly?: boolean;
}

export interface SettingsSection {
  id: SettingsSectionId;
  title: string;
  description: string;
}

export const settingsSections: SettingsSection[] = [
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Appearance and account settings for your workspace.',
  },
  {
    id: 'team',
    title: 'Team',
    description: 'Members and collaboration for your workspace.',
  },
  {
    id: 'access',
    title: 'Access control',
    description: 'Roles and permissions for secure access.',
  },
];

export const settingsNavItems: SettingsNavItem[] = [
  {
    label: 'Appearance',
    href: '/settings/appearance',
    description: 'Choose how Markos looks on your device.',
    icon: PaletteOutlinedIcon,
    section: 'preferences',
  },
  {
    label: 'Account',
    href: '/settings/account',
    description: 'Your signed-in workspace identity.',
    icon: PersonOutlinedIcon,
    section: 'preferences',
  },
  {
    label: 'Team',
    href: '/settings/team',
    description: 'Invite and manage workspace members.',
    icon: GroupsOutlinedIcon,
    section: 'team',
    requiredPermission: 'users:read',
  },
  {
    label: 'Manage Forms',
    href: '/settings/forms',
    description: 'View and extend workspace form and table field schemas.',
    icon: DynamicFormOutlinedIcon,
    section: 'access',
    requiredPermission: 'forms:read',
  },
  {
    label: 'Module limits',
    href: '/settings/limits',
    description: 'Configure usage limits for enabled workspace modules.',
    icon: TuneOutlinedIcon,
    section: 'access',
    platformOwnerOnly: true,
  },
  {
    label: 'RBAC',
    href: '/settings/rbac',
    description: 'Manage roles and permissions for workspace access.',
    icon: AdminPanelSettingsOutlinedIcon,
    section: 'access',
  },
  {
    label: 'Audit logs',
    href: '/settings/audit-logs',
    description: 'Review workspace activity with user-friendly action messages.',
    icon: HistoryOutlinedIcon,
    section: 'access',
    requiredPermission: 'audit-logs:read',
  },
  {
    label: 'ABAC Policies',
    href: '/settings/abac',
    description: 'Define attribute-based policies and assign them to users.',
    icon: PolicyOutlinedIcon,
    section: 'access',
    requiredPermission: 'abac:read',
  },
  {
    label: 'Assign policies',
    href: '/settings/abac/assign',
    description: 'Bulk assign ABAC policies to one or many team members.',
    icon: AssignmentIndOutlinedIcon,
    section: 'access',
    requiredPermission: 'abac:manage',
  },
];

export function getSettingsPageTitle(pathname: string): string | null {
  if (pathname === '/settings/rbac/new') {
    return 'Create role';
  }

  if (pathname === '/settings/abac/new') {
    return 'Create ABAC policy';
  }

  if (pathname === '/settings/abac/assign') {
    return 'Assign ABAC policies';
  }

  if (pathname === '/settings/team/invite') {
    return 'Invite member';
  }

  if (pathname === '/settings/audit-logs') {
    return 'Audit logs';
  }

  if (/^\/settings\/rbac\/[^/]+$/.test(pathname) && pathname !== '/settings/rbac/new') {
    return 'Edit role';
  }

  if (/^\/settings\/abac\/[^/]+$/.test(pathname) && pathname !== '/settings/abac/new') {
    return 'Edit ABAC policy';
  }

  if (pathname.startsWith('/settings/forms')) {
    return 'Manage Forms';
  }

  if (pathname === '/settings/limits') {
    return 'Module limits';
  }

  const item = settingsNavItems.find((entry) => entry.href === pathname);
  return item?.label ?? null;
}
