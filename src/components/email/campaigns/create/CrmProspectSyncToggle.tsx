'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';

interface CrmProspectSyncToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}

export default function CrmProspectSyncToggle({
  checked,
  onChange,
  disabled = false,
  disabledReason,
}: CrmProspectSyncToggleProps) {
  return (
    <Stack spacing={0.5}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            disabled={disabled}
          />
        }
        label="Also add to CRM Prospects"
      />
      <FormHelperText className="mx-0">
        {disabled && disabledReason
          ? disabledReason
          : 'Contacts with existing emails in CRM will be skipped.'}
      </FormHelperText>
    </Stack>
  );
}
