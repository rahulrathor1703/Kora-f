'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useDeleteRequestSummaryCounts } from '@/hooks/useProspectDeleteRequests';
import { useOrgPath } from '@/hooks/useOrgPath';

interface ProspectusHeaderActionsProps {
  onLogEngagementClick: () => void;
  onBulkUploadClick?: () => void;
}

export function ProspectusHeaderActions({
  onLogEngagementClick,
  onBulkUploadClick,
}: ProspectusHeaderActionsProps) {
  const toOrgPath = useOrgPath();
  const canCreate = useHasPermission('prospects:create');
  const canCreateCompanies = useHasPermission('companies:create');
  const canUpdate = useHasPermission('prospects:update');
  const canManageFields = useHasPermission('prospects:manage-fields');
  const canRequestDelete = useHasPermission('prospects:request-delete');
  const canApproveDelete = useHasPermission('prospects:approve-delete');
  const { data: deleteRequestSummary } = useDeleteRequestSummaryCounts(
    canRequestDelete || canApproveDelete,
  );

  const deleteRequestBadgeCount = canApproveDelete
    ? (deleteRequestSummary?.pendingReviewCount ?? 0)
    : (deleteRequestSummary?.myRaisedCount ?? 0);

  return (
    <Stack direction="row" spacing={1} className="flex-wrap">
      {canManageFields ? (
        <Button
          component={Link}
          href={toOrgPath('/crm/prospectus/fields')}
          variant="outlined"
          startIcon={<SettingsOutlinedIcon />}
        >
          Manage fields
        </Button>
      ) : null}
      {canRequestDelete || canApproveDelete ? (
        <Badge
          badgeContent={deleteRequestBadgeCount}
          color="error"
          invisible={deleteRequestBadgeCount === 0}
        >
          <Button
            component={Link}
            href={toOrgPath('/crm/prospectus/delete-requests')}
            variant="outlined"
            startIcon={<DeleteOutlineOutlinedIcon />}
          >
            Delete requests
          </Button>
        </Badge>
      ) : null}
      {canUpdate ? (
        <Button
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={onLogEngagementClick}
        >
          Log Engagement
        </Button>
      ) : null}
      {canCreate || canCreateCompanies ? (
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={onBulkUploadClick}
        >
          Bulk Upload
        </Button>
      ) : null}
      {canCreate ? (
        <Button
          component={Link}
          href={toOrgPath('/crm/prospectus/new')}
          variant="contained"
          startIcon={<AddOutlinedIcon />}
        >
          New Prospect
        </Button>
      ) : null}
    </Stack>
  );
}
