'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import CrmHubShell from '@/components/crm/CrmHubShell';
import NewProspectForm from '@/components/crm/prospects/NewProspectForm';
import { useCompanyFieldSchema, useCompanyMutations } from '@/hooks/useCompanies';
import { useCompanyConfigOptions } from '@/hooks/useCompanyConfigOptions';
import { useHasAnyPermission, useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import {
  useProspectFieldSchema,
  useProspectMutations,
} from '@/hooks/useProspects';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type {
  CreateProspectInput,
  ProspectFieldDefinition,
} from '@/lib/crm/prospects/types';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { getFieldsForLiveCreateForm } from '@/lib/forms/layout-canvas-fields.utils';

export default function NewProspectContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canCreate = useHasPermission('prospects:create');
  const canCreateContactProspect = useHasPermission('prospects:create');
  const canAccessProspectList = useHasAnyPermission([
    'prospects:read',
    'companies:create',
  ]);
  const prospectsPath = toOrgPath('/crm/prospectus');

  const { data: fieldSchema, isLoading } = useProspectFieldSchema();
  const { data: companyFieldSchema } = useCompanyFieldSchema();
  const { options: companyCategories } = useCompanyConfigOptions('category');
  const { options: companyLocations } = useCompanyConfigOptions('location');
  const { createProspect, createProspectStub, isCreating, isCreatingStub } =
    useProspectMutations();
  const { createCompany, isCreating: isCreatingCompany } = useCompanyMutations();

  const companyContactProspect = useMemo(
    () => ({
      canAccessProspectList,
      canCreateContactProspect,
      isCreatingContactProspectStub: isCreatingStub,
      onCreateContactProspectStub: (displayName: string) =>
        createProspectStub({ displayName }),
    }),
    [
      canAccessProspectList,
      canCreateContactProspect,
      createProspectStub,
      isCreatingStub,
    ],
  );

  const createFormFields: ProspectFieldDefinition[] = fieldSchema
    ? (getFieldsForLiveCreateForm(
        CRM_PROSPECT_CREATE_FORM_KEY,
        fieldSchema.fields,
      ) as ProspectFieldDefinition[])
    : [];

  const companyFields = useMemo(
    () => companyFieldSchema?.fields ?? [],
    [companyFieldSchema?.fields],
  );

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

  async function handleSubmit(input: CreateProspectInput) {
    try {
      const prospect = await createProspect(input);
      notifySuccess('Prospect created');
      router.push(toOrgPath(`/crm/prospects/${prospect.id}?from=prospectus`));
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to create prospect'));
    }
  }

  if (!canCreate) {
    return (
      <CrmHubShell actions={headerActions}>
        <Alert severity="warning" className="rounded-2xl">
          You do not have permission to create prospects.
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
          Loading form...
        </Typography>
      </CrmHubShell>
    );
  }

  return (
    <CrmHubShell actions={headerActions}>
      <NewProspectForm
        fields={createFormFields}
        layoutFields={fieldSchema.fields}
        isSubmitting={isCreating}
        companyFields={companyFields}
        companyCategories={companyCategories}
        companyLocations={companyLocations}
        isCreatingCompany={isCreatingCompany}
        onCreateCompany={createCompany}
        companyContactProspect={companyContactProspect}
        onCancel={() => router.push(prospectsPath)}
        onSubmit={handleSubmit}
      />
    </CrmHubShell>
  );
}
