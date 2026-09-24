'use client';

import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';
import CampaignsContent from '@/components/email/campaigns/CampaignsContent';
import EmailHubShell from '@/components/email/EmailHubShell';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function CampaignsPage() {
  const router = useRouter();
  const toOrgPath = useOrgPath();

  return (
    <EmailHubShell
      actions={
        <Stack direction="row" spacing={1} className="flex-wrap">
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeOutlinedIcon />}
            onClick={() => router.push(toOrgPath('/email/campaigns/new?ai=1'))}
            className="shrink-0 rounded-2xl"
          >
            Build campaign with AI
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(toOrgPath('/email/campaigns/new'))}
            className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
          >
            Create campaign
          </Button>
        </Stack>
      }
    >
      <CampaignsContent />
    </EmailHubShell>
  );
}
