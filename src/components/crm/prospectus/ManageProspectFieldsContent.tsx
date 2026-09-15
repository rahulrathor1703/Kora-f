'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CrmHubShell from '@/components/crm/CrmHubShell';
import FormSchemaEditor from '@/components/forms/FormSchemaEditor';
import ManagePipelineFiltersEditor from '@/components/crm/pipeline/ManagePipelineFiltersEditor';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import {
  useProspectFieldSchema,
  useProspectMutations,
} from '@/hooks/useProspects';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';
import type { UpdateProspectFieldSchemaInput } from '@/lib/crm/prospects/types';

type ManageFieldsTab = 'fields' | 'pipeline-filters';

export default function ManageProspectFieldsContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canManageFields = useHasPermission('prospects:manage-fields');
  const prospectsPath = toOrgPath('/crm/prospectus');
  const [activeTab, setActiveTab] = useState<ManageFieldsTab>('fields');

  const {
    data: fieldSchema,
    isLoading,
    refetch: refetchSchema,
  } = useProspectFieldSchema();

  const { updateFieldSchema, isUpdatingSchema } = useProspectMutations();

  const headerActions = (
    <Button
      component={Link}
      href={prospectsPath}
      variant="outlined"
      startIcon={<ArrowBackIcon />}
    >
      Back to Prospects
    </Button>
  );

  async function handleSave(input: UpdateFormSchemaInput) {
    try {
      await updateFieldSchema({
        fields: input.fields as UpdateProspectFieldSchemaInput['fields'],
      });
      await refetchSchema();
      notifySuccess(
        activeTab === 'pipeline-filters'
          ? 'Pipeline filters saved'
          : 'Prospect fields saved',
      );
      router.push(prospectsPath);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to save field schema'));
    }
  }

  if (!canManageFields) {
    return (
      <CrmHubShell actions={headerActions}>
        <Alert severity="warning" className="rounded-2xl">
          You do not have permission to manage prospect fields.
        </Alert>
        <Button component={Link} href={prospectsPath} className="mt-3">
          Back to Prospects
        </Button>
      </CrmHubShell>
    );
  }

  if (isLoading || !fieldSchema) {
    return (
      <CrmHubShell actions={headerActions}>
        <Typography variant="body2" color="text.secondary">
          Loading field schema...
        </Typography>
      </CrmHubShell>
    );
  }

  return (
    <CrmHubShell actions={headerActions}>
      <Box className="border-b border-border/60">
        <Tabs
          value={activeTab}
          onChange={(_event, nextTab: ManageFieldsTab) => setActiveTab(nextTab)}
          aria-label="Manage prospect configuration"
        >
          <Tab value="fields" label="Fields" />
          <Tab value="pipeline-filters" label="Pipeline filters" />
        </Tabs>
      </Box>

      {activeTab === 'fields' ? (
        <FormSchemaEditor
          key={`fields-${fieldSchema.updatedAt}`}
          formKey="crm.prospect.create"
          fields={fieldSchema.fields}
          fieldKeysInUse={fieldSchema.fieldKeysInUse}
          mode="org"
          isSubmitting={isUpdatingSchema}
          onCancel={() => router.push(prospectsPath)}
          onSubmit={handleSave}
        />
      ) : (
        <ManagePipelineFiltersEditor
          key={`pipeline-filters-${fieldSchema.updatedAt}`}
          fields={fieldSchema.fields}
          isSubmitting={isUpdatingSchema}
          onCancel={() => router.push(prospectsPath)}
          onSubmit={handleSave}
        />
      )}
    </CrmHubShell>
  );
}
