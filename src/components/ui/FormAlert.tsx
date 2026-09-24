'use client';

import Alert from '@mui/material/Alert';

interface FormAlertProps {
  message: string;
  tone?: 'default' | 'onDark';
}

export default function FormAlert({
  message,
  tone = 'default',
}: FormAlertProps) {
  const className =
    tone === 'onDark'
      ? 'rounded-xl border border-red-500/20 bg-red-950/40 text-red-100'
      : 'rounded-xl';

  return (
    <Alert severity="error" className={className}>
      {message}
    </Alert>
  );
}
