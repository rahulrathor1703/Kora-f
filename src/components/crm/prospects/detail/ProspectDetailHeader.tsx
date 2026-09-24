'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import {
  getProspectDetailBackHref,
  getProspectDetailBackLabel,
  type ProspectDetailFrom,
} from '@/lib/crm/prospects/detail-config';
import type { Prospect } from '@/lib/crm/prospects/types';

interface ProspectDetailHeaderProps {
  prospect: Prospect | null;
  from: ProspectDetailFrom | null;
  isLoading: boolean;
}

export default function ProspectDetailHeader({
  prospect,
  from,
  isLoading,
}: ProspectDetailHeaderProps) {
  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width={180} height={40} className="rounded-2xl" />
        <Skeleton width="45%" height={40} />
        <Skeleton width="25%" height={24} />
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      <SettingsNavButton
        href={getProspectDetailBackHref(from)}
        label={getProspectDetailBackLabel(from)}
      />
      {prospect ? (
        <>
          <Typography variant="h4" component="h1" className="font-bold">
            {prospect.fullName || 'Unnamed prospect'}
          </Typography>
          {prospect.values.designation !== null &&
          prospect.values.designation !== undefined &&
          String(prospect.values.designation).trim() !== '' ? (
            <Typography variant="body1" color="text.secondary">
              {String(prospect.values.designation)}
            </Typography>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}
