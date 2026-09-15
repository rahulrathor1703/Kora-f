import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export interface CrmTab {
  label: string;
  href: string;
  icon: SvgIconComponent;
  description: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
}

export const crmTabs: CrmTab[] = [
  {
    label: 'Prospects',
    href: '/crm/prospectus',
    icon: PeopleOutlinedIcon,
    description: 'Manage leads, track pipeline fields, and log engagements.',
    requiredPermission: 'prospects:read',
  },
  {
    label: 'Pipeline',
    href: '/crm/pipeline',
    icon: ViewColumnOutlinedIcon,
    description: 'Track deals through your sales pipeline stages.',
    requiredPermission: 'prospects:read',
  },
  {
    label: 'Followups',
    href: '/crm/followups',
    icon: NotificationsActiveOutlinedIcon,
    description: 'Schedule and monitor follow-up tasks with prospects.',
    requiredPermission: 'prospects:read',
  },
  {
    label: 'Meetings',
    href: '/crm/meetings',
    icon: EventOutlinedIcon,
    description: 'View and manage scheduled meetings with contacts.',
    requiredPermission: 'meetings:read',
  },
  {
    label: 'Companies',
    href: '/crm/companies',
    icon: BusinessOutlinedIcon,
    description: 'Browse and manage company records in your CRM.',
    requiredPermission: 'companies:read',
  },
  {
    label: 'CRM Configuration',
    href: '/crm/configuration',
    icon: SettingsOutlinedIcon,
    description: 'Manage company categories, locations, and BANT qualification.',
    requiredAnyPermissions: [
      'company-config:read',
      'location-settings:read',
      'bant-settings:read',
    ],
  },
];

export const prospectPipelineViews = crmTabs.filter(
  (tab) => tab.href === '/crm/prospectus' || tab.href === '/crm/pipeline',
);

function toOrgRelativePath(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  return orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
}

export function getCrmTabByHref(pathname: string): CrmTab | undefined {
  const relativePath = toOrgRelativePath(pathname);

  if (
    relativePath.startsWith('/crm/configuration') ||
    relativePath.startsWith('/crm/settings')
  ) {
    return crmTabs.find((tab) => tab.href === '/crm/configuration');
  }

  return crmTabs.find((tab) => relativePath.startsWith(tab.href));
}

export function isProspectPipelineListPage(pathname: string): boolean {
  const relativePath = toOrgRelativePath(pathname);
  return relativePath === '/crm/prospectus' || relativePath === '/crm/pipeline';
}

export function getCrmPageTitle(pathname: string): string | null {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/crm/prospectus/fields')) {
    return 'Manage Fields';
  }

  if (relativePath.startsWith('/crm/companies/fields')) {
    return 'Manage Fields';
  }

  if (
    relativePath.startsWith('/crm/configuration') ||
    relativePath.startsWith('/crm/settings')
  ) {
    return null;
  }

  if (/^\/crm\/companies\/[^/]+$/.test(relativePath)) {
    return null;
  }

  if (/^\/crm\/prospects\/[^/]+$/.test(relativePath)) {
    return null;
  }

  const crmTab = getCrmTabByHref(pathname);
  return crmTab?.label ?? null;
}
