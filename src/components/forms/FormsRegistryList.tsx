'use client';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type {
  FormEditorMode,
  FormModule,
  FormRegistryListItem,
} from '@/lib/forms/types';

const MODULE_ORDER: FormModule[] = ['crm', 'email', 'settings', 'website'];

const MODULE_LABELS: Record<FormModule, string> = {
  crm: 'CRM',
  email: 'Email',
  settings: 'Settings',
  website: 'Website',
};

interface FormsRegistryListProps {
  forms: FormRegistryListItem[];
  mode: FormEditorMode;
  isLoading?: boolean;
  errorMessage?: string | null;
  buildEditHref: (formKey: string) => string;
  heroTitle: string;
  heroDescription: string;
  heroOverline?: string;
  editActionLabel?: string;
  filterExtendableOnly?: boolean;
  canEdit?: boolean;
}

function FormRowSkeleton() {
  return (
    <Box className="rounded-2xl border border-border/60 p-4">
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box className="min-w-0 flex-1">
          <Skeleton width="40%" height={24} />
          <Skeleton width="55%" height={18} className="mt-1" />
        </Box>
        <Skeleton width={80} height={32} className="rounded-full" />
        <Skeleton width={24} height={24} variant="circular" />
      </Stack>
    </Box>
  );
}

function statusChips(form: FormRegistryListItem, mode: FormEditorMode) {
  if (mode === 'platform') {
    return (
      <>
        <Chip
          size="small"
          label={form.hasPlatformSchema ? 'Baseline set' : 'Default'}
          color={form.hasPlatformSchema ? 'success' : 'default'}
        />
        {form.supportsOrgExtensions ? (
          <Chip size="small" label="Org extensions" variant="outlined" />
        ) : null}
      </>
    );
  }

  return (
    <Chip
      size="small"
      label={form.hasOrgExtensions ? 'Custom fields added' : 'Platform only'}
      color={form.hasOrgExtensions ? 'primary' : 'default'}
    />
  );
}

export default function FormsRegistryList({
  forms,
  mode,
  isLoading = false,
  errorMessage = null,
  buildEditHref,
  heroTitle,
  heroDescription,
  heroOverline,
  editActionLabel = mode === 'platform' ? 'Edit baseline' : 'Extend',
  filterExtendableOnly = mode === 'org',
  canEdit = true,
}: FormsRegistryListProps) {
  const [moduleFilter, setModuleFilter] = useState<FormModule | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleForms = useMemo(() => {
    let filtered = filterExtendableOnly
      ? forms.filter((form) => form.supportsOrgExtensions)
      : forms;

    if (moduleFilter !== 'all') {
      filtered = filtered.filter((form) => form.module === moduleFilter);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (form) =>
          form.label.toLowerCase().includes(query) ||
          form.key.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [filterExtendableOnly, forms, moduleFilter, searchQuery]);

  const stats = useMemo(() => {
    const source = filterExtendableOnly
      ? forms.filter((form) => form.supportsOrgExtensions)
      : forms;

    if (mode === 'platform') {
      return {
        total: source.length,
        secondary: source.filter((form) => form.hasPlatformSchema).length,
        secondaryLabel: 'Baselines set',
      };
    }

    return {
      total: source.length,
      secondary: source.filter((form) => form.hasOrgExtensions).length,
      secondaryLabel: 'With extensions',
    };
  }, [filterExtendableOnly, forms, mode]);

  const moduleCounts = useMemo(() => {
    const source = filterExtendableOnly
      ? forms.filter((form) => form.supportsOrgExtensions)
      : forms;
    const counts = new Map<FormModule, number>();

    for (const formModule of MODULE_ORDER) {
      counts.set(formModule, 0);
    }

    for (const form of source) {
      counts.set(form.module, (counts.get(form.module) ?? 0) + 1);
    }

    return counts;
  }, [filterExtendableOnly, forms]);

  const hasActiveFilters = moduleFilter !== 'all' || searchQuery.trim().length > 0;

  if (errorMessage) {
    return (
      <Alert severity="error" className="rounded-2xl">
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box className="dashboard-hero surface-panel rounded-2xl p-6 md:p-8">
        <Box className="max-w-3xl">
          {heroOverline ? (
            <Typography
              variant="overline"
              className="font-semibold tracking-[0.1em] text-primary"
            >
              {heroOverline}
            </Typography>
          ) : null}
          <Typography
            variant="h3"
            component="h1"
            className="mt-2 text-3xl font-bold text-foreground md:text-4xl"
          >
            {heroTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mt-3 max-w-2xl">
            {heroDescription}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          className="mt-6"
        >
          <Box className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
            <Typography variant="caption" color="text.secondary">
              Total forms
            </Typography>
            <Typography variant="h5" className="font-semibold">
              {isLoading ? '—' : stats.total}
            </Typography>
          </Box>
          <Box className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
            <Typography variant="caption" color="text.secondary">
              {stats.secondaryLabel}
            </Typography>
            <Typography variant="h5" className="font-semibold">
              {isLoading ? '—' : stats.secondary}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} className="flex-wrap">
          <Chip
            label="All"
            clickable
            color={moduleFilter === 'all' ? 'primary' : 'default'}
            variant={moduleFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setModuleFilter('all')}
          />
          {MODULE_ORDER.map((formModule) => {
            const count = moduleCounts.get(formModule) ?? 0;
            if (count === 0) {
              return null;
            }

            return (
              <Chip
                key={formModule}
                label={`${MODULE_LABELS[formModule]} (${count})`}
                clickable
                color={moduleFilter === formModule ? 'primary' : 'default'}
                variant={moduleFilter === formModule ? 'filled' : 'outlined'}
                onClick={() => setModuleFilter(formModule)}
              />
            );
          })}
        </Stack>

        <TextField
          size="small"
          placeholder="Search by label or key..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="min-w-[240px]"
        />
      </Stack>

      {isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <FormRowSkeleton key={index} />
          ))}
        </Stack>
      ) : visibleForms.length === 0 ? (
        <Box className="rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <Typography variant="subtitle1" className="font-semibold">
            {hasActiveFilters ? 'No forms match your search' : 'No forms available'}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query.'
              : 'Registered forms will appear here when available.'}
          </Typography>
          {hasActiveFilters ? (
            <Button
              className="mt-4"
              onClick={() => {
                setModuleFilter('all');
                setSearchQuery('');
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {visibleForms.map((form) => (
            <Link
              key={form.key}
              href={buildEditHref(form.key)}
              className="block rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box className="min-w-0 flex-1">
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body1" className="font-semibold">
                      {form.label}
                    </Typography>
                    <Chip size="small" label={form.formType} variant="outlined" />
                  </Stack>
                  <Typography variant="caption" className="mt-1 font-mono text-muted">
                    {form.key}
                  </Typography>
                  <Stack direction="row" spacing={1} className="mt-2 flex-wrap">
                    <Chip size="small" label={MODULE_LABELS[form.module]} />
                    {statusChips(form, mode)}
                    {form.customWidgets && form.customWidgets.length > 0 ? (
                      <Chip
                        size="small"
                        icon={<WidgetsOutlinedIcon />}
                        label="Custom widgets"
                        variant="outlined"
                      />
                    ) : null}
                    {mode === 'org' && form.supportsOrgExtensions ? (
                      <Chip
                        size="small"
                        icon={<ExtensionOutlinedIcon />}
                        label="Extendable"
                        variant="outlined"
                      />
                    ) : null}
                  </Stack>
                </Box>
                <Typography variant="body2" className="hidden font-medium text-primary sm:inline">
                  {canEdit ? editActionLabel : 'View'}
                </Typography>
                <ChevronRightOutlinedIcon className="text-muted" />
              </Stack>
            </Link>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
