'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { CampaignRecipientDisposition } from '@/lib/email/campaigns/recipient-types';
import {
  canExcludeRecipient,
  canIncludeRecipient,
} from '@/lib/email/campaigns/disposition-utils';

interface CampaignRecipientExcludeActionsProps {
  campaignId: string;
  recipientId: string;
  email: string;
  contactDisposition: CampaignRecipientDisposition;
  isUpdating?: boolean;
  onExclude: (campaignId: string, recipientId: string, email: string) => void;
  onInclude: (campaignId: string, recipientId: string, email: string) => void;
}

export default function CampaignRecipientExcludeActions({
  campaignId,
  recipientId,
  email,
  contactDisposition,
  isUpdating = false,
  onExclude,
  onInclude,
}: CampaignRecipientExcludeActionsProps) {
  if (canExcludeRecipient(contactDisposition)) {
    return (
      <Button
        variant="outlined"
        color="error"
        size="small"
        disabled={isUpdating}
        className="rounded-xl normal-case"
        onClick={(event) => {
          event.stopPropagation();
          onExclude(campaignId, recipientId, email);
        }}
      >
        Exclude
      </Button>
    );
  }

  if (canIncludeRecipient(contactDisposition)) {
    return (
      <Button
        variant="contained"
        size="small"
        disabled={isUpdating}
        className="rounded-xl normal-case"
        onClick={(event) => {
          event.stopPropagation();
          onInclude(campaignId, recipientId, email);
        }}
      >
        Include
      </Button>
    );
  }

  return (
    <Tooltip title="This contact cannot be excluded or included from here">
      <Stack sx={{ px: 1 }}>
        <Button
          variant="text"
          size="small"
          disabled
          className="normal-case"
          onClick={(event) => event.stopPropagation()}
        >
          —
        </Button>
      </Stack>
    </Tooltip>
  );
}
