'use client';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { renderProspectSelectCell } from '@/components/crm/prospects/prospect-field-renderers';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface ProspectInlineSelectCellProps {
  field: ProspectFieldDefinition;
  value: string | number | null | undefined;
  disabled?: boolean;
  isSaving?: boolean;
  onSave: (value: string) => Promise<void>;
}

export default function ProspectInlineSelectCell({
  field,
  value,
  disabled = false,
  isSaving = false,
  onSave,
}: ProspectInlineSelectCellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const statusColor = useMemo(() => {
    const option = field.options?.find(
      (item) => item.value === String(value ?? ''),
    );
    return option?.color;
  }, [field.options, value]);

  async function handleSelect(nextValue: string) {
    setAnchorEl(null);

    if (String(value ?? '') === nextValue) {
      return;
    }

    await onSave(nextValue);
  }

  const trailingIcon =
    disabled ? null : (
      <KeyboardArrowDownOutlinedIcon
        aria-hidden
        sx={{
          fontSize: 16,
          color: 'inherit',
          opacity: 0.85,
          transition: 'transform 150ms ease',
          transform: open ? 'rotate(180deg)' : 'none',
        }}
      />
    );

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled && !isSaving) {
          setAnchorEl(event.currentTarget);
        }
      }}
      role="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={`Change ${field.label}`}
      className={`inline-flex min-h-8 items-center ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
      sx={{
        ...(disabled || isSaving
          ? undefined
          : {
              '&:hover .MuiChip-root': statusColor
                ? { bgcolor: `${statusColor}33` }
                : { bgcolor: 'action.hover' },
            }),
      }}
    >
      {isSaving ? (
        <CircularProgress size={16} />
      ) : (
        renderProspectSelectCell(field, value, trailingIcon)
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(event) => event.stopPropagation()}
      >
        {(field.options ?? []).map((option) => (
          <MenuItem
            key={option.value}
            selected={String(value ?? '') === option.value}
            onClick={() => void handleSelect(option.value)}
          >
            <Box className="flex items-center gap-2">
              {option.color ? (
                <Box
                  className="h-2.5 w-2.5 rounded-full"
                  sx={{ bgcolor: option.color }}
                />
              ) : null}
              <Typography variant="body2">{option.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
