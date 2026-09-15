'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import ContactListImportFlow from '@/components/email/lists/import/ContactListImportFlow';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useConfirm } from '@/hooks/useConfirm';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function ListImportWizardShell() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const confirm = useConfirm();

  async function handleExit() {
    const shouldLeave = await confirm({
      title: 'Discard list import?',
      description:
        'You have unsaved changes. Leaving now will discard your progress.',
      variant: 'warning',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
    });

    if (shouldLeave) {
      router.push(toOrgPath('/email/lists'));
    }
  }

  function handleSuccess(result: { count: number }) {
    router.push(toOrgPath(`/email/lists?imported=${result.count}`));
  }

  return (
    <Stack spacing={3}>
      <SettingsNavButton
        href="/email/lists?tab=lists"
        label="Back to audience"
        onClick={(event) => {
          event.preventDefault();
          void handleExit();
        }}
      />

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={4}>
            <Box>
              <Typography variant="h5" className="font-bold">
                Add contact list
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Import contacts from a spreadsheet and map columns to list fields.
              </Typography>
            </Box>

            <ContactListImportFlow
              syncToProspects={false}
              onSyncToProspectsChange={() => undefined}
              showCrmToggle={false}
              onCancel={() => void handleExit()}
              onSuccess={handleSuccess}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
