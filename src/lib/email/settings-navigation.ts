import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { EmailConfigCategory } from '@/lib/api';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export interface EmailSettingsNavItem {
  label: string;
  href: string;
  description: string;
  icon: SvgIconComponent;
  category?: EmailConfigCategory;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
}

export interface EmailConfigCategoryMeta {
  category: EmailConfigCategory;
  label: string;
  pluralLabel: string;
  description: string;
  href: string;
  icon: SvgIconComponent;
}

export const emailConfigCategoryMeta: Record<
  EmailConfigCategory,
  EmailConfigCategoryMeta
> = {
  'campaign-type': {
    category: 'campaign-type',
    label: 'Campaign type',
    pluralLabel: 'Campaign types',
    description: 'Outreach, nurture, re-engagement, and other campaign categories.',
    href: '/email/settings/campaign-types',
    icon: CategoryOutlinedIcon,
  },
  brand: {
    category: 'brand',
    label: 'Brand',
    pluralLabel: 'Brands',
    description: 'Product and company brands used when creating campaigns.',
    href: '/email/settings/brands',
    icon: BusinessOutlinedIcon,
  },
  region: {
    category: 'region',
    label: 'Region',
    pluralLabel: 'Regions',
    description: 'Geographic regions for targeting and reporting.',
    href: '/email/settings/regions',
    icon: PublicOutlinedIcon,
  },
};

export const emailSettingsNavItems: EmailSettingsNavItem[] = [
  {
    label: emailConfigCategoryMeta['campaign-type'].pluralLabel,
    href: emailConfigCategoryMeta['campaign-type'].href,
    description: emailConfigCategoryMeta['campaign-type'].description,
    icon: emailConfigCategoryMeta['campaign-type'].icon,
    category: 'campaign-type',
  },
  {
    label: emailConfigCategoryMeta.brand.pluralLabel,
    href: emailConfigCategoryMeta.brand.href,
    description: emailConfigCategoryMeta.brand.description,
    icon: emailConfigCategoryMeta.brand.icon,
    category: 'brand',
  },
  {
    label: emailConfigCategoryMeta.region.pluralLabel,
    href: emailConfigCategoryMeta.region.href,
    description: emailConfigCategoryMeta.region.description,
    icon: emailConfigCategoryMeta.region.icon,
    category: 'region',
  },
];

export const emailSettingsOperationalNavItems: EmailSettingsNavItem[] = [
  {
    label: 'Delete requests',
    href: '/email/settings/delete-requests',
    description: 'Review and manage campaign deletion requests.',
    icon: DeleteOutlineOutlinedIcon,
    requiredAnyPermissions: [
      'email-campaigns:request-delete',
      'email-campaigns:approve-delete',
    ],
  },
];

export function getEmailConfigCategoryMeta(
  category: EmailConfigCategory,
): EmailConfigCategoryMeta {
  return emailConfigCategoryMeta[category];
}

function toOrgRelativePath(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  return orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
}

export function getEmailConfigCategoryFromPathname(
  pathname: string,
): EmailConfigCategory | null {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/email/settings/campaign-types')) {
    return 'campaign-type';
  }

  if (relativePath.startsWith('/email/settings/brands')) {
    return 'brand';
  }

  if (relativePath.startsWith('/email/settings/regions')) {
    return 'region';
  }

  if (relativePath.startsWith('/email/settings/delete-requests')) {
    return null;
  }

  return null;
}
