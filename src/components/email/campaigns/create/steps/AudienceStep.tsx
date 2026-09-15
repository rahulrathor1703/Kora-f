'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import AudienceListCard from '@/components/email/campaigns/create/AudienceListCard';
import CreateAudienceListDialog, {
  type CreatedAudienceListResult,
} from '@/components/email/campaigns/create/CreateAudienceListDialog';
import WizardStepIntro from '@/components/email/campaigns/create/WizardStepIntro';
import { useContactLists } from '@/hooks/useContactLists';
import { useEmailConfigOptions } from '@/hooks/useEmailConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useManualLists } from '@/hooks/useManualLists';
import { useMailboxes } from '@/hooks/useMailboxes';
import { useNotify } from '@/hooks/useNotify';
import type { AudienceListType } from '@/lib/email/campaigns/types';
import {
  buildAudienceCapacityMessage,
  computeTotalDailyCapacity,
  resolveSelectedMailboxes,
} from '@/lib/email/campaigns/mailbox-capacity';
import { formatProspectSyncMessage } from '@/lib/lists/manual-list-payload';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

interface UnifiedAudienceList {
  id: string;
  type: AudienceListType;
  name: string;
  count: number;
  countLabel: string;
}

export default function AudienceStep() {
  const { watch, setValue } = useFormContext<CampaignWizardFormValues>();
  const { notify, notifySuccess } = useNotify();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const selectedType = watch('audienceListType');
  const selectedId = watch('audienceListId');
  const brandId = watch('brand');
  const regionId = watch('region');
  const mailboxSenders = watch('mailboxSenders');

  const { lists: contactLists, isLoading: isLoadingContactLists, refetch: refetchContactLists } =
    useContactLists();
  const { lists: manualLists, isLoading: isLoadingManualLists, refetch: refetchManualLists } =
    useManualLists();
  const { mailboxes } = useMailboxes();
  const canViewManualLists = useHasPermission('manual-lists:read');
  const { options: brandOptions } = useEmailConfigOptions('brand');
  const { options: regionOptions } = useEmailConfigOptions('region');

  const brandLabel =
    brandOptions.find((option) => option.id === brandId)?.label ?? 'Brand';
  const regionLabel =
    regionOptions.find((option) => option.id === regionId)?.label ?? 'Region';

  const audienceLists = useMemo<UnifiedAudienceList[]>(() => {
    const lists: UnifiedAudienceList[] = contactLists.map((list) => ({
      id: list.id,
      type: 'contact',
      name: list.name,
      count: list.contactCount,
      countLabel: 'contacts',
    }));

    if (canViewManualLists) {
      lists.push(
        ...manualLists.map((list) => ({
          id: list.id,
          type: 'manual' as const,
          name: list.name,
          count: list.rowCount,
          countLabel: 'rows',
        })),
      );
    }

    return lists;
  }, [canViewManualLists, contactLists, manualLists]);

  const selectedList = useMemo(
    () =>
      audienceLists.find(
        (list) => list.type === selectedType && list.id === selectedId,
      ),
    [audienceLists, selectedId, selectedType],
  );

  const isLoading = isLoadingContactLists || isLoadingManualLists;

  function handleSelect(type: AudienceListType, id: string) {
    setValue('audienceListType', type, { shouldDirty: true, shouldValidate: true });
    setValue('audienceListId', id, { shouldDirty: true, shouldValidate: true });

    const list = audienceLists.find(
      (item) => item.type === type && item.id === id,
    );
    if (!list) {
      return;
    }

    const selectedMailboxes = resolveSelectedMailboxes(
      mailboxSenders ?? [],
      mailboxes,
    );
    const capacityMessage = buildAudienceCapacityMessage({
      listCount: list.count,
      mailboxCapacity: computeTotalDailyCapacity(selectedMailboxes),
      selectedMailboxCount: selectedMailboxes.length,
    });

    if (capacityMessage) {
      notify(capacityMessage, { variant: 'info' });
    }
  }

  async function handleListCreated(result: CreatedAudienceListResult) {
    setValue('audienceListType', result.type, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('audienceListId', result.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const selectedMailboxes = resolveSelectedMailboxes(
      mailboxSenders ?? [],
      mailboxes,
    );
    const capacityMessage = buildAudienceCapacityMessage({
      listCount: result.count,
      mailboxCapacity: computeTotalDailyCapacity(selectedMailboxes),
      selectedMailboxCount: selectedMailboxes.length,
    });

    if (capacityMessage) {
      notify(capacityMessage, { variant: 'info' });
    }

    if (result.type === 'contact') {
      await refetchContactLists();
    } else {
      await refetchManualLists();
    }

    const syncMessage = formatProspectSyncMessage(result.prospectSync);
    notifySuccess(
      syncMessage
        ? `List created · ${syncMessage}`
        : 'List created and selected for this campaign',
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <WizardStepIntro
          title="Who should receive this?"
          description="Select a contact or manual list. You can create a new list without leaving this step."
        />

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          className="rounded-2xl self-start shrink-0"
        >
          Add new list
        </Button>
      </Stack>

      <CreateAudienceListDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleListCreated}
      />

      {selectedList ? (
        <Box className="rounded-xl bg-primary-soft/30 px-4 py-3">
          <Typography variant="body2" className="font-medium">
            Selected: {selectedList.name} · {selectedList.count.toLocaleString()}{' '}
            {selectedList.countLabel}
          </Typography>
        </Box>
      ) : null}

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} className="rounded-2xl" />
          <Skeleton variant="rounded" height={88} className="rounded-2xl" />
        </Stack>
      ) : audienceLists.length === 0 ? (
        <Alert
          severity="info"
          className="rounded-2xl"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              className="rounded-xl whitespace-nowrap"
            >
              Add new list
            </Button>
          }
        >
          Create your first list — upload a CSV or build one manually without
          leaving this step.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {audienceLists.map((list) => (
            <AudienceListCard
              key={`${list.type}-${list.id}`}
              id={list.id}
              type={list.type}
              name={list.name}
              contextLabel={`${brandLabel} · ${regionLabel} · ${list.type === 'contact' ? 'Imported list' : 'Manual list'}`}
              count={list.count}
              countLabel={list.countLabel}
              selected={selectedType === list.type && selectedId === list.id}
              onSelect={handleSelect}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
