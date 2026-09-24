'use client';

import AddIcon from '@mui/icons-material/Add';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import AddAudienceContactDialog from '@/components/email/audience/AddAudienceContactDialog';
import AssignAudienceContactToListDialog from '@/components/email/audience/AssignAudienceContactToListDialog';
import BrowseAllListContactsTable from '@/components/email/audience/BrowseAllListContactsTable';
import { invalidateQueriesByPrefix } from '@/hooks/api';
import {
  useAssignAudienceContactToList,
  useCreateAudienceContact,
} from '@/hooks/useEmailExcluded';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';

interface AllContactsPanelProps {
  enabled: boolean;
}

export default function AllContactsPanel({ enabled }: AllContactsPanelProps) {
  const canCreate = useHasPermission('contact-lists:create');
  const { notifySuccess, notifyError } = useNotify();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [assignContact, setAssignContact] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const { createAudienceContact, isCreating } = useCreateAudienceContact();
  const { assignAudienceContactToList, isAssigning } =
    useAssignAudienceContactToList();

  async function handleAssignContact(
    input: Parameters<typeof assignAudienceContactToList>[0],
  ) {
    setAssignError(null);

    try {
      await assignAudienceContactToList(input);
      invalidateQueriesByPrefix('email-excluded.list-contacts');
      invalidateQueriesByPrefix('contact-lists.list');
      invalidateQueriesByPrefix('manual-lists.list');
      setAssignContact(null);
      notifySuccess('Contact added to list');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to add contact to list');
      setAssignError(message);
      notifyError(message);
    }
  }

  async function handleAddContact(
    input: Parameters<typeof createAudienceContact>[0],
  ) {
    setActionError(null);

    try {
      await createAudienceContact(input);
      invalidateQueriesByPrefix('email-excluded.list-contacts');
      setAddOpen(false);
      notifySuccess('Contact added');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to add contact');
      setActionError(message);
      notifyError(message);
    }
  }

  return (
    <>
      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={3}>
            <Box className="flex flex-col gap-3 border-b border-surface-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <Stack spacing={0.5}>
                <Typography variant="h6" className="font-bold">
                  All contacts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Every contact across imported and manual lists, deduplicated by
                  email. Contacts added here are not attached to any list until
                  you assign them later.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} className="w-full sm:w-auto">
                <TextField
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search email, name, or list"
                  size="small"
                  className="w-full rounded-xl sm:w-72"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlinedIcon
                            sx={{ color: 'text.secondary', fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Clear search"
                            size="small"
                            onClick={() => {
                              setSearch('');
                              setPage(1);
                            }}
                            edge="end"
                          >
                            <CloseOutlinedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />
                {canCreate ? (
                  <Tooltip title="Add contact">
                    <IconButton
                      aria-label="Add contact"
                      onClick={() => {
                        setActionError(null);
                        setAddOpen(true);
                      }}
                      sx={{
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        p: 0,
                        flexShrink: 0,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'var(--color-primary)',
                        bgcolor: 'transparent',
                        color: 'var(--color-primary)',
                        boxShadow: 'none',
                        '@media (hover: hover)': {
                          '&:hover': {
                            bgcolor: 'transparent',
                            borderColor: 'var(--color-primary-dark)',
                            color: 'var(--color-primary-dark)',
                          },
                        },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Stack>
            </Box>

            <BrowseAllListContactsTable
              enabled={enabled}
              showExcludeAction={false}
              showAssignAction
              showStatusColumn
              tableId="email-audience-all-contacts"
              search={search}
              page={page}
              onPageChange={setPage}
              onAssignContact={(contact) => {
                setAssignError(null);
                setAssignContact(contact);
              }}
              isAdding={isAssigning}
            />
          </Stack>
        </CardContent>
      </Card>

      <AddAudienceContactDialog
        open={addOpen}
        isSubmitting={isCreating}
        error={actionError}
        onClose={() => {
          setAddOpen(false);
          setActionError(null);
        }}
        onSubmit={handleAddContact}
      />

      <AssignAudienceContactToListDialog
        open={assignContact !== null}
        contactEmail={assignContact?.email ?? ''}
        contactName={assignContact?.name ?? ''}
        isSubmitting={isAssigning}
        error={assignError}
        onClose={() => {
          setAssignContact(null);
          setAssignError(null);
        }}
        onSubmit={handleAssignContact}
      />
    </>
  );
}
