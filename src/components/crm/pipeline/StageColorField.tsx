'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  DEFAULT_STAGE_COLOR,
  STAGE_COLOR_PRESETS,
  normalizeStageColor,
} from '@/lib/crm/pipeline/stage-color';

interface StageColorFieldProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function StageColorField({
  value,
  onChange,
  label = 'Stage color',
}: StageColorFieldProps) {
  const normalizedValue = normalizeStageColor(value) ?? DEFAULT_STAGE_COLOR;
  const hexInputValue = value.startsWith('#') ? value : `#${value}`;
  const isHexValid = normalizeStageColor(hexInputValue) !== null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" className="font-medium">
        {label}
      </Typography>

      <Stack direction="row" spacing={1} className="flex-wrap gap-y-2">
        {STAGE_COLOR_PRESETS.map((preset) => {
          const isSelected = normalizedValue === preset.toLowerCase();

          return (
            <button
              key={preset}
              type="button"
              aria-label={`Use color ${preset}`}
              aria-pressed={isSelected}
              onClick={() => onChange(preset)}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                isSelected
                  ? 'border-foreground ring-2 ring-offset-2 ring-offset-background'
                  : 'border-transparent'
              }`}
              style={{
                backgroundColor: preset,
                ...(isSelected ? { boxShadow: `0 0 0 2px ${preset}55` } : {}),
              }}
            />
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          component="label"
          className="relative inline-flex h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border/70"
          sx={{ bgcolor: 'background.paper' }}
        >
          <Box
            component="input"
            type="color"
            value={normalizedValue}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
            aria-label="Pick a custom color"
          />
        </Box>

        <TextField
          label="Hex code"
          value={hexInputValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#3b82f6"
          size="small"
          fullWidth
          error={hexInputValue.length > 0 && !isHexValid}
          helperText={
            hexInputValue.length > 0 && !isHexValid
              ? 'Enter a valid hex color like #3b82f6'
              : 'Choose any color with the picker or enter a hex code'
          }
          slotProps={{
            input: {
              sx: { fontFamily: 'ui-monospace, monospace' },
            },
          }}
        />
      </Stack>
    </Stack>
  );
}
