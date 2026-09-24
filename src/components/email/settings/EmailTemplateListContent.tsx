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
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { EmailTemplate } from '@/lib/api';
import { emailTemplateMeta } from '@/lib/email/navigation';

export default function EmailTemplateListContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { templates, isLoading, isDeleting, error, deleteTemplate } =
    useEmailTemplates({ includeInactive: true });
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(
    null,
  );

  async function handleDeleteConfirm() {
    if (!templateToDelete) {
      return;
    }

    try {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    } catch {
      // error surfaced via hook
    }
  }

  return (
    <Stack spacing={3}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-0 md:p-2">
          {!isLoading && templates.length === 0 ? (
            <Box className="px-6 py-14 text-center">
              <Typography variant="h6" className="font-bold">
                No email templates yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Create reusable templates for your campaigns—one email or many follow-ups.
              </Typography>
              <Button
                component={Link}
                href={toOrgPath(`${emailTemplateMeta.href}/new`)}
                variant="contained"
                startIcon={<AddIcon />}
                className="mt-6 rounded-2xl"
              >
                Create template
              </Button>
            </Box>
          ) : (
            <DataTable<EmailTemplate>
              tableId="email-templates"
              rows={templates}
              getRowId={(template) => template.id}
              excludeFields={['id', 'createdByUserId', 'steps']}
              isLoading={isLoading}
              searchPlaceholder="Search templates..."
              onRowClick={(template) =>
                router.push(toOrgPath(`${emailTemplateMeta.href}/${template.id}`))
              }
              columnOverrides={{
                name: {
                  render: (template) => (
                    <Typography variant="body2" className="font-semibold">
                      {template.name}
                    </Typography>
                  ),
                },
                type: {
                  label: 'Type',
                  render: (template) => (
                    <Chip
                      label={template.type === 'single' ? 'Single email' : 'Sequence'}
                      size="small"
                      variant="outlined"
                    />
                  ),
                },
                visibility: {
                  label: 'Visibility',
                  render: (template) => (
                    <Chip
                      label={template.visibility === 'org' ? 'Organization' : 'Private'}
                      size="small"
                      color={template.visibility === 'org' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ),
                },
                isActive: {
                  label: 'Status',
                  render: (template) => (
                    <Chip
                      label={template.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={template.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  ),
                },
                updatedAt: {
                  label: 'Updated',
                },
              }}
              rowActions={(template) => (
                <>
                  <Tooltip title={`Edit ${template.name}`}>
                    <IconButton
                      component={Link}
                      href={toOrgPath(`${emailTemplateMeta.href}/${template.id}`)}
                      aria-label={`Edit ${template.name}`}
                      size="small"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${template.name}`}>
                    <IconButton
                      aria-label={`Delete ${template.name}`}
                      size="small"
                      color="error"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setTemplateToDelete(template);
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
          <Typography variant="body2">Deleting template…</Typography>
        </Box>
      ) : null}

      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => void handleDeleteConfirm()}
        variant="destructive"
        title="Delete email template"
        description={
          <>
            Delete <strong>{templateToDelete?.name}</strong>? Existing campaigns
            will not be affected.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </Stack>
  );
}
