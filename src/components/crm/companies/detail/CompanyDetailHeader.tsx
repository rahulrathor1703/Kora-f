'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { getFieldStringValue } from '@/lib/crm/companies/field-config';
import type { Company, CompanyConfigOption } from '@/lib/crm/companies/types';

interface CompanyDetailHeaderProps {
  company: Company | null;
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isLoading: boolean;
}

function resolveConfigLabel(
  options: CompanyConfigOption[],
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return options.find((option) => option.id === String(value))?.label ?? null;
}

export default function CompanyDetailHeader({
  company,
  categories,
  locations,
  isLoading,
}: CompanyDetailHeaderProps) {
  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width={180} height={40} className="rounded-2xl" />
        <Skeleton width="45%" height={40} />
        <Skeleton width="25%" height={24} />
      </Stack>
    );
  }

  const categoryLabel = company
    ? resolveConfigLabel(
        categories,
        getFieldStringValue(company.values, 'categoryId'),
      )
    : null;
  const locationLabel = company
    ? resolveConfigLabel(
        locations,
        getFieldStringValue(company.values, 'locationId'),
      )
    : null;

  return (
    <Stack spacing={1.5}>
      <SettingsNavButton href="/crm/companies" label="Companies" />
      {company ? (
        <>
          <Typography variant="h4" component="h1" className="font-bold">
            {company.brokerName}
          </Typography>
          {categoryLabel || locationLabel ? (
            <Typography variant="body1" color="text.secondary">
              {[categoryLabel, locationLabel].filter(Boolean).join(' · ')}
            </Typography>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}
