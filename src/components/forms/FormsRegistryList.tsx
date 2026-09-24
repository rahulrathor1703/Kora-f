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
import { filterManageableForms } from '@/lib/forms/org-registry-forms';
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
  heroDescription?: string;
  heroOverline?: string;
  /** Hides the in-list hero panel (use an external page header instead). */
  hideHero?: boolean;
  editActionLabel?: string;
  filterExtendableOnly?: boolean;
  /** When true, only the six Manage Forms registry entries are shown. */
  manageableOnly?: boolean;
  canEdit?: boolean;
  hideModuleFilters?: boolean;
  hideRowChips?: boolean;
  listLayout?: 'list' | 'grid';
}

const FORM_GRID_CLASS = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4';

function applyRegistryScope(
  forms: FormRegistryListItem[],
  manageableOnly: boolean,
  filterExtendableOnly: boolean,
): FormRegistryListItem[] {
  if (manageableOnly) {
    return filterManageableForms(forms);
  }

  if (filterExtendableOnly) {
    return forms.filter(
      (form) => form.supportsOrgExtensions && !form.hideFromOrgRegistry,
    );
  }

  return forms;
}

function FormGridCardSkeleton() {
  return (
    <Box className="dashboard-panel surface-panel rounded-2xl p-4 shadow-none">
      <Skeleton width="70%" height={24} />
    </Box>
  );
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

interface FormRegistryCardProps {
  form: FormRegistryListItem;
  href: string;
  mode: FormEditorMode;
  layout: 'list' | 'grid';
  hideRowChips: boolean;
  canEdit: boolean;
  editActionLabel: string;
}

function FormRegistryCard({
  form,
  href,
  mode,
  layout,
  hideRowChips,
  canEdit,
  editActionLabel,
}: FormRegistryCardProps) {
  const actionLabel = canEdit ? editActionLabel : 'View';

  if (layout === 'grid') {
    return (
      <Link
        href={href}
        className="group/form-card block h-full rounded-2xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Box className="settings-hub-card dashboard-panel surface-panel flex h-full items-center justify-between gap-2 rounded-2xl p-4 shadow-none">
          <Typography
            variant="body1"
            className="min-w-0 font-semibold text-foreground transition-colors duration-200 group-hover/form-card:text-primary"
          >
            {form.label}
          </Typography>
          <ChevronRightOutlinedIcon
            className="shrink-0 text-primary opacity-0 transition-all duration-200 group-hover/form-card:translate-x-0.5 group-hover/form-card:opacity-100"
            fontSize="small"
          />
        </Box>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box className="min-w-0 flex-1">
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body1" className="font-semibold">
              {form.label}
            </Typography>
            {hideRowChips ? null : (
              <Chip size="small" label={form.formType} variant="outlined" />
            )}
          </Stack>
          <Typography variant="caption" className="mt-1 font-mono text-muted">
            {form.key}
          </Typography>
          {hideRowChips ? null : (
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
          )}
        </Box>
        <Typography variant="body2" className="hidden font-medium text-primary sm:inline">
          {actionLabel}
        </Typography>
        <ChevronRightOutlinedIcon className="text-muted" />
      </Stack>
    </Link>
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
  hideHero = false,
  editActionLabel = mode === 'platform' ? 'Edit baseline' : 'Extend',
  filterExtendableOnly = mode === 'org',
  manageableOnly = true,
  canEdit = true,
  hideModuleFilters = false,
  hideRowChips = false,
  listLayout = 'list',
}: FormsRegistryListProps) {
  const [moduleFilter, setModuleFilter] = useState<FormModule | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleForms = useMemo(() => {
    let filtered = applyRegistryScope(forms, manageableOnly, filterExtendableOnly);

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
  }, [filterExtendableOnly, forms, manageableOnly, moduleFilter, searchQuery]);

  const stats = useMemo(() => {
    const source = applyRegistryScope(forms, manageableOnly, filterExtendableOnly);

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
  }, [filterExtendableOnly, forms, manageableOnly, mode]);

  const moduleCounts = useMemo(() => {
    if (hideModuleFilters) {
      return new Map<FormModule, number>();
    }

    const source = applyRegistryScope(forms, manageableOnly, filterExtendableOnly);
    const counts = new Map<FormModule, number>();

    for (const formModule of MODULE_ORDER) {
      counts.set(formModule, 0);
    }

    for (const form of source) {
      counts.set(form.module, (counts.get(form.module) ?? 0) + 1);
    }

    return counts;
  }, [filterExtendableOnly, forms, hideModuleFilters, manageableOnly]);

  const hasActiveFilters =
    (!hideModuleFilters && moduleFilter !== 'all') || searchQuery.trim().length > 0;

  if (errorMessage) {
    return (
      <Alert severity="error" className="rounded-2xl">
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {hideHero ? null : (
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
            {heroDescription ? (
              <Typography variant="body1" color="text.secondary" className="mt-3 max-w-2xl">
                {heroDescription}
              </Typography>
            ) : null}
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
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'flex-end' }}
      >
        {hideModuleFilters ? null : (
          <Stack direction="row" spacing={1} className="flex-wrap md:mr-auto">
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
        )}

        <TextField
          size="small"
          placeholder="Search by label or key..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="min-w-[240px]"
        />
      </Stack>

      {isLoading ? (
        listLayout === 'grid' ? (
          <Box className={FORM_GRID_CLASS}>
            {Array.from({ length: 8 }).map((_, index) => (
              <FormGridCardSkeleton key={index} />
            ))}
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, index) => (
              <FormRowSkeleton key={index} />
            ))}
          </Stack>
        )
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
      ) : listLayout === 'grid' ? (
        <Box className={FORM_GRID_CLASS}>
          {visibleForms.map((form) => (
            <FormRegistryCard
              key={form.key}
              form={form}
              href={buildEditHref(form.key)}
              mode={mode}
              layout="grid"
              hideRowChips={hideRowChips}
              canEdit={canEdit}
              editActionLabel={editActionLabel}
            />
          ))}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {visibleForms.map((form) => (
            <FormRegistryCard
              key={form.key}
              form={form}
              href={buildEditHref(form.key)}
              mode={mode}
              layout="list"
              hideRowChips={hideRowChips}
              canEdit={canEdit}
              editActionLabel={editActionLabel}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
