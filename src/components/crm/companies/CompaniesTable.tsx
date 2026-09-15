'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useMemo } from 'react';
import DataTable from '@/components/data-table/DataTable';
import DataTablePagination from '@/components/data-table/DataTablePagination';
import { renderCompanyTableCell } from '@/components/crm/companies/company-field-renderers';
import {
  flattenCompanyForTable,
  getCompanyTableFields,
} from '@/lib/crm/companies/field-config';
import type {
  Company,
  CompanyConfigOption,
  CompanyFieldDefinition,
} from '@/lib/crm/companies/types';

interface CompanyRow extends Record<string, unknown> {
  id: string;
  brokerName: string;
  createdAt: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface CompaniesTableProps {
  companies: Company[];
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick?: (company: Company) => void;
}

export default function CompaniesTable({
  companies,
  fields,
  categories,
  locations,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: CompaniesTableProps) {
  const tableFields = getCompanyTableFields(fields);
  const rows = companies.map(flattenCompanyForTable) as CompanyRow[];

  const columnOverrides = useMemo(() => {
    const overrides: Record<
      string,
      {
        label: string;
        render?: (row: CompanyRow) => React.ReactNode;
      }
    > = {
      createdAt: {
        label: 'CREATED',
        render: (row) => formatDate(row.createdAt),
      },
    };

    for (const field of tableFields) {
      overrides[field.key] = {
        label: field.label.toUpperCase(),
        render: (row) =>
          renderCompanyTableCell(field, row, { categories, locations }),
      };
    }

    return overrides;
  }, [tableFields, categories, locations]);

  const tableFieldKeys = useMemo(
    () => tableFields.map((field) => field.key),
    [tableFields],
  );

  return (
    <Paper className="overflow-hidden rounded-2xl">
      <DataTable<CompanyRow>
        tableId="companies"
        rows={rows}
        getRowId={(row) => row.id}
        excludeFields={['id']}
        includeFields={tableFieldKeys}
        columnOverrides={columnOverrides}
        isLoading={isLoading}
        emptyMessage="No companies yet. Add your first company to get started."
        noResultsMessage="No companies match your search or filters."
        enableSearch={false}
        enablePagination={false}
        persistPreferences
        onRowClick={(row) => {
          const company = companies.find((item) => item.id === row.id);
          if (company) {
            onRowClick?.(company);
          }
        }}
      />
      <Box className="border-t border-border/60">
        <DataTablePagination
          page={page - 1}
          pageSize={pageSize}
          totalRows={total}
          onPageChange={(nextPage) => onPageChange(nextPage + 1)}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </Paper>
  );
}
