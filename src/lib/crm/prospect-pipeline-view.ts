import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export type ProspectPipelineView = '/crm/prospectus' | '/crm/pipeline';

export const PROSPECT_PIPELINE_VIEW_TOOLTIPS: Record<ProspectPipelineView, string> = {
  '/crm/prospectus': 'Prospects list',
  '/crm/pipeline': 'Pipeline board',
};

export function getProspectPipelineViewFromPath(pathname: string): ProspectPipelineView {
  const orgSlug = getOrgSlugFromPathname(pathname);
  const relativePath = orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;

  if (relativePath === '/crm/pipeline') {
    return '/crm/pipeline';
  }

  return '/crm/prospectus';
}
