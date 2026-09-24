'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  createEmptyFormFieldOption,
  DEFAULT_FORM_FIELD_OPTION_COLOR,
  formFieldOptionChipSx,
  resolveFormFieldOptionColor,
  slugifyFormFieldOptionValue,
} from '@/lib/forms/form-field-options.utils';
import { formBuilderFieldClassName } from '@/lib/forms/form-builder-dialog.styles';
import type { FormFieldOption } from '@/lib/forms/types';

interface FormFieldOptionsEditorProps {
  options: FormFieldOption[];
  onChange: (options: FormFieldOption[]) => void;
  disabled?: boolean;
  /** Org platform fields: allow color edits only (labels/values locked). */
  readOnlyLabels?: boolean;
  /** Pipeline platform stages: lock internal value key only. */
  valueLockedOptions?: ReadonlySet<string>;
  canRemoveOption?: (option: FormFieldOption) => boolean;
  showChipPreview?: boolean;
}

export default function FormFieldOptionsEditor({
  options,
  onChange,
  disabled = false,
  readOnlyLabels = false,
  valueLockedOptions,
  canRemoveOption,
  showChipPreview = true,
}: FormFieldOptionsEditorProps) {
  const labelsLocked = disabled || readOnlyLabels;

  function isOptionValueLocked(option: FormFieldOption): boolean {
    return valueLockedOptions?.has(option.value) ?? false;
  }

  function canRemoveAtIndex(index: number): boolean {
    const option = options[index];
    if (!option || options.length <= 1) {
      return false;
    }

    if (labelsLocked) {
      return false;
    }

    if (canRemoveOption && !canRemoveOption(option)) {
      return false;
    }

    return true;
  }
  function updateOption(index: number, patch: Partial<FormFieldOption>) {
    onChange(
      options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  }

  function removeOption(index: number) {
    if (options.length <= 1) {
      return;
    }

    onChange(options.filter((_, optionIndex) => optionIndex !== index));
  }

  function addOption() {
    onChange([...options, createEmptyFormFieldOption()]);
  }

  function handleLabelBlur(index: number) {
    const option = options[index];
    if (!option || option.value.trim()) {
      return;
    }

    const slug = slugifyFormFieldOptionValue(option.label);
    if (slug) {
      updateOption(index, { value: slug });
    }
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" className="text-[13px] font-medium text-slate-800">
        Options
      </Typography>

      {options.map((option, index) => {
        const previewColor = resolveFormFieldOptionColor(option.color);
        const previewLabel = option.label.trim() || 'Preview';

        return (
          <Box
            key={index}
            className="rounded-xl border border-slate-200/80 bg-white p-3"
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'flex-start' } }}
              >
                <TextField
                  label="Label"
                  size="small"
                  value={option.label}
                  onChange={(event) =>
                    updateOption(index, { label: event.target.value })
                  }
                  onBlur={() => handleLabelBlur(index)}
                  disabled={labelsLocked || disabled}
                  fullWidth
                  className={formBuilderFieldClassName}
                />
                <TextField
                  label="Value"
                  size="small"
                  value={option.value}
                  onChange={(event) =>
                    updateOption(index, { value: event.target.value })
                  }
                  disabled={labelsLocked || isOptionValueLocked(option) || disabled}
                  fullWidth
                  className={formBuilderFieldClassName}
                  slotProps={{
                    htmlInput: { className: 'font-mono text-[13px]' },
                  }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
              >
                <TextField
                  label="Color"
                  type="color"
                  size="small"
                  value={previewColor}
                  onChange={(event) =>
                    updateOption(index, { color: event.target.value })
                  }
                  disabled={disabled}
                  className={formBuilderFieldClassName}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ width: 88, minWidth: 88 }}
                />
                <TextField
                  label="Hex"
                  size="small"
                  value={option.color ?? ''}
                  placeholder={DEFAULT_FORM_FIELD_OPTION_COLOR}
                  onChange={(event) =>
                    updateOption(index, { color: event.target.value })
                  }
                  disabled={disabled}
                  className={formBuilderFieldClassName}
                  sx={{ flex: 1, minWidth: 120 }}
                />
                {canRemoveAtIndex(index) ? (
                  <IconButton
                    aria-label="Remove option"
                    size="small"
                    onClick={() => removeOption(index)}
                    className="ml-auto"
                  >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </Stack>

              {showChipPreview ? (
                <Box>
                  <Typography
                    variant="caption"
                    className="mb-1 block text-[11px] text-slate-500"
                  >
                    Preview
                  </Typography>
                  <Chip
                    label={previewLabel}
                    size="small"
                    className="rounded-lg font-medium"
                    sx={formFieldOptionChipSx(previewColor)}
                    variant="filled"
                  />
                </Box>
              ) : null}
            </Stack>
          </Box>
        );
      })}

      {!labelsLocked && !disabled ? (
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          onClick={addOption}
          className="self-start rounded-xl"
        >
          Add option
        </Button>
      ) : null}
    </Stack>
  );
}
