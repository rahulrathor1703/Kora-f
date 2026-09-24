'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CompanyDetailHeader from '@/components/crm/companies/detail/CompanyDetailHeader';
import CompanyOverviewTab from '@/components/crm/companies/detail/CompanyOverviewTab';
import {
  useCompany,
  useCompanyFieldSchema,
  useCompanyMutations,
} from '@/hooks/useCompanies';
import { useCompanyConfigOptions } from '@/hooks/useCompanyConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { UpdateCompanyInput } from '@/lib/crm/companies/types';

interface CompanyDetailContentProps {
  companyId: string;
}

export default function CompanyDetailContent({
  companyId,
}: CompanyDetailContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canUpdate = useHasPermission('companies:update');
  const canDelete = useHasPermission('companies:delete');
  const { data: company, error, isLoading, refetch } = useCompany(companyId);
  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useCompanyFieldSchema();
  const { options: categories } = useCompanyConfigOptions('category');
  const { options: locations } = useCompanyConfigOptions('location');
  const { updateCompany, deleteCompany, isUpdating, isDeleting } =
    useCompanyMutations();

  const [directDeleteOpen, setDirectDeleteOpen] = useState(false);

  const fields = useMemo(() => fieldSchema?.fields ?? [], [fieldSchema]);

  async function handleOverviewSave(input: UpdateCompanyInput) {
    try {
      await updateCompany(companyId, input);
      await refetch();
      notifySuccess('Company updated');
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Failed to save company'));
      throw saveError;
    }
  }

  async function handleDirectDeleteConfirm() {
    try {
      await deleteCompany(companyId);
      notifySuccess('Company deleted');
      router.push(toOrgPath('/crm/companies'));
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to delete company'));
    }
  }

  if (error && !isLoading) {
    return (
      <Stack spacing={3}>
        <CompanyDetailHeader
          company={null}
          categories={categories}
          locations={locations}
          isLoading={false}
        />
        <Alert severity="error" className="rounded-2xl">
          {error}
        </Alert>
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              Company not found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              This company may have been removed or you may not have access to
              view it.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <CompanyDetailHeader
          company={company ?? null}
          categories={categories}
          locations={locations}
          isLoading={isLoading || isSchemaLoading}
        />
        {company && !isLoading && canDelete ? (
          <Stack direction="row" spacing={1} className="flex-wrap">
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDirectDeleteOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        ) : null}
      </Stack>

      {company ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-5 md:p-6">
            <CompanyOverviewTab
              company={company}
              fields={fields}
              categories={categories}
              locations={locations}
              canUpdate={canUpdate}
              isSaving={isUpdating}
              onSave={handleOverviewSave}
            />
          </CardContent>
        </Card>
      ) : isLoading || isSchemaLoading ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-6">
            <Typography variant="body2" color="text.secondary">
              Loading company details…
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={directDeleteOpen}
        onClose={() => setDirectDeleteOpen(false)}
        onConfirm={() => void handleDirectDeleteConfirm()}
        variant="destructive"
        title="Delete company"
        description={
          <>
            Permanently delete{' '}
            <strong>{company?.brokerName || 'this company'}</strong>? This
            action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </Stack>
  );
}
