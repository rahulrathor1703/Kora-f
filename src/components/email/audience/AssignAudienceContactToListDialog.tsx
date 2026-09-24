'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useContactLists } from '@/hooks/useContactLists';
import { useManualLists } from '@/hooks/useManualLists';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { EmailExcludedListType } from '@/lib/api/services/email-excluded.service';

interface AssignAudienceContactToListDialogProps {
  open: boolean;
  contactEmail: string;
  contactName: string;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: {
    email: string;
    listId: string;
    listType: EmailExcludedListType;
  }) => Promise<void>;
}

interface ListOption {
  id: string;
  name: string;
  listType: EmailExcludedListType;
  label: string;
}

export default function AssignAudienceContactToListDialog({
  open,
  contactEmail,
  contactName,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AssignAudienceContactToListDialogProps) {
  const canViewManualLists = useHasPermission('manual-lists:read');
  const { lists: contactLists, isLoading: isContactListsLoading } =
    useContactLists();
  const { lists: manualLists, isLoading: isManualListsLoading } =
    useManualLists();
  const [selectedListKey, setSelectedListKey] = useState('');

  const listOptions = useMemo(() => {
    const options: ListOption[] = contactLists.map((list) => ({
      id: list.id,
      name: list.name,
      listType: 'contact',
      label: `${list.name} (Imported)`,
    }));

    if (canViewManualLists) {
      options.push(
        ...manualLists.map((list) => ({
          id: list.id,
          name: list.name,
          listType: 'manual' as const,
          label: `${list.name} (Manual)`,
        })),
      );
    }

    return options.sort((left, right) => left.name.localeCompare(right.name));
  }, [canViewManualLists, contactLists, manualLists]);

  const selectedList = listOptions.find(
    (option) => `${option.listType}:${option.id}` === selectedListKey,
  );
  const isLoading = isContactListsLoading || isManualListsLoading;

  function handleClose() {
    setSelectedListKey('');
    onClose();
  }

  async function handleSubmit() {
    if (!selectedList) {
      return;
    }

    await onSubmit({
      email: contactEmail,
      listId: selectedList.id,
      listType: selectedList.listType,
    });
    setSelectedListKey('');
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add to list</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          <Typography variant="body2" color="text.secondary">
            Assign{' '}
            <Typography component="span" variant="body2" className="font-medium">
              {contactName || contactEmail}
            </Typography>{' '}
            to a list. Their details will carry over and they will no longer
            appear as unassigned.
          </Typography>

          <FormControl fullWidth disabled={isLoading || listOptions.length === 0}>
            <InputLabel id="assign-audience-contact-list-label">List</InputLabel>
            <Select
              labelId="assign-audience-contact-list-label"
              label="List"
              value={selectedListKey}
              onChange={(event) => setSelectedListKey(event.target.value)}
            >
              {listOptions.map((option) => (
                <MenuItem
                  key={`${option.listType}:${option.id}`}
                  value={`${option.listType}:${option.id}`}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!isLoading && listOptions.length === 0 ? (
            <Alert severity="info" className="rounded-2xl">
              Create a list first from the Lists tab, then come back to assign
              this contact.
            </Alert>
          ) : null}

          {error ? (
            <Alert severity="error" className="rounded-2xl">
              {error}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !selectedList}
          className="rounded-xl"
        >
          Add to list
        </Button>
      </DialogActions>
    </Dialog>
  );
}
