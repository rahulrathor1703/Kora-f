'use client';

import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import AddCampaignCustomFieldForm from '@/components/email/campaigns/shared/AddCampaignCustomFieldForm';
import ConfigSelectWithCreateField from '@/components/email/campaigns/shared/ConfigSelectWithCreateField';
import CustomFieldSelectWithCreate from '@/components/email/campaigns/shared/CustomFieldSelectWithCreate';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import { useCampaignCustomFields } from '@/hooks/useCampaignCustomFields';
import { useEmailConfigOptions } from '@/hooks/useEmailConfigOptions';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getEmailConfigCategoryMeta } from '@/lib/email/settings-navigation';
import type { CampaignCustomFieldType } from '@/lib/email/campaigns/custom-field-types';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export interface CampaignAdvancedFieldValues {
  type: string;
  brand: string;
  region: string;
  customFieldValues: Record<string, string>;
}

interface CampaignAdvancedFieldsDrawerBaseProps {
  open: boolean;
  onClose: () => void;
}

interface WizardDrawerProps extends CampaignAdvancedFieldsDrawerBaseProps {
  mode: 'wizard';
}

interface CampaignDrawerProps extends CampaignAdvancedFieldsDrawerBaseProps {
  mode: 'campaign';
  initialValues: CampaignAdvancedFieldValues;
  sessionKey: number;
  onSave: (values: CampaignAdvancedFieldValues) => Promise<void>;
  isSaving?: boolean;
}

type CampaignAdvancedFieldsDrawerProps = WizardDrawerProps | CampaignDrawerProps;

function useActiveOptions() {
  const {
    options: typeOptions,
    isLoading: isLoadingTypes,
    error: typeError,
  } = useEmailConfigOptions('campaign-type');
  const {
    options: brandOptions,
    isLoading: isLoadingBrands,
    error: brandError,
  } = useEmailConfigOptions('brand');
  const {
    options: regionOptions,
    isLoading: isLoadingRegions,
    error: regionError,
  } = useEmailConfigOptions('region');

  return {
    campaignTypes: typeOptions
      .filter((option) => option.isActive)
      .map((option) => ({ id: option.id, label: option.label })),
    brands: brandOptions
      .filter((option) => option.isActive)
      .map((option) => ({ id: option.id, label: option.label })),
    regions: regionOptions
      .filter((option) => option.isActive)
      .map((option) => ({ id: option.id, label: option.label })),
    isLoadingTypes,
    isLoadingBrands,
    isLoadingRegions,
    configError: typeError ?? brandError ?? regionError,
    typeError,
    brandError,
    regionError,
  };
}

export function AdvancedFieldsForm({
  values,
  onChange,
  onCustomFieldChange,
}: {
  values: CampaignAdvancedFieldValues;
  onChange: (field: 'type' | 'brand' | 'region', value: string) => void;
  onCustomFieldChange: (fieldDefinitionId: string, value: string) => void;
}) {
  const toOrgPath = useOrgPath();
  const {
    campaignTypes,
    brands,
    regions,
    isLoadingTypes,
    isLoadingBrands,
    isLoadingRegions,
    configError,
    typeError,
    brandError,
    regionError,
  } = useActiveOptions();
  const {
    definitions,
    isLoading: isLoadingCustomFields,
    isCreatingDefinition,
    isCreatingOption,
    error: customFieldsError,
    createDefinition,
    createOption,
  } = useCampaignCustomFields();

  async function handleCreateDefinition(input: {
    label: string;
    type: CampaignCustomFieldType;
  }) {
    await createDefinition(input);
  }

  return (
    <Stack spacing={3}>
      {configError ? (
        <Alert severity="error" className="rounded-2xl">
          {configError}
        </Alert>
      ) : null}

      <ConfigSelectWithCreateField
        category="campaign-type"
        label="Type"
        htmlFor="advanced-type"
        value={values.type}
        onChange={(nextValue) => onChange('type', nextValue)}
        options={campaignTypes}
        isLoading={isLoadingTypes}
        isError={Boolean(typeError)}
        settingsHref={toOrgPath(getEmailConfigCategoryMeta('campaign-type').href)}
        placeholder="Select type"
        emptyMessage="No campaign types yet. Add one below or skip for now."
      />

      <ConfigSelectWithCreateField
        category="brand"
        label="Brand"
        htmlFor="advanced-brand"
        value={values.brand}
        onChange={(nextValue) => onChange('brand', nextValue)}
        options={brands}
        isLoading={isLoadingBrands}
        isError={Boolean(brandError)}
        settingsHref={toOrgPath(getEmailConfigCategoryMeta('brand').href)}
        placeholder="Select brand"
        emptyMessage="No brands yet. Add one below or skip for now."
      />

      <ConfigSelectWithCreateField
        category="region"
        label="Region"
        htmlFor="advanced-region"
        value={values.region}
        onChange={(nextValue) => onChange('region', nextValue)}
        options={regions}
        isLoading={isLoadingRegions}
        isError={Boolean(regionError)}
        settingsHref={toOrgPath(getEmailConfigCategoryMeta('region').href)}
        placeholder="Select region"
        emptyMessage="No regions yet. Add one below or skip for now."
      />

      <Divider />

      <Box>
        <Typography variant="subtitle2" className="font-semibold">
          Custom fields
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Add organization-specific fields for this campaign.
        </Typography>
      </Box>

      {customFieldsError ? (
        <Alert severity="error" className="rounded-2xl">
          {customFieldsError}
        </Alert>
      ) : null}

      {isLoadingCustomFields ? (
        <Typography variant="body2" color="text.secondary">
          Loading custom fields…
        </Typography>
      ) : (
        definitions.map((definition) =>
          definition.type === 'select' ? (
            <CustomFieldSelectWithCreate
              key={definition.id}
              definition={definition}
              value={values.customFieldValues[definition.id] ?? ''}
              onChange={(nextValue) => onCustomFieldChange(definition.id, nextValue)}
              onCreateOption={(label) => createOption(definition.id, { label })}
              isCreating={isCreatingOption}
            />
          ) : (
            <Box key={definition.id}>
              <WizardFieldLabel htmlFor={`advanced-custom-text-${definition.id}`}>
                {definition.label}
              </WizardFieldLabel>
              <TextField
                id={`advanced-custom-text-${definition.id}`}
                fullWidth
                value={values.customFieldValues[definition.id] ?? ''}
                onChange={(event) =>
                  onCustomFieldChange(definition.id, event.target.value)
                }
                placeholder={`Enter ${definition.label.toLowerCase()}`}
                className="rounded-xl"
              />
            </Box>
          ),
        )
      )}

      <AddCampaignCustomFieldForm
        onCreateDefinition={handleCreateDefinition}
        isCreating={isCreatingDefinition}
      />
    </Stack>
  );
}

function WizardAdvancedFieldsDrawer({
  open,
  onClose,
}: CampaignAdvancedFieldsDrawerBaseProps) {
  const { watch, setValue } = useFormContext<CampaignWizardFormValues>();
  const formValues = watch();

  const values: CampaignAdvancedFieldValues = {
    type: formValues.type ?? '',
    brand: formValues.brand ?? '',
    region: formValues.region ?? '',
    customFieldValues: formValues.customFieldValues ?? {},
  };

  function handleChange(field: 'type' | 'brand' | 'region', value: string) {
    setValue(field, value, { shouldDirty: true });
  }

  function handleCustomFieldChange(fieldDefinitionId: string, value: string) {
    setValue(
      'customFieldValues',
      {
        ...(formValues.customFieldValues ?? {}),
        [fieldDefinitionId]: value,
      },
      { shouldDirty: true },
    );
  }

  function handleSave() {
    onClose();
  }

  return (
    <DrawerShell open={open} onClose={onClose} onSave={handleSave}>
      <AdvancedFieldsForm
        values={values}
        onChange={handleChange}
        onCustomFieldChange={handleCustomFieldChange}
      />
    </DrawerShell>
  );
}

function CampaignAdvancedFieldsDrawerSession({
  open,
  onClose,
  initialValues,
  onSave,
  isSaving = false,
}: CampaignDrawerProps) {
  const [values, setValues] = useState<CampaignAdvancedFieldValues>(initialValues);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleChange(field: 'type' | 'brand' | 'region', value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleCustomFieldChange(fieldDefinitionId: string, value: string) {
    setValues((current) => ({
      ...current,
      customFieldValues: {
        ...current.customFieldValues,
        [fieldDefinitionId]: value,
      },
    }));
  }

  async function handleSave() {
    setSaveError(null);

    try {
      await onSave(values);
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save advanced fields. Please try again.',
      );
    }
  }

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onSave={() => void handleSave()}
      isSaving={isSaving}
      saveError={saveError}
    >
      <AdvancedFieldsForm
        values={values}
        onChange={handleChange}
        onCustomFieldChange={handleCustomFieldChange}
      />
    </DrawerShell>
  );
}

function CampaignAdvancedFieldsDrawerContent(props: CampaignDrawerProps) {
  if (!props.open) {
    return null;
  }

  return (
    <CampaignAdvancedFieldsDrawerSession key={props.sessionKey} {...props} />
  );
}

function DrawerShell({
  open,
  onClose,
  onSave,
  isSaving = false,
  saveError,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  children: React.ReactNode;
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className="flex h-full w-full max-w-md flex-col p-6">
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
        >
          <Box>
            <Typography variant="h6" className="font-bold">
              Advanced
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Optional campaign classification
            </Typography>
          </Box>
          <IconButton aria-label="Close advanced fields" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box className="flex-1 overflow-y-auto">{children}</Box>

        {saveError ? (
          <Alert severity="error" className="mt-4 rounded-2xl">
            {saveError}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1.5} className="mt-6 justify-end">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl normal-case"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl normal-case shadow-none"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function CampaignAdvancedFieldsDrawer(
  props: CampaignAdvancedFieldsDrawerProps,
) {
  if (props.mode === 'wizard') {
    return <WizardAdvancedFieldsDrawer open={props.open} onClose={props.onClose} />;
  }

  return <CampaignAdvancedFieldsDrawerContent {...props} />;
}

export function countFilledAdvancedFields(values: CampaignAdvancedFieldValues): number {
  const builtInCount = [values.type, values.brand, values.region].filter(Boolean).length;
  const customCount = Object.values(values.customFieldValues ?? {}).filter((value) =>
    value.trim(),
  ).length;

  return builtInCount + customCount;
}
