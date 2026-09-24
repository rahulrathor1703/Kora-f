'use client';

import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { FormEditorState } from '@/components/forms/form-editor-state';
import FormModulesEditorShell, {
  type FormModulesEditorTab,
} from '@/components/forms/FormModulesEditorShell';
import FormSchemaEditor from '@/components/forms/FormSchemaEditor';
import FormTableColumnsEditor from '@/components/forms/FormTableColumnsEditor';
import { useNotify } from '@/hooks/useNotify';
import { useFormMutations, useFormRegistry, useFormSchema } from '@/hooks/useForms';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

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
  const [activeTab, setActiveTab] = useState<FormModulesEditorTab>('layout');
  const [editorState, setEditorState] = useState<FormEditorState | null>(null);

  const handleEditorStateChange = useCallback((state: FormEditorState | null) => {
    setEditorState(state);
  }, []);

  async function handleSave(input: UpdateFormSchemaInput) {
    try {
      await updateOrgSchema(input);
      await refetch();
      notifySuccess(
        activeTab === 'tables' ? 'Table columns saved' : 'Form layout saved',
      );
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to save form extensions'));
    }
  }

  function handleShellSave() {
    if (!editorState) {
      return;
    }
    void editorState.save();
  }

  function handleShellDiscard() {
    editorState?.discard();
  }

  function handleNavigateToFormKey(nextFormKey: string) {
    router.push(toOrgPath(`/settings/forms/${encodeURIComponent(nextFormKey)}`));
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

  const schemaView =
    activeTab === 'summary' ? ('summary' as const) : ('layout' as const);

  return (
    <FormModulesEditorShell
      formKey={formKey}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      supportsTableColumns={supportsTableColumns}
      hasUnsavedChanges={editorState?.hasChanges ?? false}
      readOnly={!canUpdate}
      isSubmitting={isUpdatingOrg}
      onNavigateToFormKey={handleNavigateToFormKey}
      onDiscard={handleShellDiscard}
      onSave={handleShellSave}
    >
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
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
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
          layoutMode="modules"
          view={schemaView}
          isSubmitting={isUpdatingOrg}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push(toOrgPath('/settings/forms'))}
          onSubmit={handleSave}
        />
      )}
    </FormModulesEditorShell>
  );
}
