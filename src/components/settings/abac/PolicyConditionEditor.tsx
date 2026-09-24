'use client';

import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { useRoles } from '@/hooks/useRoles';
import type { AbacPolicyFormValues } from '@/lib/schemas/abac-policy';

interface PolicyConditionEditorProps {
  control: Control<AbacPolicyFormValues>;
  errors: FieldErrors<AbacPolicyFormValues>;
  disabled?: boolean;
}

export default function PolicyConditionEditor({
  control,
  errors,
  disabled = false,
}: PolicyConditionEditorProps) {
  const { roles } = useRoles();

  return (
    <Stack spacing={3}>
      <Typography variant="caption" color="text.secondary">
        Leave fields empty to match all users assigned to this policy.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Controller
          name="conditions.hierarchyLevel.min"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              onChange={(event) => {
                const next = event.target.value;
                field.onChange(next === '' ? undefined : Number(next));
              }}
              label="Min hierarchy level"
              type="number"
              fullWidth
              disabled={disabled}
              error={Boolean(errors.conditions?.hierarchyLevel?.min)}
              helperText={errors.conditions?.hierarchyLevel?.min?.message}
              slotProps={{
                htmlInput: { min: 1, max: 10 },
              }}
            />
          )}
        />
        <Controller
          name="conditions.hierarchyLevel.max"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              onChange={(event) => {
                const next = event.target.value;
                field.onChange(next === '' ? undefined : Number(next));
              }}
              label="Max hierarchy level"
              type="number"
              fullWidth
              disabled={disabled}
              error={Boolean(errors.conditions?.hierarchyLevel?.max)}
              helperText={errors.conditions?.hierarchyLevel?.max?.message}
              slotProps={{
                htmlInput: { min: 1, max: 10 },
              }}
            />
          )}
        />
      </Stack>

      <Controller
        name="conditions.roleSlugs"
        control={control}
        render={({ field }) => (
          <Autocomplete
            multiple
            options={roles}
            disabled={disabled}
            value={roles.filter((role) => field.value?.includes(role.slug))}
            getOptionLabel={(role) => role.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, selected) =>
              field.onChange(selected.map((role) => role.slug))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Required roles"
                placeholder="Any role if empty"
                error={Boolean(errors.conditions?.roleSlugs)}
                helperText={errors.conditions?.roleSlugs?.message}
              />
            )}
          />
        )}
      />

      <Controller
        name="conditions.status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth disabled={disabled}>
            <InputLabel id="policy-status-label">User status</InputLabel>
            <Select
              labelId="policy-status-label"
              label="User status"
              value={field.value ?? 'any'}
              onChange={(event) => {
                const next = event.target.value;
                field.onChange(next === 'any' ? undefined : next);
              }}
            >
              <MenuItem value="any">Any status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </FormControl>
        )}
      />
    </Stack>
  );
}
