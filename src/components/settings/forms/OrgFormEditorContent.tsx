'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import FormEditorShell from '@/components/forms/FormEditorShell';
import FormSchemaEditor from '@/components/forms/FormSchemaEditor';
import FormTableColumnsEditor from '@/components/forms/FormTableColumnsEditor';
import { useNotify } from '@/hooks/useNotify';
import { useFormMutations, useFormRegistry, useFormSchema } from '@/hooks/useForms';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

type FormEditorTab = 'fields' | 'tables';

interface OrgFormEditorContentProps {
  formKey: string;
}

export default function OrgFormEditorContent({ formKey }: OrgFormEditorContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canUpdate = useHasPermission('forms:update');
  const { data, isLoading, error, refetch } = useFormSchema(formKey);
  const { data: registryData } = useFormRegistry();
  const { updateOrgSchema, isUpdatingOrg } = useFormMutations(formKey);

  const registryItem = useMemo(
    () => registryData?.forms.find((form) => form.key === formKey),
    [formKey, registryData?.forms],
  );

  const supportsTableColumns = registryItem?.supportsTableColumns ?? false;
  const [activeTab, setActiveTab] = useState<FormEditorTab>(
    supportsTableColumns ? 'tables' : 'fields',
  );

  async function handleSave(input: UpdateFormSchemaInput) {
    try {
      await updateOrgSchema(input);
      await refetch();
      notifySuccess(
        activeTab === 'tables' ? 'Table columns saved' : 'Form extensions saved',
      );
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to save form extensions'));
    }
  }

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading form schema...
      </Typography>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error" className="rounded-2xl">
        Unable to load form schema.
      </Alert>
    );
  }

  return (
    <FormEditorShell
      mode="org"
      formKey={formKey}
      formLabel={registryItem?.label ?? formKey}
      formModule={registryItem?.module}
      formType={registryItem?.formType}
      fieldCount={data.fields.length}
      rootHref={toOrgPath('/settings')}
      rootLabel="Settings"
      listHref={toOrgPath('/settings/forms')}
      listLabel="Manage Forms"
    >
      {supportsTableColumns ? (
        <Box className="border-b border-border/60">
          <Tabs
            value={activeTab}
            onChange={(_event, nextTab: FormEditorTab) => setActiveTab(nextTab)}
            aria-label="Form editor sections"
          >
            <Tab value="fields" label="Fields" />
            <Tab value="tables" label="Tables" />
          </Tabs>
        </Box>
      ) : null}

      {activeTab === 'tables' && supportsTableColumns ? (
        <FormTableColumnsEditor
          key={`tables-${formKey}-${data.version ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          tableColumns={data.tableColumns ?? []}
          mode="org"
          readOnly={!canUpdate}
          version={data.version}
          isSubmitting={isUpdatingOrg}
          onCancel={() => router.push(toOrgPath('/settings/forms'))}
          onSubmit={handleSave}
        />
      ) : (
        <FormSchemaEditor
          key={`fields-${formKey}-${data.version ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          fieldKeysInUse={data.fieldKeysInUse}
          mode="org"
          readOnly={!canUpdate}
          isSubmitting={isUpdatingOrg}
          onCancel={() => router.push(toOrgPath('/settings/forms'))}
          onSubmit={handleSave}
        />
      )}
    </FormEditorShell>
  );
}
