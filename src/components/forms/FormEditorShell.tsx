'use client';

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import type { FormEditorMode, FormModule, FormType } from '@/lib/forms/types';

const MODULE_LABELS: Record<FormModule, string> = {
  crm: 'CRM',
  email: 'Email',
  settings: 'Settings',
  website: 'Website',
};

interface FormEditorShellProps {
  mode: FormEditorMode;
  formKey: string;
  formLabel: string;
  formModule?: FormModule;
  formType?: FormType;
  fieldCount: number;
  listHref: string;
  listLabel: string;
  rootHref: string;
  rootLabel: string;
  children: React.ReactNode;
}

export default function FormEditorShell({
  mode,
  formKey,
  formLabel,
  formModule,
  formType,
  fieldCount,
  listHref,
  listLabel,
  rootHref,
  rootLabel,
  children,
}: FormEditorShellProps) {
  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="Form editor navigation">
        <Link component={NextLink} href={rootHref} underline="hover" color="inherit">
          {rootLabel}
        </Link>
        <Link component={NextLink} href={listHref} underline="hover" color="inherit">
          {listLabel}
        </Link>
        <Typography color="text.primary">{formLabel}</Typography>
      </Breadcrumbs>

      <Paper className="dashboard-panel surface-panel rounded-2xl p-5">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h5" component="h1" className="font-semibold">
              {formLabel}
            </Typography>
            <Typography variant="caption" className="mt-1 font-mono text-muted">
              {formKey}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} className="flex-wrap">
            {formModule ? (
              <Chip size="small" label={MODULE_LABELS[formModule]} />
            ) : null}
            {formType ? (
              <Chip size="small" label={formType} variant="outlined" />
            ) : null}
            <Chip
              size="small"
              label={`${fieldCount} field${fieldCount === 1 ? '' : 's'}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={mode === 'platform' ? 'Platform baseline' : 'Org extensions'}
              color={mode === 'platform' ? 'primary' : 'default'}
            />
          </Stack>
        </Stack>
      </Paper>

      {children}
    </Stack>
  );
}
