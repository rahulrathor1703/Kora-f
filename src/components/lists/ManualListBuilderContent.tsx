'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import ManualListBuilderForm from '@/components/lists/ManualListBuilderForm';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { PageContainer } from '@/components/ui';
import { useConfirm } from '@/hooks/useConfirm';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function ManualListBuilderContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const confirm = useConfirm();
  const { notifySuccess } = useNotify();
  const canReadProspects = useHasPermission('prospects:read');

  async function handleExit() {
    const shouldLeave = await confirm({
      title: 'Discard list?',
      description: 'Your changes will be lost if you leave this page.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
    });

    if (shouldLeave) {
      router.push(toOrgPath('/email/lists'));
    }
  }

  function handleSuccess() {
    notifySuccess('List created successfully');
    router.push(toOrgPath('/email/lists?manual=created'));
  }

  return (
    <PageContainer className="py-6 md:py-8">
      <Stack spacing={3}>
        <Box>
          <SettingsNavButton
            href={toOrgPath('/email/lists?tab=lists')}
            label="Back to audience"
            onClick={(event) => {
              event.preventDefault();
              void handleExit();
            }}
          />
          <Typography variant="h4" component="h1" className="mt-3 font-bold">
            Create manual list
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mt-1">
            {canReadProspects
              ? 'Add contacts in the table below or pull them from CRM Prospects.'
              : 'Add contacts in the table below. Column headers are editable.'}
          </Typography>
        </Box>

        <ManualListBuilderForm
          syncToProspects={false}
          onSyncToProspectsChange={() => undefined}
          showCrmToggle={false}
          showProspectPicker={canReadProspects}
          onCancel={() => void handleExit()}
          onSuccess={handleSuccess}
        />
      </Stack>
    </PageContainer>
  );
}
