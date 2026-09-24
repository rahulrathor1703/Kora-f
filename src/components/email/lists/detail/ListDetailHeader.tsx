'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useSession } from '@/hooks/useAuth';

interface ListDetailHeaderProps {
  name: string | null;
  isLoading: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function ListDetailHeader({
  name,
  isLoading,
  backHref = '/email/lists?tab=lists',
  backLabel = 'Back to audience',
}: ListDetailHeaderProps) {
  const { data: session } = useSession();
  const organizationName =
    session?.organization?.name ?? 'Your organization';

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width={160} height={40} className="rounded-2xl" />
        <Skeleton width="50%" height={40} />
        <Skeleton width="30%" height={24} />
      </Stack>
    );
  }

  if (!name) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <SettingsNavButton href={backHref} label={backLabel} />

      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1" className="font-bold">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {organizationName}
        </Typography>
      </Stack>
    </Stack>
  );
}
