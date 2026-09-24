'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';
import { getEmailTabByHref } from '@/lib/email/navigation';

interface EmailHubLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default function EmailHubLayout({
  children,
  actions,
  hideHeader = false,
}: EmailHubLayoutProps) {
  const pathname = usePathname();
  const activeTab = getEmailTabByHref(pathname);

  return (
    <Stack spacing={3}>
      {hideHeader ? null : (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h4" component="h1" className="font-bold">
              {activeTab?.label ?? 'Email'}
            </Typography>
            {activeTab?.description ? (
              <Typography variant="body1" color="text.secondary" className="mt-1">
                {activeTab.description}
              </Typography>
            ) : null}
          </Box>
          {actions ? <Box className="shrink-0">{actions}</Box> : null}
        </Stack>
      )}

      {children}
    </Stack>
  );
}
