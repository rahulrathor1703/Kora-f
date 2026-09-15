'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import SettingsNavButton from '@/components/settings/SettingsNavButton';

interface ListDetailShellProps {
  backHref?: string;
  backLabel?: string;
  error?: string | null;
  isLoading?: boolean;
  notFound?: boolean;
  notFoundTitle?: string;
  notFoundMessage?: string;
  children?: React.ReactNode;
}

export default function ListDetailShell({
  backHref = '/email/lists?tab=lists',
  backLabel = 'Back to audience',
  error,
  notFound = false,
  notFoundTitle = 'List not found',
  notFoundMessage = 'This list may have been removed or you may not have access to view it.',
  children,
}: ListDetailShellProps) {
  if (error) {
    return (
      <Stack spacing={3}>
        <SettingsNavButton href={backHref} label={backLabel} />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
      </Stack>
    );
  }

  if (notFound) {
    return (
      <Stack spacing={3}>
        <SettingsNavButton href={backHref} label={backLabel} />
        <Alert severity="warning" className="rounded-2xl">
          <strong>{notFoundTitle}</strong>
          <br />
          {notFoundMessage}
        </Alert>
      </Stack>
    );
  }

  return <Stack spacing={3}>{children}</Stack>;
}
