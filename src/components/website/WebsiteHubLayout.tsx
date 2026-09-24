'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';
import { getWebsiteTabByHref } from '@/lib/website/navigation';

interface WebsiteHubLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default function WebsiteHubLayout({
  children,
  actions,
  hideHeader = false,
}: WebsiteHubLayoutProps) {
  const pathname = usePathname();
  const activeTab = getWebsiteTabByHref(pathname);

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
              {activeTab?.label ?? 'Website'}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mt-1">
              {activeTab?.description ??
                'Website management, SEO, and analytics.'}
            </Typography>
          </Box>
          {actions ? <Box className="shrink-0">{actions}</Box> : null}
        </Stack>
      )}

      {children}
    </Stack>
  );
}
