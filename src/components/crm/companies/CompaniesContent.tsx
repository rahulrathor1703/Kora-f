'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import CrmBulkImportDialog from '@/components/crm/import/CrmBulkImportDialog';
import CrmHubShell from '@/components/crm/CrmHubShell';
import CompaniesTable from '@/components/crm/companies/CompaniesTable';
import CompaniesToolbar from '@/components/crm/companies/CompaniesToolbar';
import NewCompanyDialog from '@/components/crm/companies/NewCompanyDialog';
import {
  useCompanies,
  useCompanyFieldSchema,
  useCompanyMutations,
} from '@/hooks/useCompanies';
import { useCompanyConfigOptions } from '@/hooks/useCompanyConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import { getFilterableCompanyFields } from '@/lib/crm/companies/field-config';
import type { CreateCompanyInput } from '@/lib/crm/companies/types';

export default function CompaniesContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canCreate = useHasPermission('companies:create');
  const canCreateProspects = useHasPermission('prospects:create');
  const canManageFields = useHasPermission('companies:manage-fields');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [newOpen, setNewOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useCompanyFieldSchema();
  const { options: categories } = useCompanyConfigOptions('category');
  const { options: locations } = useCompanyConfigOptions('location');

  const fields = useMemo(() => fieldSchema?.fields ?? [], [fieldSchema]);
  const filterableFields = useMemo(
    () => getFilterableCompanyFields(fields),
    [fields],
  );

  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim().length > 0),
      ),
    [filters],
  );

  const {
    data: companiesPage,
    isLoading: isCompaniesLoading,
    refetch,
  } = useCompanies({
    q: search,
    page,
    pageSize,
    filters: activeFilters,
  });

  const { createCompany, isCreating } = useCompanyMutations();

  async function handleCreateCompany(input: CreateCompanyInput) {
    try {
      await createCompany(input);
      setNewOpen(false);
      await refetch();
      notifySuccess('Company created');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to create company'));
    }
  }

  const isLoading = isSchemaLoading || isCompaniesLoading;

  const headerActions = (
    <Stack direction="row" spacing={1} className="flex-wrap">
      {canManageFields ? (
        <Button
          component={Link}
          href={toOrgPath('/crm/companies/fields')}
          variant="outlined"
          startIcon={<SettingsOutlinedIcon />}
        >
          Manage fields
        </Button>
      ) : null}
      {canCreate || canCreateProspects ? (
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={() => setBulkImportOpen(true)}
        >
          Bulk Upload
        </Button>
      ) : null}
      {canCreate ? (
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setNewOpen(true)}
        >
          New Company
        </Button>
      ) : null}
    </Stack>
  );

  return (
    <CrmHubShell actions={headerActions}>
      <Stack spacing={3}>
        <CompaniesToolbar
          search={search}
          filters={filters}
          filterableFields={filterableFields}
          categories={categories.filter((option) => option.isActive)}
          locations={locations.filter((option) => option.isActive)}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onFilterChange={(key, value) => {
            setFilters((current) => ({ ...current, [key]: value }));
            setPage(1);
          }}
          onClearAllFilters={() => {
            setFilters({});
            setPage(1);
          }}
        />

        <CompaniesTable
          companies={companiesPage?.items ?? []}
          fields={fields}
          categories={categories}
          locations={locations}
          isLoading={isLoading}
          total={companiesPage?.total ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
          onRowClick={(company) =>
            router.push(toOrgPath(`/crm/companies/${company.id}`))
          }
        />
      </Stack>

      {newOpen && fields.length > 0 ? (
        <NewCompanyDialog
          open={newOpen}
          fields={fields}
          categories={categories}
          locations={locations}
          isSubmitting={isCreating}
          onClose={() => setNewOpen(false)}
          onSubmit={handleCreateCompany}
        />
      ) : null}

      <CrmBulkImportDialog
        open={bulkImportOpen}
        defaultEntityType="company"
        onClose={() => setBulkImportOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />
    </CrmHubShell>
  );
}
