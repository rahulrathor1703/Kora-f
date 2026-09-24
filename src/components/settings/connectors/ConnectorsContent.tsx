'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import NotionConnectionCard from '@/components/settings/connectors/NotionConnectionCard';
import NotionImportWizard from '@/components/settings/connectors/NotionImportWizard';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotionConnection } from '@/hooks/useNotionIntegration';

export default function ConnectorsContent() {
  const canManage = useHasPermission('integrations:manage');
  const { data } = useNotionConnection();
  const connected = Boolean(data?.connected);

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Integrations"
        title="Connectors"
        description="Connect Notion with an integration token and import databases into Markos when you want."
      />

      {canManage ? (
        <>
          <NotionConnectionCard />
          {connected ? <NotionImportWizard /> : null}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          You need permission to manage integrations.
        </Typography>
      )}
    </Stack>
  );
}
