'use client';

import AddIcon from '@mui/icons-material/Add';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import AddContactDialog, {
  type AddContactSubmitOptions,
} from '@/components/email/lists/detail/contact/AddContactDialog';
import AppendContactImportDialog from '@/components/email/lists/detail/contact/AppendContactImportDialog';
import ContactListMembersTable from '@/components/email/lists/detail/contact/ContactListMembersTable';
import PushMembersToCampaignsDialog from '@/components/email/lists/detail/shared/PushMembersToCampaignsDialog';
import RemoveListMemberDialog from '@/components/email/lists/detail/shared/RemoveListMemberDialog';
import {
  useContactList,
  useContactListMembers,
  useContactListMutations,
} from '@/hooks/useContactLists';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import {
  formatPushMemberCountLabel,
  hasPushEligibleCampaigns,
} from '@/lib/email/lists/campaign-sync-utils';
import { EMAIL_STATUS_OPTIONS } from '@/lib/email/lists/email-status-utils';
import type {
  ContactListMember,
  ListEmailStatus,
  ListCampaignRemovalAction,
} from '@/lib/email/lists/detail-types';
import ListCampaignsSection from '@/components/email/lists/detail/ListCampaignsSection';
import ListDetailHeader from '@/components/email/lists/detail/ListDetailHeader';
import ListDetailShell from '@/components/email/lists/detail/ListDetailShell';
import ListMetricsBar from '@/components/email/lists/detail/ListMetricsBar';

interface ContactListDetailContentProps {
  listId: string;
}

interface PushDialogState {
  emails: string[];
}

interface RemoveDialogState {
  memberId: string;
  emailLabel: string;
}

export default function ContactListDetailContent({
  listId,
}: ContactListDetailContentProps) {
  const canUpdate = useHasPermission('contact-lists:update');
  const canUpdateCampaigns = useHasPermission('email-campaigns:update');
  const { notifySuccess, notifyError } = useNotify();
  const [search, setSearch] = useState('');
  const [emailStatus, setEmailStatus] = useState<ListEmailStatus | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pushDialog, setPushDialog] = useState<PushDialogState | null>(null);
  const [removeDialog, setRemoveDialog] = useState<RemoveDialogState | null>(
    null,
  );

  const {
    data: list,
    error: listError,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useContactList(listId);

  const membersQuery = useMemo(
    () => ({
      search,
      emailStatus: emailStatus || undefined,
      page,
      pageSize,
    }),
    [search, emailStatus, page, pageSize],
  );

  const {
    data: membersPage,
    isLoading: isMembersLoading,
    refetch: refetchMembers,
  } = useContactListMembers(listId, membersQuery);

  const {
    addMember,
    removeMember,
    enrollMembersInCampaigns,
    isAddingMember,
    isAppendingImport,
    isRemovingMember,
    isEnrollingMembers,
  } = useContactListMutations(listId);

  async function refreshAll() {
    await Promise.all([refetchList(), refetchMembers()]);
  }

  const canPushToCampaigns =
    canUpdate &&
    canUpdateCampaigns &&
    hasPushEligibleCampaigns(list?.campaigns ?? []);

  function openPushDialog(emails: string[]) {
    if (emails.length === 0 || !canPushToCampaigns) {
      return;
    }

    setPushDialog({ emails });
  }

  function maybeOpenPushDialog(emails: string[]) {
    openPushDialog(emails);
  }

  async function handleAddContact(
    input: Parameters<typeof addMember>[0],
    options?: AddContactSubmitOptions,
  ) {
    setActionError(null);

    try {
      const member = await addMember(input);
      setAddOpen(false);
      await refreshAll();

      if (options?.pushToCampaigns) {
        openPushDialog([member.email]);
      } else {
        maybeOpenPushDialog([member.email]);
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Unable to add contact'));
      throw error;
    }
  }

  function handlePushMemberToCampaigns(member: ContactListMember) {
    openPushDialog([member.email]);
  }

  async function handleAppendComplete(result: {
    importedEmails: string[];
    importedCount: number;
  }) {
    await refreshAll();

    if (result.importedCount > 0) {
      maybeOpenPushDialog(result.importedEmails);
    }
  }

  function handleDeleteMember(member: ContactListMember) {
    setRemoveDialog({
      memberId: member.id,
      emailLabel: member.email,
    });
  }

  async function handleConfirmRemove(campaignActions: ListCampaignRemovalAction[]) {
    if (!removeDialog) {
      return;
    }

    try {
      await removeMember({
        memberId: removeDialog.memberId,
        campaignActions,
      });
      setRemoveDialog(null);

      const remainingOnPage = (membersPage?.items.length ?? 1) - 1;
      if (remainingOnPage <= 0 && page > 1) {
        setPage((current) => current - 1);
      }

      await refreshAll();
      notifySuccess('Contact removed from list');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to remove contact'));
    }
  }

  async function handleConfirmPush(campaignIds: string[]) {
    if (!pushDialog || campaignIds.length === 0) {
      setPushDialog(null);
      return;
    }

    try {
      const result = await enrollMembersInCampaigns({
        emails: pushDialog.emails,
        campaignIds,
      });
      setPushDialog(null);
      notifySuccess(
        `Added to ${result.addedCount} campaign${result.addedCount === 1 ? '' : 's'}${
          result.skippedCount > 0
            ? ` (${result.skippedCount} skipped)`
            : ''
        }`,
      );
      await refreshAll();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to add contacts to campaigns'));
    }
  }

  if (listError) {
    return <ListDetailShell error={listError} />;
  }

  if (!isListLoading && !list) {
    return <ListDetailShell notFound />;
  }

  const members = membersPage?.items ?? [];
  const total = membersPage?.total ?? 0;

  return (
    <ListDetailShell>
      <ListDetailHeader name={list?.name ?? null} isLoading={isListLoading} />

      <ListMetricsBar stats={list?.stats} isLoading={isListLoading} />

      <ListCampaignsSection
        campaigns={list?.campaigns ?? []}
        isLoading={isListLoading}
      />

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Typography variant="h6" className="font-bold">
                  Contacts
                </Typography>
                {canUpdate ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddOpen(true)}
                      className="rounded-xl"
                    >
                      Add Contacts
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<UploadFileOutlinedIcon />}
                      onClick={() => setBulkOpen(true)}
                      className="rounded-xl"
                    >
                      Bulk Upload
                    </Button>
                  </>
                ) : null}
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="min-w-[200px]"
                />
                <FormControl size="small" className="min-w-[160px]">
                  <InputLabel id="email-status-filter-label">
                    Email Status
                  </InputLabel>
                  <Select
                    labelId="email-status-filter-label"
                    label="Email Status"
                    value={emailStatus}
                    onChange={(event) => {
                      setEmailStatus(event.target.value as ListEmailStatus | '');
                      setPage(1);
                    }}
                  >
                    {EMAIL_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value || 'all'} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            {list?.fieldSchema ? (
              <ContactListMembersTable
                members={members}
                fieldSchema={list.fieldSchema}
                isLoading={isListLoading || isMembersLoading}
                canDelete={canUpdate}
                canPushToCampaigns={canPushToCampaigns}
                onDeleteMember={handleDeleteMember}
                onPushToCampaigns={handlePushMemberToCampaigns}
              />
            ) : null}

            {total > pageSize ? (
              <Box className="flex justify-end gap-2">
                <Button
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={page * pageSize >= total}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </Box>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {list?.fieldSchema ? (
        <>
          <AddContactDialog
            open={addOpen}
            fieldSchema={list.fieldSchema}
            isSubmitting={isAddingMember}
            canPushToCampaigns={canPushToCampaigns}
            error={actionError}
            onClose={() => {
              setAddOpen(false);
              setActionError(null);
            }}
            onSubmit={handleAddContact}
          />
          <AppendContactImportDialog
            open={bulkOpen}
            listId={listId}
            fieldSchema={list.fieldSchema}
            isSubmitting={isAppendingImport}
            onClose={() => setBulkOpen(false)}
            onComplete={handleAppendComplete}
          />
        </>
      ) : null}

      {removeDialog ? (
        <RemoveListMemberDialog
          open
          listType="contact"
          listId={listId}
          memberId={removeDialog.memberId}
          emailLabel={removeDialog.emailLabel}
          isSubmitting={isRemovingMember}
          onClose={() => setRemoveDialog(null)}
          onConfirm={handleConfirmRemove}
        />
      ) : null}

      {pushDialog ? (
        <PushMembersToCampaignsDialog
          open
          listType="contact"
          listId={listId}
          emails={pushDialog.emails}
          memberCountLabel={formatPushMemberCountLabel(pushDialog.emails.length)}
          isSubmitting={isEnrollingMembers}
          onClose={() => setPushDialog(null)}
          onConfirm={handleConfirmPush}
        />
      ) : null}
    </ListDetailShell>
  );
}
