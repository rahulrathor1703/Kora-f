'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface WizardFormSectionProps {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  /** When true, adds a top border and padding (for sections after the first). */
  divided?: boolean;
  className?: string;
}

export default function WizardFormSection({
  title,
  description,
  headerAction,
  children,
  divided = false,
  className,
}: WizardFormSectionProps) {
  return (
    <Stack
      spacing={2}
      className={[
        divided ? 'border-t border-surface-border pt-6' : undefined,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title ? (
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Stack spacing={0.5} className="min-w-0">
            <Typography variant="subtitle1" component="h3" className="font-bold">
              {title}
            </Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            ) : null}
          </Stack>
          {headerAction ? (
            <Box className="shrink-0">{headerAction}</Box>
          ) : null}
        </Stack>
      ) : null}
      {children}
    </Stack>
  );
}
