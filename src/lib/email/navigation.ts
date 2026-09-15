import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export const EMAIL_TEMPLATES_HREF = '/email/templates';

export const emailTemplateMeta = {
  label: 'Email template',
  pluralLabel: 'Email templates',
  description:
    'Reusable single emails and full sequences with private or org-wide sharing.',
  href: EMAIL_TEMPLATES_HREF,
  icon: DescriptionOutlinedIcon,
};

export interface EmailTab {
  label: string;
  href: string;
  icon: SvgIconComponent;
  description?: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
}

export const emailPrimaryTabs: EmailTab[] = [
  {
    label: 'Dashboard',
    href: '/email/analytics',
    icon: BarChartOutlinedIcon,
    description: 'Open rates, clicks, and deliverability trends.',
  },
  {
    label: 'Campaigns',
    href: '/email/campaigns',
    icon: CampaignOutlinedIcon,
    description: 'Create, schedule, and manage outreach campaigns.',
  },
  {
    label: 'Audience',
    href: '/email/lists',
    icon: ListAltOutlinedIcon,
    description: 'Browse contacts, manage lists, and control global exclusions.',
  },
  {
    label: 'Inbox',
    href: '/email/inbox',
    icon: InboxOutlinedIcon,
    description: 'Unified reply inbox for campaign responses.',
  },
  {
    label: 'Templates',
    href: emailTemplateMeta.href,
    icon: emailTemplateMeta.icon,
    description: emailTemplateMeta.description,
  },
  {
    label: 'Fix Spam',
    href: '/email/fix-spam',
    icon: AutoFixHighOutlinedIcon,
    description: 'Improve deliverability and spam ratings for sending mailboxes.',
    requiredPermission: 'mailboxes:read',
  },
  {
    label: 'Mailboxes',
    href: '/email/mailboxes',
    icon: MailOutlineOutlinedIcon,
    requiredPermission: 'mailboxes:read',
  },
];

export const emailSecondaryTabs: EmailTab[] = [
  {
    label: 'Settings',
    href: '/email/settings',
    icon: TuneOutlinedIcon,
    description: 'Configure campaign types, brands, regions, and operational workflows.',
    requiredAnyPermissions: [
      'email-config:read',
      'email-campaigns:request-delete',
      'email-campaigns:approve-delete',
    ],
  },
];

export const emailTabs: EmailTab[] = [...emailPrimaryTabs, ...emailSecondaryTabs];

function toOrgRelativePath(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  return orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
}

export function getEmailTabByHref(pathname: string): EmailTab | undefined {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/email/settings')) {
    return emailTabs.find((tab) => tab.href === '/email/settings');
  }

  if (relativePath.startsWith('/email/lists')) {
    return emailTabs.find((tab) => tab.href === '/email/lists');
  }

  if (relativePath.startsWith('/email/excluded')) {
    return emailTabs.find((tab) => tab.href === '/email/lists');
  }

  return emailTabs.find((tab) => relativePath.startsWith(tab.href));
}

export function getEmailPageTitle(pathname: string): string | null {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/email/settings/delete-requests')) {
    return 'Delete requests';
  }

  if (relativePath.startsWith('/email/settings')) {
    return 'Settings';
  }

  if (relativePath === '/email/lists/new/manual') {
    return 'Create manual list';
  }

  if (relativePath === '/email/templates/new') {
    return 'Create email template';
  }

  if (/^\/email\/templates\/[^/]+$/.test(relativePath)) {
    return 'Edit email template';
  }

  const emailTab = getEmailTabByHref(pathname);
  return emailTab?.label ?? null;
}
