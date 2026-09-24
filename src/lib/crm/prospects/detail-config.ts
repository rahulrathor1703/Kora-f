export type ProspectDetailFrom = 'prospectus' | 'pipeline';

export function getProspectDetailBackHref(from: ProspectDetailFrom | null): string {
  if (from === 'pipeline') {
    return '/crm/pipeline';
  }

  return '/crm/prospectus';
}

export function getProspectDetailBackLabel(from: ProspectDetailFrom | null): string {
  if (from === 'pipeline') {
    return 'Back to pipeline';
  }

  return 'Back to prospects';
}
