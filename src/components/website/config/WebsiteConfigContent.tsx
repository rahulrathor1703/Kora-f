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
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import GoogleOAuthAppsSettingsCard from '@/components/website/config/GoogleOAuthAppsSettingsCard';
import PsiApiKeySettingsCard from '@/components/website/config/PsiApiKeySettingsCard';
import WebsitePropertyFormDialog from '@/components/website/config/WebsitePropertyFormDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import { useHasPermission, useHasAnyPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useWebsiteProperties } from '@/hooks/useWebsiteProperties';
import { onPageSeoService } from '@/lib/api/services/on-page-seo.service';
import type { WebsiteProperty } from '@/lib/website/on-page-seo/types';

function IntegrationChip({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <Chip
      label={enabled ? label : 'Off'}
      size="small"
      color={enabled ? 'primary' : 'default'}
      variant={enabled ? 'filled' : 'outlined'}
    />
  );
}

export default function WebsiteConfigContent() {
  const toOrgPath = useOrgPath();
  const searchParams = useSearchParams();
  const { notifySuccess, notifyError } = useNotify();
  const canRead = useHasPermission('website:read');
  const canManage = useHasPermission('website:manage');
  const canManageIntegrations = useHasAnyPermission([
    'website:manage',
    'website:manage-integrations',
  ]);
  const {
    properties,
    isLoading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    isCreating,
    isUpdating,
    isDeleting,
    refetch: refetchProperties,
  } = useWebsiteProperties();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<WebsiteProperty | null>(null);
  const [wizardInitialConnectionId, setWizardInitialConnectionId] = useState<string | null>(null);
  const [wizardInitialOAuthAppId, setWizardInitialOAuthAppId] = useState<string | null>(null);
  const [wizardInitialStep, setWizardInitialStep] = useState(0);
  const [propertyToDelete, setPropertyToDelete] = useState<WebsiteProperty | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const oauthStatus = searchParams.get('googleOAuth');
    if (!oauthStatus) {
      return;
    }

    const propertyId = searchParams.get('propertyId');
    const connectionId = searchParams.get('connectionId');
    const oauthAppId = searchParams.get('oauthAppId');

    void (async () => {
      if (oauthStatus === 'success') {
        const email = searchParams.get('email') ?? 'Google account';
        notifySuccess(`${email} connected successfully`);
      } else if (oauthStatus === 'error') {
        notifyError(searchParams.get('message') ?? 'Unable to connect Google account');
      }

      if (connectionId) {
        setWizardInitialConnectionId(connectionId);
        setWizardInitialOAuthAppId(oauthAppId);
        setWizardInitialStep(oauthStatus === 'success' ? 1 : 0);
        setEditingProperty(null);
        setDialogOpen(true);
      } else if (propertyId) {
        await refetchProperties();
        const freshProperties = await onPageSeoService.getProperties();
        const matched = freshProperties.find((property) => property.id === propertyId);
        if (matched) {
          setEditingProperty(matched);
          setWizardInitialConnectionId(matched.googleConnectionId);
          setWizardInitialStep(0);
        }
        setDialogOpen(true);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('googleOAuth');
      url.searchParams.delete('propertyId');
      url.searchParams.delete('connectionId');
      url.searchParams.delete('oauthAppId');
      url.searchParams.delete('email');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    })();
  }, [notifyError, notifySuccess, refetchProperties, searchParams]);

  async function handleSubmit(
    input: Parameters<typeof createProperty>[0] | Parameters<typeof updateProperty>[1],
  ) {
    setActionError(null);

    try {
      if (editingProperty?.id) {
        const updated = await updateProperty(
          editingProperty.id,
          input as Parameters<typeof updateProperty>[1],
        );
        setEditingProperty(updated);
      } else {
        const created = await createProperty(input as Parameters<typeof createProperty>[0]);
        setEditingProperty(created);
      }
    } catch (submitError) {
      setActionError(
        submitError instanceof Error ? submitError.message : 'Failed to save website',
      );
      throw submitError;
    }
  }

  function openAddWebsiteDialog() {
    setEditingProperty(null);
    setWizardInitialConnectionId(null);
    setWizardInitialStep(0);
    setDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!propertyToDelete) {
      return;
    }

    setActionError(null);

    try {
      await deleteProperty(propertyToDelete.id);
      setPropertyToDelete(null);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete website',
      );
    }
  }

  if (!canRead) {
    return (
      <Typography variant="body2" color="text.secondary">
        You do not have permission to view website configuration.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Website"
        title="Website Config"
        description="Add websites with Google connect, then enable GA4, Search Console, and PageSpeed per site."
        parentBack={{ href: '/website/overview', label: 'Website' }}
        showPlatformBackLink={false}
      />

      <GoogleOAuthAppsSettingsCard canManageIntegrations={canManageIntegrations} />
      <PsiApiKeySettingsCard canManageIntegrations={canManageIntegrations} />

      {canManage ? (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="rounded-2xl px-5 py-2.5 shadow-primary-soft"
            onClick={openAddWebsiteDialog}
          >
            Add website
          </Button>
        </Stack>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-0 md:p-2">
          {!isLoading && properties.length === 0 ? (
            <Box className="px-6 py-14 text-center">
              <Typography variant="h6" className="font-bold">
                No websites configured yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                {canManage
                  ? 'Add your first website using the guided setup: connect Google, enter site details, then enable integrations.'
                  : 'No websites have been configured for this organization yet.'}
              </Typography>
              {canManage ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="mt-6 rounded-2xl"
                  onClick={openAddWebsiteDialog}
                >
                  Add website
                </Button>
              ) : null}
            </Box>
          ) : (
            <DataTable<WebsiteProperty>
              tableId="website-properties"
              rows={properties}
              getRowId={(property) => property.id}
              excludeFields={[
                'id',
                'organizationId',
                'createdAt',
                'updatedAt',
                'ga4PropertyId',
                'ga4PropertyName',
                'gscSiteUrl',
                'googleConnectedAt',
              ]}
              isLoading={isLoading}
              searchPlaceholder="Search websites..."
              columnOverrides={{
                name: {
                  render: (property) => (
                    <Typography variant="body2" className="font-semibold">
                      {property.name}
                    </Typography>
                  ),
                },
                domain: {
                  render: (property) => (
                    <Typography variant="body2" color="text.secondary">
                      {property.domain}
                    </Typography>
                  ),
                },
                googleEmail: {
                  label: 'Google account',
                  render: (property) =>
                    property.googleEmail ? (
                      <Typography variant="body2" color="text.secondary">
                        {property.googleEmail}
                      </Typography>
                    ) : (
                      <Chip label="Not connected" size="small" variant="outlined" />
                    ),
                },
                sitemapUrl: {
                  label: 'Sitemap',
                  render: (property) => (
                    <Typography variant="body2" color="text.secondary" className="max-w-xs truncate">
                      {property.sitemapUrl}
                    </Typography>
                  ),
                },
                maxPages: {
                  label: 'Max pages',
                },
                ga4Enabled: {
                  label: 'GA4',
                  render: (property) => (
                    <IntegrationChip enabled={property.ga4Enabled} label="GA4" />
                  ),
                },
                gscEnabled: {
                  label: 'GSC',
                  render: (property) => (
                    <IntegrationChip enabled={property.gscEnabled} label="GSC" />
                  ),
                },
                psiEnabled: {
                  label: 'PSI',
                  render: (property) => (
                    <IntegrationChip enabled={property.psiEnabled} label="PSI" />
                  ),
                },
                isActive: {
                  label: 'Status',
                  render: (property) => (
                    <Chip
                      label={property.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={property.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  ),
                },
              }}
              rowActions={
                canManage
                  ? (property) => (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            aria-label={`Edit ${property.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingProperty(property);
                              setWizardInitialConnectionId(property.googleConnectionId);
                              setWizardInitialStep(0);
                              setDialogOpen(true);
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            aria-label={`Delete ${property.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setPropertyToDelete(property);
                            }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      {properties.length > 0 ? (
        <Alert severity="info">
          On-page SEO audits run from the{' '}
          <Link href={toOrgPath('/website/on-page')} className="font-semibold underline">
            On-page
          </Link>{' '}
          tab.
        </Alert>
      ) : null}

      {canManage ? (
        <WebsitePropertyFormDialog
          open={dialogOpen}
          property={editingProperty}
          isSaving={isCreating || isUpdating}
          canManageIntegrations={canManageIntegrations}
          initialConnectionId={wizardInitialConnectionId}
          initialOAuthAppId={wizardInitialOAuthAppId}
          initialStep={wizardInitialStep}
          onClose={() => {
            setDialogOpen(false);
            setEditingProperty(null);
            setWizardInitialConnectionId(null);
            setWizardInitialOAuthAppId(null);
            setWizardInitialStep(0);
          }}
          onSubmit={handleSubmit}
          onPropertyUpdated={(property) => {
            setEditingProperty(property);
          }}
          onRefreshProperties={async () => {
            await refetchProperties();
            if (!editingProperty?.id) {
              return;
            }

            const freshProperties = await onPageSeoService.getProperties();
            const latest = freshProperties.find(
              (property) => property.id === editingProperty.id,
            );
            if (latest) {
              setEditingProperty(latest);
            }
          }}
        />
      ) : null}

      {canManage ? (
        <ConfirmDialog
          open={propertyToDelete !== null}
          title={`Delete "${propertyToDelete?.name}"?`}
          description="This website and all of its audit history will be permanently removed."
          confirmLabel="Delete website"
          variant="destructive"
          isLoading={isDeleting}
          onClose={() => setPropertyToDelete(null)}
          onConfirm={() => void handleDeleteConfirm()}
        />
      ) : null}
    </Stack>
  );
}
