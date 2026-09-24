import type { ProspectSearchResult } from '@/lib/crm/prospects/types';

export interface CompanyContactProspectOptions {
  canAccessProspectList: boolean;
  canCreateContactProspect: boolean;
  isCreatingContactProspectStub: boolean;
  onCreateContactProspectStub: (
    displayName: string,
  ) => Promise<ProspectSearchResult>;
}
