'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { BantCriterionOption } from '@/lib/crm/bant/types';

interface BantCriterionOptionsEditorProps {
  options: BantCriterionOption[];
  onChange: (options: BantCriterionOption[]) => void;
  readOnly?: boolean;
}

function createOption(sortOrder: number): BantCriterionOption {
  const id = crypto.randomUUID();
  return {
    id,
    label: 'New option',
    value: `option_${id.slice(0, 8)}`,
    points: 50,
    sortOrder,
    isActive: true,
  };
}

export default function BantCriterionOptionsEditor({
  options,
  onChange,
  readOnly = false,
}: BantCriterionOptionsEditorProps) {
  const sortedOptions = [...options].sort((a, b) => a.sortOrder - b.sortOrder);

  function updateOption(id: string, patch: Partial<BantCriterionOption>) {
    onChange(
      options.map((option) =>
        option.id === id ? { ...option, ...patch } : option,
      ),
    );
  }

  function removeOption(id: string) {
    onChange(options.filter((option) => option.id !== id));
  }

  function addOption() {
    onChange([...options, createOption(options.length)]);
  }

  return (
    <Stack spacing={1.5}>
      {sortedOptions.map((option) => (
        <Box
          key={option.id}
          className="grid gap-2 rounded-xl border border-border/50 bg-background/40 p-3 md:grid-cols-[1fr_1fr_120px_auto_auto]"
        >
          <TextField
            label="Label"
            size="small"
            value={option.label}
            onChange={(event) =>
              updateOption(option.id, { label: event.target.value })
            }
            disabled={readOnly}
          />
          <TextField
            label="Value"
            size="small"
            value={option.value}
            onChange={(event) =>
              updateOption(option.id, { value: event.target.value })
            }
            disabled={readOnly}
          />
          <TextField
            label="Points"
            size="small"
            type="number"
            value={option.points}
            onChange={(event) =>
              updateOption(option.id, { points: Number(event.target.value) })
            }
            disabled={readOnly}
            slotProps={{ htmlInput: { min: 0, max: 100 } }}
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Switch
              checked={option.isActive}
              onChange={(event) =>
                updateOption(option.id, { isActive: event.target.checked })
              }
              disabled={readOnly}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              Active
            </Typography>
          </Stack>
          {!readOnly ? (
            <IconButton
              aria-label="Delete option"
              size="small"
              onClick={() => removeOption(option.id)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      ))}

      {!readOnly ? (
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          onClick={addOption}
          className="self-start"
        >
          Add option
        </Button>
      ) : null}
    </Stack>
  );
}
