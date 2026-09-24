import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export interface WebsiteTab {
  label: string;
  href: string;
  icon: SvgIconComponent;
  description: string;
  requiredPermission?: string;
}

export const websiteTabs: WebsiteTab[] = [
  {
    label: 'Overview',
    href: '/website/overview',
    icon: DashboardOutlinedIcon,
    description: 'High-level website health and performance summary.',
    requiredPermission: 'website:read',
  },
  {
    label: 'Traffic',
    href: '/website/traffic',
    icon: TrendingUpOutlinedIcon,
    description: 'View visitor trends and traffic sources.',
    requiredPermission: 'website:read',
  },
  {
    label: 'Technical',
    href: '/website/technical',
    icon: BuildOutlinedIcon,
    description: 'Monitor technical SEO, crawlability, and site infrastructure.',
    requiredPermission: 'website:read',
  },
  {
    label: 'On-page',
    href: '/website/on-page',
    icon: FindInPageOutlinedIcon,
    description: 'Audit on-page SEO elements, content, and metadata.',
    requiredPermission: 'website:read',
  },
  {
    label: 'Conversion tracking',
    href: '/website/conversion-tracking',
    icon: AdsClickOutlinedIcon,
    description: 'Track goals, events, and conversion performance.',
    requiredPermission: 'website:read',
  },
  {
    label: 'Roadmap keywords',
    href: '/website/roadmap-keywords',
    icon: KeyOutlinedIcon,
    description: 'Plan and prioritize keyword targets over time.',
    requiredPermission: 'website:read',
  },
  {
    label: 'AI visibility',
    href: '/website/ai-visibility',
    icon: AutoAwesomeOutlinedIcon,
    description: 'Monitor how your site appears in AI search and assistants.',
    requiredPermission: 'website:read',
  },
  {
    label: 'Blogs',
    href: '/website/blogs',
    icon: ArticleOutlinedIcon,
    description: 'Manage blog content and publishing performance.',
    requiredPermission: 'website:read',
  },
  {
    label: 'Website Config',
    href: '/website/configuration',
    icon: SettingsOutlinedIcon,
    description: 'Configure website settings and integrations.',
    requiredPermission: 'website:read',
  },
];

function toOrgRelativePath(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  return orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
}

export function getWebsiteTabByHref(pathname: string): WebsiteTab | undefined {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/website/configuration')) {
    return websiteTabs.find((tab) => tab.href === '/website/configuration');
  }

  return websiteTabs.find((tab) => relativePath.startsWith(tab.href));
}

export function getWebsitePageTitle(pathname: string): string | null {
  const websiteTab = getWebsiteTabByHref(pathname);
  return websiteTab?.label ?? null;
}
