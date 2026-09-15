'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useCompanyConfigOptions } from '@/hooks/useCompanyConfigOptions';
import { useOrgPath } from '@/hooks/useOrgPath';
import type {
  CompanyConfigCategory,
  CompanyConfigOption,
} from '@/lib/crm/companies/types';
import { getCompanyConfigCategoryMeta } from '@/lib/crm/settings-navigation';

interface CompanyConfigOptionsListContentProps {
  category: CompanyConfigCategory;
}

export default function CompanyConfigOptionsListContent({
  category,
}: CompanyConfigOptionsListContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const meta = getCompanyConfigCategoryMeta(category);
  const { options, isLoading, isDeleting, error, deleteOption } =
    useCompanyConfigOptions(category);
  const [optionToDelete, setOptionToDelete] =
    useState<CompanyConfigOption | null>(null);

  async function handleDeleteConfirm() {
    if (!optionToDelete) {
      return;
    }

    try {
      await deleteOption(optionToDelete.id);
      setOptionToDelete(null);
    } catch {
      // error surfaced via hook
    }
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="CRM Configuration"
        title={meta.pluralLabel}
        description={meta.description}
        parentBack={{ href: '/crm/configuration', label: 'CRM Configuration' }}
        showPlatformBackLink={false}
      />

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button
          component={Link}
          href={toOrgPath(`${meta.href}/new`)}
          variant="contained"
          startIcon={<AddIcon />}
          className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
        >
          Create {meta.label.toLowerCase()}
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-0 md:p-2">
          {!isLoading && options.length === 0 ? (
            <Box className="px-6 py-14 text-center">
              <Typography variant="h6" className="font-bold">
                No {meta.pluralLabel.toLowerCase()} yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Create your first {meta.label.toLowerCase()} for company records.
              </Typography>
              <Button
                component={Link}
                href={toOrgPath(`${meta.href}/new`)}
                variant="contained"
                startIcon={<AddIcon />}
                className="mt-6 rounded-2xl"
              >
                Create {meta.label.toLowerCase()}
              </Button>
            </Box>
          ) : (
            <DataTable<CompanyConfigOption>
              tableId={`company-config-${category}`}
              rows={options}
              getRowId={(option) => option.id}
              excludeFields={['id', 'category']}
              isLoading={isLoading}
              searchPlaceholder={`Search ${meta.pluralLabel.toLowerCase()}...`}
              onRowClick={(option) =>
                router.push(toOrgPath(`${meta.href}/${option.id}`))
              }
              columnOverrides={{
                label: {
                  render: (option) => (
                    <Typography variant="body2" className="font-semibold">
                      {option.label}
                    </Typography>
                  ),
                },
                value: {
                  render: (option) => (
                    <Typography variant="body2" color="text.secondary">
                      {option.value}
                    </Typography>
                  ),
                },
                isActive: {
                  label: 'Status',
                  render: (option) => (
                    <Chip
                      label={option.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={option.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  ),
                },
                sortOrder: {
                  label: 'Order',
                  align: 'center',
                },
                updatedAt: {
                  label: 'Updated',
                },
              }}
              rowActions={(option) => (
                <>
                  <Tooltip title={`Edit ${option.label}`}>
                    <IconButton
                      component={Link}
                      href={toOrgPath(`${meta.href}/${option.id}`)}
                      aria-label={`Edit ${option.label}`}
                      size="small"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${option.label}`}>
                    <IconButton
                      aria-label={`Delete ${option.label}`}
                      size="small"
                      color="error"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOptionToDelete(option);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            />
          )}
        </CardContent>
      </Card>

      {isDeleting ? (
        <Box className="flex items-center gap-2 text-text-secondary">
          <CircularProgress size={18} />
          <Typography variant="body2">Deleting option…</Typography>
        </Box>
      ) : null}

      <ConfirmDialog
        open={Boolean(optionToDelete)}
        onClose={() => setOptionToDelete(null)}
        onConfirm={() => void handleDeleteConfirm()}
        variant="destructive"
        title={`Delete ${meta.label.toLowerCase()}`}
        description={
          <>
            Delete <strong>{optionToDelete?.label}</strong>? Companies using this
            option must be updated first. You can deactivate it instead.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </Stack>
  );
}
