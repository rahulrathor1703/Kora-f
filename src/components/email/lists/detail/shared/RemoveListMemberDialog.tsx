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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
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
import type { ListCampaignRemovalAction } from '@/lib/email/lists/detail-types';

type ListType = 'contact' | 'manual';

type RemovalMode = 'list_only' | 'stop' | 'exclude_globally';

interface RemoveListMemberDialogProps {
  open: boolean;
  listType: ListType;
  listId: string;
  memberId: string;
  emailLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (campaignActions: ListCampaignRemovalAction[]) => void | Promise<void>;
}

export default function RemoveListMemberDialog({
  open,
  listType,
  listId,
  memberId,
  emailLabel,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RemoveListMemberDialogProps) {
  const canUpdateCampaigns = useHasPermission('email-campaigns:update');
  const [removalModeOverride, setRemovalModeOverride] =
    useState<RemovalMode | null>(null);
  const [selectedCampaignIdsOverride, setSelectedCampaignIdsOverride] = useState<
    string[] | null
  >(null);

  const previewQueryKey =
    listType === 'contact'
      ? `contact-lists.removal-preview.${listId}.${memberId}`
      : `manual-lists.removal-preview.${listId}.${memberId}`;

  const {
    data: preview,
    error: previewError,
    isLoading: isPreviewLoading,
  } = useApiQuery(
    previewQueryKey,
    () =>
      listType === 'contact'
        ? contactListService.getMemberRemovalPreview(listId, memberId)
        : manualListService.getRowRemovalPreview(listId, memberId),
    { enabled: open && Boolean(memberId) },
  );

  const campaignImpacts = useMemo(
    () => preview?.campaignImpacts ?? [],
    [preview?.campaignImpacts],
  );
  const showCampaignSection =
    canUpdateCampaigns && campaignImpacts.length > 0;
  const defaultSelectedCampaignIds = campaignImpacts.map(
    (impact) => impact.campaignId,
  );
  const removalMode = removalModeOverride ?? 'list_only';
  const selectedCampaignIds =
    selectedCampaignIdsOverride ?? defaultSelectedCampaignIds;

  const campaignActions = useMemo((): ListCampaignRemovalAction[] => {
    if (removalMode === 'list_only') {
      return [];
    }

    if (removalMode === 'exclude_globally') {
      const firstImpact = campaignImpacts[0];
      if (!firstImpact) {
        return [];
      }

      return [
        {
          campaignId: firstImpact.campaignId,
          action: 'exclude_globally',
        },
      ];
    }

    if (selectedCampaignIds.length === 0) {
      return [];
    }

    return selectedCampaignIds.map((campaignId) => ({
      campaignId,
      action: 'stop' as const,
    }));
  }, [removalMode, selectedCampaignIds, campaignImpacts]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setRemovalModeOverride(null);
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
    await onConfirm(campaignActions);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold">Remove from list?</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Remove <strong>{emailLabel}</strong> from this list. This cannot be
            undone.
          </Typography>

          {isPreviewLoading ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Checking linked campaigns…
              </Typography>
            </Stack>
          ) : null}

          {previewError ? (
            <Alert severity="error">
              {getApiErrorMessage(
                previewError,
                'Unable to load campaign impact preview',
              )}
            </Alert>
          ) : null}

          {showCampaignSection ? (
            <Stack spacing={2}>
              <Alert severity="warning">
                This contact is enrolled in {campaignImpacts.length}{' '}
                {campaignImpacts.length === 1 ? 'campaign' : 'campaigns'}. Choose
                whether to update those campaigns too.
              </Alert>

              <RadioGroup
                value={removalMode}
                onChange={(event) =>
                  setRemovalModeOverride(event.target.value as RemovalMode)
                }
              >
                <FormControlLabel
                  value="list_only"
                  control={<Radio />}
                  label="Remove from list only"
                />
                <FormControlLabel
                  value="stop"
                  control={<Radio />}
                  label="Also stop in selected campaigns"
                />
                <FormControlLabel
                  value="exclude_globally"
                  control={<Radio />}
                  label="Exclude globally from all campaigns"
                />
              </RadioGroup>

              {removalMode === 'stop' ? (
                <FormGroup>
                  {campaignImpacts.map((impact) => (
                    <FormControlLabel
                      key={impact.campaignId}
                      control={
                        <Checkbox
                          checked={selectedCampaignIds.includes(
                            impact.campaignId,
                          )}
                          onChange={() => toggleCampaign(impact.campaignId)}
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2">
                            {impact.campaignName}
                          </Typography>
                          <Chip
                            label={formatStatusLabel(
                              impact.status as EmailCampaignStatus,
                            )}
                            color={
                              STATUS_COLORS[
                                impact.status as EmailCampaignStatus
                              ] ?? 'default'
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

              {removalMode === 'exclude_globally' ? (
                <Alert severity="info">
                  This contact will be added to the organization exclusion list
                  and stopped in all campaigns. You can manage exclusions from
                  Email → Excluded.
                </Alert>
              ) : null}
            </Stack>
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
          Cancel
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          disabled={isSubmitting || isPreviewLoading}
          color="error"
          variant="contained"
          className="rounded-xl shadow-none"
        >
          {isSubmitting ? 'Removing…' : 'Remove from list'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
