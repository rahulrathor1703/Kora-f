'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';
import ProspectPipelineViewToggle from '@/components/crm/ProspectPipelineViewToggle';
import { useProspectPipelineViewOptional } from '@/components/crm/ProspectPipelineViewContext';
import {
  getCrmPageDescription,
  getCrmPageTitle,
  getCrmTabByHref,
  isProspectPipelineListPage,
  prospectPipelineViews,
} from '@/lib/crm/navigation';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

interface CrmHubLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default function CrmHubLayout({
  children,
  actions,
  hideHeader = false,
}: CrmHubLayoutProps) {
  const pathname = usePathname();
  const viewContext = useProspectPipelineViewOptional();
  const activeTab = getCrmTabByHref(pathname);
  const orgSlug = getOrgSlugFromPathname(pathname);
  const relativePath = orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
  const showViewToggle = isProspectPipelineListPage(pathname);
  const activeViewTab = viewContext
    ? prospectPipelineViews.find((tab) => tab.href === viewContext.view)
    : activeTab;
  const pageTitle =
    (showViewToggle && activeViewTab?.label) ||
    getCrmPageTitle(pathname) ||
    activeTab?.label ||
    'CRM';
  const customPageDescription = getCrmPageDescription(pathname);
  const pageDescription =
    customPageDescription ??
    (showViewToggle
      ? (activeViewTab?.description ??
        'Prospectus, pipeline, follow-ups, meetings, and companies.')
      : relativePath.startsWith('/crm/prospectus/fields')
        ? 'Configure table columns and form fields for your CRM.'
        : (activeTab?.description ??
          'Prospectus, pipeline, follow-ups, meetings, and companies.'));
  const isPipelineView =
    viewContext?.view === '/crm/pipeline' ||
    (!viewContext && relativePath.startsWith('/crm/pipeline'));

  return (
    <Stack
      spacing={3}
      className={isPipelineView ? 'flex min-h-0 w-full flex-1 flex-col' : undefined}
    >
      {hideHeader ? null : (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h4" component="h1" className="font-bold">
              {pageTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mt-1">
              {pageDescription}
            </Typography>
          </Box>
          {showViewToggle || actions ? (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'flex-start' }}
              className="shrink-0"
            >
              {showViewToggle ? <ProspectPipelineViewToggle /> : null}
              {actions ? <Box>{actions}</Box> : null}
            </Stack>
          ) : null}
        </Stack>
      )}

      {isPipelineView ? (
        <Box className="flex min-h-0 w-full flex-1 flex-col">{children}</Box>
      ) : (
        children
      )}
    </Stack>
  );
}
