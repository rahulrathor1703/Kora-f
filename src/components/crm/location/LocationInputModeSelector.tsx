'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import type { LocationInputMode } from '@/lib/crm/location/types';

interface LocationInputModeSelectorProps {
  value: LocationInputMode;
  onChange: (mode: LocationInputMode) => void;
}

export default function LocationInputModeSelector({
  value,
  onChange,
}: LocationInputModeSelectorProps) {
  return (
    <Stack spacing={1}>
      <FormLabel component="legend">Input mode</FormLabel>
      <RadioGroup
        value={value}
        onChange={(event) => onChange(event.target.value as LocationInputMode)}
      >
        <FormControlLabel
          value="api"
          control={<Radio />}
          label="API autocomplete"
        />
        <FormControlLabel
          value="manual"
          control={<Radio />}
          label="Manual entry"
        />
      </RadioGroup>
    </Stack>
  );
}
