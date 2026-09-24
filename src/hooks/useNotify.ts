'use client';

import { useCallback } from 'react';
import { useSnackbar, type OptionsObject, type SnackbarMessage } from 'notistack';

type NotifyVariant = 'default' | 'error' | 'success' | 'warning' | 'info';

interface NotifyOptions extends OptionsObject {
  variant?: NotifyVariant;
}

export function useNotify() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = useCallback(
    (message: SnackbarMessage, options: NotifyOptions = {}) => {
      enqueueSnackbar(message, {
        variant: 'default',
        autoHideDuration: options.variant === 'error' ? 8000 : 5000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        ...options,
      });
    },
    [enqueueSnackbar],
  );

  const notifyError = useCallback(
    (message: SnackbarMessage, options?: NotifyOptions) => {
      notify(message, { ...options, variant: 'error' });
    },
    [notify],
  );

  const notifySuccess = useCallback(
    (message: SnackbarMessage, options?: NotifyOptions) => {
      notify(message, { ...options, variant: 'success' });
    },
    [notify],
  );

  return {
    notify,
    notifyError,
    notifySuccess,
    closeSnackbar,
  };
}
