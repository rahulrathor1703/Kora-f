'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/api';
import { useHasPermission } from '@/hooks/useHasPermission';
import { getApiErrorMessage } from '@/lib/api';
import { contactListService } from '@/lib/api/services/contact-list.service';
import { manualListService } from '@/lib/api/services/manual-list.service';
import {
  formatStatusLabel,
  STATUS_COLORS,
} from '@/lib/email/campaigns/detail-utils';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

type ListType = 'contact' | 'manual';

interface PushMembersToCampaignsDialogProps {
  open: boolean;
  listType: ListType;
  listId: string;
  emails?: string[];
  rowIds?: string[];
  memberCountLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (campaignIds: string[]) => void | Promise<void>;
}

export default function PushMembersToCampaignsDialog({
  open,
  listType,
  listId,
  emails = [],
  rowIds = [],
  memberCountLabel,
  isSubmitting = false,
  onClose,
  onConfirm,
}: PushMembersToCampaignsDialogProps) {
  const canEnroll = useHasPermission('email-campaigns:update');
  const [selectedCampaignIdsOverride, setSelectedCampaignIdsOverride] =
    useState<string[] | null>(null);

  const enrollmentQueryKey = useMemo(() => {
    if (listType === 'contact') {
      return `contact-lists.enrollment-options.${listId}.${emails.join(',')}`;
    }

    return `manual-lists.enrollment-options.${listId}.${rowIds.join(',')}`;
  }, [emails, listId, listType, rowIds]);

  const {
    data: enrollmentOptions,
    error: optionsError,
    isLoading: isOptionsLoading,
  } = useApiQuery(
    enrollmentQueryKey,
    () =>
      listType === 'contact'
        ? contactListService.getEnrollmentOptions(listId, emails)
        : manualListService.getEnrollmentOptions(listId, rowIds),
    {
      enabled:
        open &&
        canEnroll &&
        (listType === 'contact' ? emails.length > 0 : rowIds.length > 0),
    },
  );

  const options = enrollmentOptions?.options ?? [];
  const enrollableOptions = options.filter((option) => option.canEnroll);
  const informationalOptions = options.filter((option) => !option.canEnroll);
  const defaultSelectedCampaignIds = enrollableOptions.map(
    (option) => option.campaignId,
  );
  const selectedCampaignIds =
    selectedCampaignIdsOverride ?? defaultSelectedCampaignIds;

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setSelectedCampaignIdsOverride(null);
    onClose();
  }

  function toggleCampaign(campaignId: string) {
    setSelectedCampaignIdsOverride((current) => {
      const resolved = current ?? defaultSelectedCampaignIds;
      return resolved.includes(campaignId)
        ? resolved.filter((id) => id !== campaignId)
        : [...resolved, campaignId];
    });
  }

  async function handleConfirm() {
    await onConfirm(selectedCampaignIds);
  }

  if (!canEnroll) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold">Add to campaigns?</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Choose which linked campaigns should receive{' '}
            {memberCountLabel === '1 contact' ? 'this contact' : 'these contacts'}.
            Scheduled and sending campaigns can be updated immediately. Draft
            campaigns include new list members automatically when scheduled.
          </Typography>

          {isOptionsLoading ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Loading linked campaigns…
              </Typography>
            </Stack>
          ) : null}

          {optionsError ? (
            <Alert severity="error">
              {getApiErrorMessage(
                optionsError,
                'Unable to load campaign enrollment options',
              )}
            </Alert>
          ) : null}

          {informationalOptions.length > 0 ? (
            <Stack spacing={1}>
              {informationalOptions.map((option) => (
                <Alert key={option.campaignId} severity="info">
                  <strong>{option.campaignName}</strong>
                  {option.reason ? ` — ${option.reason}` : ''}
                </Alert>
              ))}
            </Stack>
          ) : null}

          {enrollableOptions.length > 0 ? (
            <FormGroup>
              {enrollableOptions.map((option) => (
                <FormControlLabel
                  key={option.campaignId}
                  control={
                    <Checkbox
                      checked={selectedCampaignIds.includes(option.campaignId)}
                      onChange={() => toggleCampaign(option.campaignId)}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2">
                        {option.campaignName}
                      </Typography>
                      <Chip
                        label={formatStatusLabel(
                          option.status as EmailCampaignStatus,
                        )}
                        color={
                          STATUS_COLORS[option.status as EmailCampaignStatus] ??
                          'default'
                        }
                        size="small"
                        className="rounded-lg capitalize"
                      />
                    </Stack>
                  }
                />
              ))}
            </FormGroup>
          ) : null}

          {!isOptionsLoading &&
          !optionsError &&
          options.length === 0 ? (
            <Alert severity="info">
              No linked campaigns are using this list yet.
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          color="inherit"
          className="rounded-xl"
        >
          Skip
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          disabled={
            isSubmitting ||
            isOptionsLoading ||
            selectedCampaignIds.length === 0
          }
          variant="contained"
          className="rounded-xl shadow-none"
        >
          {isSubmitting ? 'Adding…' : 'Add to selected campaigns'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
