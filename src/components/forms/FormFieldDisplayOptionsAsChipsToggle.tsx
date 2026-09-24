'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

interface FormFieldDisplayOptionsAsChipsToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function FormFieldDisplayOptionsAsChipsToggle({
  checked,
  onChange,
  disabled = false,
}: FormFieldDisplayOptionsAsChipsToggleProps) {
  return (
    <FormControlLabel
      className={[
        'm-0 w-full justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30',
      ].join(' ')}
      control={
        <Switch
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          size="small"
        />
      }
      label={
        <StackLabel
          title="Show as chip"
          description="Colored chips in tables and detail views (edit controls stay dropdowns)."
        />
      }
      labelPlacement="start"
      sx={{ '& .MuiFormControlLabel-label': { flex: 1 } }}
    />
  );
}

function StackLabel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <span className="block pr-2">
      <Typography variant="body2" className="text-[13px] font-medium text-slate-800">
        {title}
      </Typography>
      <Typography variant="caption" className="mt-0.5 block text-[11px] text-slate-500">
        {description}
      </Typography>
    </span>
  );
}
