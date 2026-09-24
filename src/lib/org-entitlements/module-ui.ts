import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { OrgModule } from './types';

export interface OrgModuleUiMeta {
  label: string;
  description: string;
  icon: SvgIconComponent;
  accentClass: string;
}

export const ORG_MODULE_UI: Record<OrgModule, OrgModuleUiMeta> = {
  dashboard: {
    label: 'Dashboard',
    description: 'Organization workspace home and overview.',
    icon: DashboardOutlinedIcon,
    accentClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
  email: {
    label: 'Email',
    description: 'Mailboxes, campaigns, templates, and outreach.',
    icon: EmailOutlinedIcon,
    accentClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  crm: {
    label: 'CRM',
    description: 'Prospects, companies, pipeline, and follow-ups.',
    icon: ContactsOutlinedIcon,
    accentClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  website: {
    label: 'Website',
    description: 'Properties, audits, and SEO monitoring.',
    icon: LanguageOutlinedIcon,
    accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  settings: {
    label: 'Settings',
    description: 'Team members, roles, forms, and workspace config.',
    icon: SettingsOutlinedIcon,
    accentClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
};

export function formatLimitUsage(used: number, effective: number | null): string {
  if (effective == null) {
    return `${used} in use · No cap`;
  }

  return `${used} of ${effective} used`;
}

export function limitUsagePercent(used: number, effective: number | null): number {
  if (effective == null || effective <= 0) {
    return used > 0 ? 8 : 0;
  }

  return Math.min(100, Math.round((used / effective) * 100));
}
