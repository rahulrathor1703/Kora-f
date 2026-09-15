'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CrmHubShell from '@/components/crm/CrmHubShell';
import NewProspectForm from '@/components/crm/prospects/NewProspectForm';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import {
  useProspectFieldSchema,
  useProspectMutations,
} from '@/hooks/useProspects';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { CreateProspectInput } from '@/lib/crm/prospects/types';

export default function NewProspectContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canCreate = useHasPermission('prospects:create');
  const prospectsPath = toOrgPath('/crm/prospectus');

  const { data: fieldSchema, isLoading } = useProspectFieldSchema();
  const { createProspect, isCreating } = useProspectMutations();

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
      <Stack spacing={1} className="mb-1">
        <Typography variant="h6" className="font-bold">
          New Prospect
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new contact to CRM
        </Typography>
      </Stack>

      <NewProspectForm
        fields={fieldSchema.fields}
        isSubmitting={isCreating}
        onCancel={() => router.push(prospectsPath)}
        onSubmit={handleSubmit}
      />
    </CrmHubShell>
  );
}
