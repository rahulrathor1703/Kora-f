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
import {
  useFormMutations,
  usePlatformFormRegistry,
  usePlatformFormSchema,
} from '@/hooks/useForms';
import { getApiErrorMessage } from '@/lib/api';
import {
  areFormSchemasEqual,
  areTableColumnsEqual,
} from '@/lib/forms/schema-compare';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

interface PlatformFormEditorContentProps {
  formKey: string;
}

export default function PlatformFormEditorContent({
  formKey,
}: PlatformFormEditorContentProps) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotify();
  const { data, isLoading, error } = usePlatformFormSchema(formKey);
  const { data: registryData } = usePlatformFormRegistry();
  const {
    updatePlatformSchema,
    publishPlatformSchema,
    isUpdatingPlatform,
    isPublishingPlatform,
  } = useFormMutations(formKey);

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

  async function handleSaveDraft(input: UpdateFormSchemaInput) {
    try {
      await updatePlatformSchema(input);
      notifySuccess(
        activeTab === 'tables'
          ? 'Draft table columns saved'
          : 'Draft layout saved — publish when ready for organizations',
      );
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to save draft'));
    }
  }

  async function handlePublish() {
    try {
      if (editorState?.hasChanges) {
        await editorState.save();
      }

      await publishPlatformSchema();
      notifySuccess('Form published — organizations will see this layout');
    } catch (publishError) {
      notifyError(getApiErrorMessage(publishError, 'Unable to publish form'));
    }
  }

  function handleShellSaveDraft() {
    if (!editorState) {
      return;
    }
    void editorState.save();
  }

  function handleShellDiscard() {
    editorState?.discard();
  }

  function handleNavigateToFormKey(nextFormKey: string) {
    router.push(`/platform/forms/${encodeURIComponent(nextFormKey)}`);
  }

  const hasUnpublishedDraft = useMemo(() => {
    if (!data) {
      return false;
    }

    if (data.hasUnpublishedChanges) {
      return true;
    }

    if (data.publishedFields?.length) {
      if (!areFormSchemasEqual(data.fields, data.publishedFields)) {
        return true;
      }
    }

    if (supportsTableColumns && data.publishedTableColumns) {
      if (
        !areTableColumnsEqual(
          data.tableColumns ?? [],
          data.publishedTableColumns,
        )
      ) {
        return true;
      }
    }

    return false;
  }, [data, supportsTableColumns]);

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
      scope="platform"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      supportsTableColumns={supportsTableColumns}
      hasUnsavedChanges={editorState?.hasChanges ?? false}
      hasUnpublishedDraft={hasUnpublishedDraft}
      isSubmitting={isUpdatingPlatform}
      isPublishing={isPublishingPlatform}
      onNavigateToFormKey={handleNavigateToFormKey}
      onDiscard={handleShellDiscard}
      onSave={handleShellSaveDraft}
      onPublish={() => void handlePublish()}
    >
      {activeTab === 'tables' && supportsTableColumns ? (
        <FormTableColumnsEditor
          key={`tables-${formKey}-${data.version ?? 0}-${data.publishedVersion ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          tableColumns={data.tableColumns ?? []}
          mode="platform"
          version={data.version}
          isSubmitting={isUpdatingPlatform}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push('/platform/forms')}
          onSubmit={handleSaveDraft}
        />
      ) : (
        <FormSchemaEditor
          key={`fields-${formKey}-${data.version ?? 0}-${data.publishedVersion ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          mode="platform"
          schemaVersion={data.version}
          layoutMode="modules"
          view={schemaView}
          isSubmitting={isUpdatingPlatform}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push('/platform/forms')}
          onSubmit={handleSaveDraft}
        />
      )}
    </FormModulesEditorShell>
  );
}
