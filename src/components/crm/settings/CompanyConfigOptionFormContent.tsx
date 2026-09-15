'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import SettingsSubPageNav from '@/components/settings/SettingsSubPageNav';
import FormAlert from '@/components/ui/FormAlert';
import {
  useCompanyConfigOption,
  useCompanyConfigOptions,
} from '@/hooks/useCompanyConfigOptions';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { CompanyConfigCategory } from '@/lib/crm/companies/types';
import { getCompanyConfigCategoryMeta } from '@/lib/crm/settings-navigation';
import {
  companyConfigOptionFormSchema,
  slugifyLabel,
  type CompanyConfigOptionFormValues,
} from '@/lib/schemas/company-config-option';

interface CompanyConfigOptionFormContentProps {
  mode: 'create' | 'edit';
  category: CompanyConfigCategory;
  optionId?: string;
}

export default function CompanyConfigOptionFormContent({
  mode,
  category,
  optionId,
}: CompanyConfigOptionFormContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const meta = getCompanyConfigCategoryMeta(category);
  const [valueTouched, setValueTouched] = useState(mode === 'edit');
  const {
    createOption,
    updateOption,
    isCreating,
    isUpdating,
    error: mutationError,
  } = useCompanyConfigOptions(category);
  const {
    data: option,
    isLoading: isLoadingOption,
    error: fetchError,
  } = useCompanyConfigOption(mode === 'edit' ? (optionId ?? null) : null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CompanyConfigOptionFormValues>({
    resolver: zodResolver(companyConfigOptionFormSchema),
    defaultValues: {
      label: '',
      value: '',
      isActive: true,
      sortOrder: 0,
    },
  });

  const watchedLabel = useWatch({ control, name: 'label' }) ?? '';

  useEffect(() => {
    if (mode === 'edit' && option) {
      reset({
        label: option.label,
        value: option.value,
        isActive: option.isActive,
        sortOrder: option.sortOrder,
      });
    }
  }, [mode, option, reset]);

  useEffect(() => {
    if (mode === 'create' && !valueTouched) {
      setValue('value', slugifyLabel(watchedLabel), { shouldDirty: true });
    }
  }, [mode, valueTouched, watchedLabel, setValue]);

  async function onSubmit(values: CompanyConfigOptionFormValues) {
    const payload = {
      label: values.label.trim(),
      value: values.value.trim() || slugifyLabel(values.label),
      isActive: values.isActive,
      sortOrder: values.sortOrder,
    };

    try {
      if (mode === 'create') {
        await createOption({
          category,
          ...payload,
        });
      } else if (optionId) {
        await updateOption(optionId, payload);
      }

      router.push(toOrgPath(meta.href));
    } catch {
      // error surfaced via hook
    }
  }

  const isSubmitting = isCreating || isUpdating;
  const pageTitle =
    mode === 'create'
      ? `Create ${meta.label.toLowerCase()}`
      : `Edit ${meta.label.toLowerCase()}`;

  if (mode === 'edit' && isLoadingOption) {
    return (
      <Box className="flex items-center gap-2 py-10 text-text-secondary">
        <CircularProgress size={20} />
        <Typography variant="body2">Loading option…</Typography>
      </Box>
    );
  }

  if (mode === 'edit' && fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline={meta.pluralLabel}
        title={pageTitle}
        description={`Configure a ${meta.label.toLowerCase()} option for company records.`}
        parentBack={{ href: meta.href, label: meta.pluralLabel }}
        showPlatformBackLink={false}
      />

      <SettingsSubPageNav
        parentBack={{ href: meta.href, label: meta.pluralLabel }}
        showPlatformBackLink={false}
        className="md:hidden"
      />

      {mutationError ? <FormAlert message={mutationError} /> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-5 md:p-8">
          <Box
            component="form"
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            className="max-w-2xl"
          >
            <Stack spacing={3}>
              <Controller
                name="label"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Label"
                    fullWidth
                    required
                    error={Boolean(errors.label)}
                    helperText={errors.label?.message ?? 'Display name in dropdowns'}
                  />
                )}
              />

              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Value slug"
                    fullWidth
                    error={Boolean(errors.value)}
                    helperText={
                      errors.value?.message ??
                      'Lowercase identifier used internally (auto-generated from label)'
                    }
                    onChange={(event) => {
                      setValueTouched(true);
                      field.onChange(event);
                    }}
                  />
                )}
              />

              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sort order"
                    type="number"
                    fullWidth
                    error={Boolean(errors.sortOrder)}
                    helperText={errors.sortOrder?.message ?? 'Lower numbers appear first'}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value) || 0)
                    }
                  />
                )}
              />

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    }
                    label="Active"
                  />
                )}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || (mode === 'edit' && !isDirty)}
                  className="rounded-2xl px-6"
                >
                  {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
                </Button>
                <Button
                  component={Link}
                  href={toOrgPath(meta.href)}
                  variant="outlined"
                  className="rounded-2xl px-6"
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
