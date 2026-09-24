'use client';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import ContactListImportFlow, {
  type ContactListImportSuccessResult,
} from '@/components/email/lists/import/ContactListImportFlow';
import ManualListBuilderForm, {
  type ManualListBuilderSuccessResult,
} from '@/components/lists/ManualListBuilderForm';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { AudienceListType } from '@/lib/email/campaigns/types';

type AudienceListCreationTab = 'upload' | 'manual';

export interface CreatedAudienceListResult {
  type: AudienceListType;
  id: string;
  name: string;
  count: number;
  prospectSync?: {
    created: number;
    skipped: number;
    failed: number;
  };
}

interface CreateAudienceListDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (result: CreatedAudienceListResult) => void;
}

export default function CreateAudienceListDialog({
  open,
  onClose,
  onCreated,
}: CreateAudienceListDialogProps) {
  const canCreateManualList = useHasPermission('manual-lists:create');
  const canReadProspects = useHasPermission('prospects:read');
  const canSyncProspects = useHasPermission('prospects:create');
  const [activeTab, setActiveTab] =
    useState<AudienceListCreationTab>('upload');
  const [syncToProspects, setSyncToProspects] = useState(false);

  function handleCreated(
    result: ContactListImportSuccessResult | ManualListBuilderSuccessResult,
  ) {
    onCreated({
      type: result.type,
      id: result.id,
      name: result.name,
      count: result.count,
      prospectSync: result.prospectSync,
    });
    setSyncToProspects(false);
    setActiveTab('upload');
    onClose();
  }

  function handleClose() {
    setSyncToProspects(false);
    setActiveTab('upload');
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
          },
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }} className="font-bold">
        Add new audience list
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: 'min(720px, calc(100dvh - 7rem))',
        }}
      >
        <Stack spacing={3} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 'manual'
              ? canReadProspects
                ? 'Name your list, add contacts manually or from CRM, and continue.'
                : 'Name your list, fill in contacts, and continue.'
              : 'Upload a CSV or Excel file to import contacts.'}
          </Typography>

          {canCreateManualList ? (
            <Tabs
              value={activeTab}
              onChange={(_event, value: AudienceListCreationTab) =>
                setActiveTab(value)
              }
              variant="fullWidth"
            >
              <Tab label="Upload file" value="upload" />
              <Tab label="Manual list" value="manual" />
            </Tabs>
          ) : null}

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'upload' || !canCreateManualList ? (
              <ContactListImportFlow
                embedded
                syncToProspects={syncToProspects}
                onSyncToProspectsChange={setSyncToProspects}
                showCrmToggle={canSyncProspects}
                onCancel={handleClose}
                onSuccess={handleCreated}
              />
            ) : (
              <ManualListBuilderForm
                embedded
                syncToProspects={syncToProspects}
                onSyncToProspectsChange={setSyncToProspects}
                showCrmToggle={canSyncProspects}
                showProspectPicker={canReadProspects}
                onCancel={handleClose}
                onSuccess={handleCreated}
              />
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
