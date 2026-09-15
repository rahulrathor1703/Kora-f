'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import PlatformPageHeader from '@/components/platform/PlatformPageHeader';
import FormsRegistryList from '@/components/forms/FormsRegistryList';
import { usePlatformFormRegistry } from '@/hooks/useForms';

export default function PlatformFormsContent() {
  const { data, isLoading, error } = usePlatformFormRegistry();

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full">
      <Stack spacing={3}>
        <PlatformPageHeader
          overline="Platform administration"
          title="Forms"
          description="Manage platform-wide form baselines. The platform owner can edit every field property, layout, and ordering."
        />

        <FormsRegistryList
          forms={data?.forms ?? []}
          mode="platform"
          isLoading={isLoading}
          errorMessage={error ? 'Unable to load platform forms.' : null}
          buildEditHref={(formKey) =>
            `/platform/forms/${encodeURIComponent(formKey)}`
          }
          heroTitle="Form registry"
          heroDescription="Configure default schemas for every registered form. The platform owner can extend supported forms per organization when impersonating a tenant."
          heroOverline="Platform administration"
          editActionLabel="Edit baseline"
        />
      </Stack>
    </Box>
  );
}
