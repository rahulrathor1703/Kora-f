import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { CompanyConfigCategory } from '@/lib/crm/companies/types';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export interface CrmConfigurationNavItem {
  label: string;
  href: string;
  description: string;
  icon: SvgIconComponent;
  category?: CompanyConfigCategory;
  requiredPermission?: string;
}

export interface CompanyConfigCategoryMeta {
  category: CompanyConfigCategory;
  label: string;
  pluralLabel: string;
  description: string;
  href: string;
  icon: SvgIconComponent;
}

export const companyConfigCategoryMeta: Record<
  CompanyConfigCategory,
  CompanyConfigCategoryMeta
> = {
  category: {
    category: 'category',
    label: 'Category',
    pluralLabel: 'Categories',
    description: 'Broker, insurer, and other company categories.',
    href: '/crm/configuration/categories',
    icon: CategoryOutlinedIcon,
  },
  location: {
    category: 'location',
    label: 'Location',
    pluralLabel: 'Locations',
    description: 'Geographic locations for company records.',
    href: '/crm/configuration/locations',
    icon: PublicOutlinedIcon,
  },
};

export const crmConfigurationDropdownItems: CrmConfigurationNavItem[] = [
  {
    label: companyConfigCategoryMeta.category.pluralLabel,
    href: companyConfigCategoryMeta.category.href,
    description: companyConfigCategoryMeta.category.description,
    icon: companyConfigCategoryMeta.category.icon,
    category: 'category',
    requiredPermission: 'company-config:read',
  },
  {
    label: companyConfigCategoryMeta.location.pluralLabel,
    href: companyConfigCategoryMeta.location.href,
    description: companyConfigCategoryMeta.location.description,
    icon: companyConfigCategoryMeta.location.icon,
    category: 'location',
    requiredPermission: 'company-config:read',
  },
  {
    label: 'Location API',
    href: '/crm/configuration/location-api',
    description: 'Configure GeoNames or a custom API for location autocomplete.',
    icon: TravelExploreOutlinedIcon,
    requiredPermission: 'location-settings:read',
  },
  {
    label: 'BANT Settings',
    href: '/crm/configuration/bant-settings',
    description:
      'Configure qualification criteria, scoring weights, and tier thresholds.',
    icon: AssessmentOutlinedIcon,
    requiredPermission: 'bant-settings:read',
  },
];

export function getCompanyConfigCategoryMeta(
  category: CompanyConfigCategory,
): CompanyConfigCategoryMeta {
  return companyConfigCategoryMeta[category];
}

function toOrgRelativePath(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  return orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
}

export function getCompanyConfigCategoryFromPathname(
  pathname: string,
): CompanyConfigCategory | null {
  const relativePath = toOrgRelativePath(pathname);

  if (
    relativePath.startsWith('/crm/configuration/categories') ||
    relativePath.startsWith('/crm/settings/categories')
  ) {
    return 'category';
  }

  if (
    relativePath.startsWith('/crm/configuration/locations') ||
    relativePath.startsWith('/crm/settings/locations')
  ) {
    return 'location';
  }

  if (relativePath.startsWith('/crm/configuration/location-api')) {
    return null;
  }

  return null;
}
