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
import {
  useFormMutations,
  usePlatformFormRegistry,
  usePlatformFormSchema,
} from '@/hooks/useForms';
import { getApiErrorMessage } from '@/lib/api';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

type FormEditorTab = 'fields' | 'tables';

interface PlatformFormEditorContentProps {
  formKey: string;
}

export default function PlatformFormEditorContent({
  formKey,
}: PlatformFormEditorContentProps) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotify();
  const { data, isLoading, error, refetch } = usePlatformFormSchema(formKey);
  const { data: registryData } = usePlatformFormRegistry();
  const { updatePlatformSchema, isUpdatingPlatform } = useFormMutations(formKey);

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
      await updatePlatformSchema(input);
      await refetch();
      notifySuccess(
        activeTab === 'tables'
          ? 'Platform table columns saved'
          : 'Platform form baseline saved',
      );
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to save form schema'));
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
      mode="platform"
      formKey={formKey}
      formLabel={registryItem?.label ?? formKey}
      formModule={registryItem?.module}
      formType={registryItem?.formType}
      fieldCount={data.fields.length}
      rootHref="/platform"
      rootLabel="Platform"
      listHref="/platform/forms"
      listLabel="Forms"
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
          mode="platform"
          version={data.version}
          isSubmitting={isUpdatingPlatform}
          onCancel={() => router.push('/platform/forms')}
          onSubmit={handleSave}
        />
      ) : (
        <FormSchemaEditor
          key={`fields-${formKey}-${data.version ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          mode="platform"
          isSubmitting={isUpdatingPlatform}
          onCancel={() => router.push('/platform/forms')}
          onSubmit={handleSave}
        />
      )}
    </FormEditorShell>
  );
}
