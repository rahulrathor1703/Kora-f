'use client';

import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { AudienceListType } from '@/lib/email/campaigns/types';

interface AudienceSummaryPanelProps {
  audienceListType: AudienceListType;
  listName: string;
  recipientCount: number;
  audienceListHref: string;
}

const LIST_TYPE_LABELS: Record<AudienceListType, string> = {
  contact: 'Contact list',
  manual: 'Manual list',
};

function MetaDot() {
  return (
    <Typography component="span" variant="body2" color="text.secondary" sx={{ mx: 0.75 }}>
      ·
    </Typography>
  );
}

export default function AudienceSummaryPanel({
  audienceListType,
  listName,
  recipientCount,
  audienceListHref,
}: AudienceSummaryPanelProps) {
  const recipientLabel =
    recipientCount === 1 ? '1 recipient' : `${recipientCount.toLocaleString()} recipients`;

  return (
    <Box className="dashboard-panel rounded-2xl px-4 py-3 md:px-5">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography
          variant="body2"
          className="min-w-0 leading-relaxed sm:truncate"
          title={`${LIST_TYPE_LABELS[audienceListType]} · ${listName} · ${recipientLabel}`}
        >
          <Box component="span" className="font-bold">
            Audience
          </Box>
          <MetaDot />
          <Box component="span">{LIST_TYPE_LABELS[audienceListType]}</Box>
          <MetaDot />
          <Box component="span">{listName}</Box>
          <MetaDot />
          <Box component="span" className="font-medium">
            {recipientLabel}
          </Box>
        </Typography>

        <Button
          component={Link}
          href={audienceListHref}
          variant="outlined"
          size="small"
          endIcon={<OpenInNewOutlinedIcon />}
          className="shrink-0 self-start rounded-xl sm:self-center"
        >
          View list
        </Button>
      </Stack>
    </Box>
  );
}
