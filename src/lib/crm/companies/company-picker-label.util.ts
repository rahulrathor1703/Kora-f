import type { Company } from '@/lib/crm/companies/types';

export function getCompanyPickerLabel(company: Company): string {
  const brokerName = company.brokerName?.trim();
  if (brokerName) {
    return brokerName;
  }

  const legalName = company.values.legalCompanyName;
  if (typeof legalName === 'string' && legalName.trim()) {
    return legalName.trim();
  }

  return `Company ${company.id.slice(0, 8)}`;
}
