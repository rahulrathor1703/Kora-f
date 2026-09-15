'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CrmHubShell from '@/components/crm/CrmHubShell';
import FormSchemaEditor from '@/components/forms/FormSchemaEditor';
import { useCompanyFieldSchema, useCompanyMutations } from '@/hooks/useCompanies';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';
import type { UpdateCompanyFieldSchemaInput } from '@/lib/crm/companies/types';

export default function ManageCompanyFieldsContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canManageFields = useHasPermission('companies:manage-fields');
  const companiesPath = toOrgPath('/crm/companies');

  const {
    data: fieldSchema,
    isLoading,
    refetch: refetchSchema,
  } = useCompanyFieldSchema();

  const { updateFieldSchema, isUpdatingSchema } = useCompanyMutations();

  const headerActions = (
    <Button
      component={Link}
      href={companiesPath}
      variant="outlined"
      startIcon={<ArrowBackIcon />}
    >
      Back to Companies
    </Button>
  );

  async function handleSave(input: UpdateFormSchemaInput) {
    try {
      await updateFieldSchema({
        fields: input.fields as UpdateCompanyFieldSchemaInput['fields'],
      });
      await refetchSchema();
      notifySuccess('Company fields saved');
      router.push(companiesPath);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to save field schema'));
    }
  }

  if (!canManageFields) {
    return (
      <CrmHubShell actions={headerActions}>
        <Alert severity="warning" className="rounded-2xl">
          You do not have permission to manage company fields.
        </Alert>
        <Button component={Link} href={companiesPath} className="mt-3">
          Back to Companies
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
      <FormSchemaEditor
        key={fieldSchema.updatedAt}
        formKey="crm.company.create"
        fields={fieldSchema.fields}
        fieldKeysInUse={fieldSchema.fieldKeysInUse}
        mode="org"
        isSubmitting={isUpdatingSchema}
        onCancel={() => router.push(companiesPath)}
        onSubmit={handleSave}
      />
    </CrmHubShell>
  );
}
