'use client';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { dataTableClassNames } from '@/components/data-table/dataTableStyles';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import MailboxProviderLogo from '@/components/email/mailboxes/MailboxProviderLogo';
import type { SenderMailboxDetail } from '@/lib/email/mailbox-types';

interface MailboxDetailHeaderProps {
  mailbox: SenderMailboxDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onFixSpamRating: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export default function MailboxDetailHeader({
  mailbox,
  isLoading,
  isSaving,
  canUpdate,
  canDelete,
  onEdit,
  onFixSpamRating,
  onDeactivate,
  onReactivate,
  onDelete,
}: MailboxDetailHeaderProps) {
  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width={160} height={40} className="rounded-2xl" />
        <Skeleton width="60%" height={40} />
        <Skeleton width="40%" height={24} />
      </Stack>
    );
  }

  if (!mailbox) {
    return null;
  }

  const isActive = mailbox.status === 'active';

  return (
    <Stack spacing={2}>
      <SettingsNavButton href="/email/mailboxes" label="Back to mailboxes" />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Box className="min-w-0 flex-1">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box className="mailbox-card-logo">
              <MailboxProviderLogo provider={mailbox.provider} className="h-5 w-5" />
            </Box>
            <Box className="min-w-0">
              <Typography variant="h4" component="h1" className="font-bold">
                {mailbox.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-0.5">
                {mailbox.email}
              </Typography>
            </Box>
          </Stack>

          {mailbox.warmupEnabled ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 1 }}
            >
              <Chip
                label="Warmup enabled"
                size="small"
                variant="outlined"
                className="rounded-lg"
              />
            </Stack>
          ) : null}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          className="shrink-0"
        >
          {canUpdate ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoFixHighOutlinedIcon />}
              onClick={onFixSpamRating}
              disabled={isSaving}
              className="rounded-xl normal-case"
            >
              Fix spam rating
            </Button>
          ) : null}
          {canUpdate ? (
            isActive ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PauseCircleOutlineOutlinedIcon />}
                onClick={onDeactivate}
                disabled={isSaving}
                className="rounded-xl normal-case"
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayCircleOutlineOutlinedIcon />}
                onClick={onReactivate}
                disabled={isSaving}
                className="rounded-xl normal-case"
              >
                Reactivate
              </Button>
            )
          ) : null}
          {canUpdate || canDelete ? (
            <Box className={`${dataTableClassNames.iconButtonGroup} shrink-0`}>
              {canUpdate ? (
                <Tooltip title="Edit mailbox">
                  <span>
                    <IconButton
                      aria-label="Edit mailbox"
                      onClick={onEdit}
                      disabled={isSaving}
                      size="small"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              {canDelete ? (
                <Tooltip title="Delete mailbox">
                  <span>
                    <IconButton
                      aria-label="Delete mailbox"
                      onClick={onDelete}
                      disabled={isSaving}
                      size="small"
                      color="error"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
            </Box>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
}
