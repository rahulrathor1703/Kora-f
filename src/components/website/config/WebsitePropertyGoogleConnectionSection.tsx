'use client';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { websiteService } from '@/lib/api/services/website.service';

interface WebsitePropertyGoogleConnectionSectionProps {
  propertyId: string | null;
  googleEmail?: string | null;
  canConnect?: boolean;
  onConnectionChange?: () => void;
}

export default function WebsitePropertyGoogleConnectionSection({
  propertyId,
  googleEmail,
  canConnect = false,
  onConnectionChange,
}: WebsitePropertyGoogleConnectionSectionProps) {
  const isConnected = Boolean(googleEmail);

  async function handleDisconnect() {
    if (!propertyId) {
      return;
    }

    await websiteService.disconnectPropertyGoogle(propertyId);
    onConnectionChange?.();
  }

  if (!propertyId) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" className="font-semibold">
        Google account
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Each website can use a shared Google account or connect a different one.
      </Typography>

      {isConnected ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<CheckCircleOutlineOutlinedIcon />}
            label={`Connected: ${googleEmail}`}
            color="success"
            variant="outlined"
          />
          {canConnect ? (
            <Button
              size="small"
              color="inherit"
              startIcon={<LinkOffOutlinedIcon fontSize="small" />}
              onClick={() => void handleDisconnect()}
            >
              Unlink
            </Button>
          ) : null}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No Google account linked to this website.
        </Typography>
      )}
    </Stack>
  );
}
