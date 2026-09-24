'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import CrmBulkImportDialog from '@/components/crm/import/CrmBulkImportDialog';
import CrmHubShell from '@/components/crm/CrmHubShell';
import CompaniesBulkSelectionBar from '@/components/crm/companies/CompaniesBulkSelectionBar';
import CompaniesTable from '@/components/crm/companies/CompaniesTable';
import CompaniesToolbar from '@/components/crm/companies/CompaniesToolbar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import NewCompanyDialog from '@/components/crm/companies/NewCompanyDialog';
import {
  useCompanies,
  useCompanyFieldSchema,
  useCompanyMutations,
} from '@/hooks/useCompanies';
import { useCompanyConfigOptions } from '@/hooks/useCompanyConfigOptions';
import { useHasAnyPermission, useHasPermission } from '@/hooks/useHasPermission';
import { useProspectMutations } from '@/hooks/useProspects';
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
  const canAccessProspectList = useHasAnyPermission([
    'prospects:read',
    'companies:create',
  ]);
  const canDelete = useHasPermission('companies:delete');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [newOpen, setNewOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [allMatching, setAllMatching] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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

  const {
    createCompany,
    isCreating,
    bulkDeleteCompanies,
    isBulkDeleting,
  } = useCompanyMutations();
  const { createProspectStub, isCreatingStub } = useProspectMutations();

  const contactProspect = useMemo(
    () => ({
      canAccessProspectList,
      canCreateContactProspect: canCreateProspects,
      isCreatingContactProspectStub: isCreatingStub,
      onCreateContactProspectStub: (displayName: string) =>
        createProspectStub({ displayName }),
    }),
    [
      canAccessProspectList,
      canCreateProspects,
      createProspectStub,
      isCreatingStub,
    ],
  );

  const companies = useMemo(
    () => companiesPage?.items ?? [],
    [companiesPage?.items],
  );
  const total = companiesPage?.total ?? 0;

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setAllMatching(false);
  }, []);

  const effectiveSelectedIds = useMemo(() => {
    if (!allMatching) {
      return selectedIds;
    }

    return new Set(companies.map((company) => company.id));
  }, [allMatching, companies, selectedIds]);

  const pageIds = useMemo(
    () => companies.map((company) => company.id),
    [companies],
  );

  const allPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) => allMatching || selectedIds.has(id));

  const somePageSelected =
    !allMatching && pageIds.some((id) => selectedIds.has(id));

  const selectedCount = allMatching ? total : selectedIds.size;

  const showBulkBar = canDelete && (selectedCount > 0 || allMatching);

  const showSelectAllMatchingPrompt =
    canDelete &&
    allPageSelected &&
    !allMatching &&
    total > companies.length;

  function handleTogglePageSelection() {
    if (allPageSelected) {
      setAllMatching(false);
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const id of pageIds) {
          next.delete(id);
        }
        return next;
      });
      return;
    }

    setAllMatching(false);
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of pageIds) {
        next.add(id);
      }
      return next;
    });
  }

  function handleToggleRow(rowId: string) {
    if (allMatching) {
      setAllMatching(false);
      setSelectedIds(new Set(pageIds.filter((id) => id !== rowId)));
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }

  const rowSelection = canDelete
    ? {
        selectedIds: effectiveSelectedIds,
        onToggleRow: handleToggleRow,
        headerCheckbox: {
          checked: allPageSelected,
          indeterminate: somePageSelected && !allPageSelected,
          onChange: handleTogglePageSelection,
        },
      }
    : undefined;

  async function handleConfirmBulkDelete() {
    try {
      const result = allMatching
        ? await bulkDeleteCompanies({
            selectAllMatching: true,
            q: search.trim() || undefined,
            filters: activeFilters,
          })
        : await bulkDeleteCompanies({ ids: [...selectedIds] });

      setBulkDeleteOpen(false);
      clearSelection();
      await refetch();
      const count = result.deletedCount;
      notifySuccess(
        count === 1 ? '1 company deleted' : `${count} companies deleted`,
      );
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to delete companies'));
    }
  }

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
            clearSelection();
            setSearch(value);
            setPage(1);
          }}
          onFilterChange={(key, value) => {
            clearSelection();
            setFilters((current) => ({ ...current, [key]: value }));
            setPage(1);
          }}
          onClearAllFilters={() => {
            clearSelection();
            setFilters({});
            setPage(1);
          }}
        />

        {showBulkBar ? (
          <CompaniesBulkSelectionBar
            selectedCount={selectedCount}
            allMatching={allMatching}
            pageCount={companies.length}
            totalMatching={total}
            showSelectAllMatchingPrompt={showSelectAllMatchingPrompt}
            onSelectAllMatching={() => setAllMatching(true)}
            onClearSelection={clearSelection}
            onDelete={() => setBulkDeleteOpen(true)}
            isDeleting={isBulkDeleting}
          />
        ) : null}

        <CompaniesTable
          companies={companies}
          fields={fields}
          categories={categories}
          locations={locations}
          isLoading={isLoading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            clearSelection();
            setPageSize(nextPageSize);
            setPage(1);
          }}
          onRowClick={(company) =>
            router.push(toOrgPath(`/crm/companies/${company.id}`))
          }
          rowSelection={rowSelection}
        />
      </Stack>

      {newOpen && fields.length > 0 ? (
        <NewCompanyDialog
          open={newOpen}
          fields={fields}
          categories={categories}
          locations={locations}
          isSubmitting={isCreating}
          contactProspect={contactProspect}
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

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => void handleConfirmBulkDelete()}
        variant="destructive"
        title="Delete companies"
        description={
          allMatching ? (
            <>
              Permanently delete all <strong>{total}</strong> companies matching
              your current search and filters? This cannot be undone.
            </>
          ) : (
            <>
              Permanently delete <strong>{selectedCount}</strong>{' '}
              {selectedCount === 1 ? 'company' : 'companies'}? This cannot be
              undone.
            </>
          )
        }
        confirmLabel="Delete"
        isLoading={isBulkDeleting}
      />
    </CrmHubShell>
  );
}
