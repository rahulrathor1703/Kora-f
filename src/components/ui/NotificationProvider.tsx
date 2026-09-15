'use client';

import { SnackbarProvider } from 'notistack';

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      maxSnack={3}
      preventDuplicate
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={5000}
      classes={{
        containerRoot: 'z-[1400]',
      }}
    >
      {children}
    </SnackbarProvider>
  );
}
