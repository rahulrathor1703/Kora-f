import PlatformFormEditorContent from '@/components/platform/PlatformFormEditorContent';
import Box from '@mui/material/Box';

interface PlatformFormEditorPageProps {
  params: Promise<{ formKey: string }>;
}

export default async function PlatformFormEditorPage({
  params,
}: PlatformFormEditorPageProps) {
  const { formKey } = await params;

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full">
      <PlatformFormEditorContent formKey={decodeURIComponent(formKey)} />
    </Box>
  );
}
