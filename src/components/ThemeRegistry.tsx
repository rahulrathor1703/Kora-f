'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialogProvider';
import NotificationProvider from '@/components/ui/NotificationProvider';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider>
      <ThemeModeProvider>
        <ConfirmDialogProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ConfirmDialogProvider>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
