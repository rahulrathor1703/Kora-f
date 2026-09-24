'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FormFieldDefinition } from '@/lib/forms/types';
import { formLayoutPreviewPlaceholder } from '@/lib/forms/form-layout-field-preview.utils';

const layoutInputClassName = [
  '[&_.MuiOutlinedInput-root]:rounded-lg [&_.MuiOutlinedInput-root]:bg-white',
  '[&_.MuiOutlinedInput-root]:transition-[box-shadow,border-color] [&_.MuiOutlinedInput-root]:duration-200',
  '[&_.MuiOutlinedInput-notchedOutline]:border-slate-200',
  '[&_.MuiOutlinedInput-root.Mui-disabled]:bg-white',
  '[&_.MuiOutlinedInput-root.Mui-focused]:outline-none',
  '[&_.MuiOutlinedInput-root]:shadow-none',
  '[&_.MuiFormControl-root]:outline-none',
  '[&_.MuiInputBase-input]:py-[0.62rem] [&_.MuiInputBase-input]:text-sm',
  '[&_.MuiInputBase-input.Mui-disabled]:text-slate-400',
].join(' ');

export function FormLayoutFieldLabel({ field }: { field: FormFieldDefinition }) {
  return (
    <Typography
      component="label"
      variant="body2"
      className="block text-[13px] font-medium leading-snug text-slate-800"
    >
      {field.label}
      {field.required ? (
        <Typography component="span" className="ml-0.5 text-red-500" aria-hidden>
          *
        </Typography>
      ) : null}
    </Typography>
  );
}

export function FormLayoutFieldPreviewInput({ field }: { field: FormFieldDefinition }) {
  const placeholder = formLayoutPreviewPlaceholder(field);

  if (field.type === 'select' || field.type === 'multiselect') {
    return (
      <TextField
        select
        size="small"
        value=""
        fullWidth
        disabled
        className={layoutInputClassName}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value="" disabled>
          <span className="text-slate-400">{placeholder}</span>
        </MenuItem>
      </TextField>
    );
  }

  if (field.type === 'textarea') {
    return (
      <TextField
        size="small"
        value=""
        placeholder={placeholder}
        fullWidth
        multiline
        minRows={3}
        disabled
        className={layoutInputClassName}
      />
    );
  }

  return (
    <TextField
      size="small"
      value=""
      placeholder={placeholder}
      fullWidth
      disabled
      type={
        field.type === 'email'
          ? 'email'
          : field.type === 'phone'
            ? 'tel'
            : field.type === 'number'
              ? 'number'
              : 'text'
      }
      className={layoutInputClassName}
    />
  );
}

interface FormLayoutFieldPreviewProps {
  field: FormFieldDefinition;
  /** When true, only the control row (no label heading). */
  inputOnly?: boolean;
}

export default function FormLayoutFieldPreview({
  field,
  inputOnly = false,
}: FormLayoutFieldPreviewProps) {
  if (inputOnly) {
    return <FormLayoutFieldPreviewInput field={field} />;
  }

  return (
    <Stack spacing={0.75} className="min-w-0 flex-1">
      <FormLayoutFieldLabel field={field} />
      <FormLayoutFieldPreviewInput field={field} />
    </Stack>
  );
}
