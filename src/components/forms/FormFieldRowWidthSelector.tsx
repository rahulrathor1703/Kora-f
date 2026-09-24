'use client';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import {
  FORM_FIELD_ROW_WIDTH_PRESETS,
  colSpanToWidthPresetIndex,
  widthPresetIndexToColSpan,
} from '@/lib/forms/form-field-width.utils';

interface FormFieldRowWidthSelectorProps {
  colSpan: number;
  onChange: (colSpan: number) => void;
  disabled?: boolean;
}

export default function FormFieldRowWidthSelector({
  colSpan,
  onChange,
  disabled = false,
}: FormFieldRowWidthSelectorProps) {
  const presetIndex = colSpanToWidthPresetIndex(colSpan);
  const maxIndex = FORM_FIELD_ROW_WIDTH_PRESETS.length - 1;

  function selectPreset(index: number) {
    if (disabled) {
      return;
    }

    onChange(widthPresetIndexToColSpan(index));
  }

  return (
    <Box
      className={[
        'rounded-xl border border-dashed border-slate-200 bg-slate-50/50',
        'px-4 pb-4 pt-3.5',
      ].join(' ')}
    >
      <Typography
        variant="body2"
        className="mb-5 text-[13px] font-medium text-slate-800"
      >
        Set field width in row
      </Typography>

      <Box className="px-1">
        <Slider
          value={presetIndex}
          min={0}
          max={maxIndex}
          step={1}
          disabled={disabled}
          marks={FORM_FIELD_ROW_WIDTH_PRESETS.map((_, index) => ({
            value: index,
          }))}
          onChange={(_, value) => {
            const index = Array.isArray(value) ? value[0] : value;
            selectPreset(index);
          }}
          aria-label="Field width in row"
          sx={(theme) => ({
            height: 6,
            py: 1.5,
            color: theme.palette.primary.main,
            '& .MuiSlider-rail': {
              opacity: 1,
              height: 6,
              borderRadius: 999,
              backgroundColor: `${theme.palette.primary.main}22`,
            },
            '& .MuiSlider-track': {
              height: 6,
              borderRadius: 999,
              border: 'none',
            },
            '& .MuiSlider-thumb': {
              width: 18,
              height: 18,
              boxShadow: `0 0 0 4px ${theme.palette.primary.main}22`,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 6px ${theme.palette.primary.main}28`,
              },
            },
            '& .MuiSlider-mark': {
              width: 2,
              height: 8,
              borderRadius: 1,
              backgroundColor: theme.palette.primary.main,
              opacity: 0.35,
            },
            '& .MuiSlider-markActive': {
              opacity: 0.85,
            },
          })}
        />
      </Box>

      <Box
        className="mt-1 grid grid-cols-5 gap-0.5"
        role="radiogroup"
        aria-label="Field width presets"
      >
        {FORM_FIELD_ROW_WIDTH_PRESETS.map((preset, index) => {
          const selected = index === presetIndex;

          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => selectPreset(index)}
              className={[
                'flex flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-center',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white/80',
                selected ? 'bg-white shadow-sm ring-1 ring-primary/15' : '',
              ].join(' ')}
            >
              <Typography
                variant="caption"
                component="span"
                className={[
                  'text-[11px] font-semibold leading-tight sm:text-xs',
                  selected ? 'text-primary' : 'text-slate-600',
                ].join(' ')}
              >
                {preset.label}
              </Typography>
              <Typography
                variant="caption"
                component="span"
                className="text-[10px] leading-tight text-slate-500 sm:text-[11px]"
              >
                ({preset.percentLabel})
              </Typography>
            </button>
          );
        })}
      </Box>
    </Box>
  );
}
