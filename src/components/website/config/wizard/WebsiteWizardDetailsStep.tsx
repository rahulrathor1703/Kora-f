'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { WebsiteWizardDraft } from '@/lib/website/wizard-session';

interface WebsiteWizardDetailsStepProps {
  draft: WebsiteWizardDraft;
  onChange: (patch: Partial<WebsiteWizardDraft>) => void;
}

export default function WebsiteWizardDetailsStep({
  draft,
  onChange,
}: WebsiteWizardDetailsStepProps) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" className="font-semibold">
          Website details
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Add the website you want to monitor and audit.
        </Typography>
      </Box>

      <TextField
        label="Name"
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
        placeholder="Evervent"
        fullWidth
        required
      />
      <TextField
        label="Website URL / Domain"
        value={draft.domain}
        onChange={(event) => onChange({ domain: event.target.value })}
        placeholder="www.evervent.io"
        fullWidth
        required
        helperText="Used to auto-match GA4 and Search Console properties."
      />
      <TextField
        label="Sitemap URL"
        value={draft.sitemapUrl}
        onChange={(event) => onChange({ sitemapUrl: event.target.value })}
        placeholder="https://www.evervent.io/sitemap.xml"
        fullWidth
        required
      />
      <TextField
        label="Max pages per audit"
        type="number"
        value={draft.maxPages}
        onChange={(event) =>
          onChange({ maxPages: Number(event.target.value) || 20 })
        }
        slotProps={{ htmlInput: { min: 1, max: 100 } }}
        fullWidth
      />
      <FormControlLabel
        control={
          <Switch
            checked={draft.isActive}
            onChange={(event) => onChange({ isActive: event.target.checked })}
          />
        }
        label="Active for scheduled audits"
      />
    </Stack>
  );
}
