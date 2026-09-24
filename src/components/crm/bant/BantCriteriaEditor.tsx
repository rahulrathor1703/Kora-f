'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import BantCriterionOptionsEditor from '@/components/crm/bant/BantCriterionOptionsEditor';
import { slugifyBantKey } from '@/lib/crm/bant/scoring';
import type { BantCriterion, BantSettingsConfig } from '@/lib/crm/bant/types';

interface BantCriteriaEditorProps {
  config: BantSettingsConfig;
  onChange: (config: BantSettingsConfig) => void;
  readOnly?: boolean;
}

function createCriterion(sortOrder: number): BantCriterion {
  const id = crypto.randomUUID();
  const label = 'New criterion';
  return {
    id,
    key: slugifyBantKey(`${label}_${id.slice(0, 8)}`),
    label,
    description: '',
    weight: 25,
    sortOrder,
    isActive: true,
    options: [
      {
        id: crypto.randomUUID(),
        label: 'Strong',
        value: 'strong',
        points: 100,
        sortOrder: 0,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        label: 'Weak',
        value: 'weak',
        points: 25,
        sortOrder: 1,
        isActive: true,
      },
    ],
  };
}

export default function BantCriteriaEditor({
  config,
  onChange,
  readOnly = false,
}: BantCriteriaEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    config.criteria[0]?.id ?? null,
  );

  const sortedCriteria = [...config.criteria].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  function updateCriteria(nextCriteria: BantCriterion[]) {
    onChange({ ...config, criteria: nextCriteria });
  }

  function updateCriterion(id: string, patch: Partial<BantCriterion>) {
    updateCriteria(
      config.criteria.map((criterion) =>
        criterion.id === id ? { ...criterion, ...patch } : criterion,
      ),
    );
  }

  function removeCriterion(id: string) {
    updateCriteria(config.criteria.filter((criterion) => criterion.id !== id));
  }

  function addCriterion() {
    const next = createCriterion(config.criteria.length);
    updateCriteria([...config.criteria, next]);
    setExpandedId(next.id);
  }

  return (
    <Stack spacing={2}>
      {sortedCriteria.map((criterion) => {
        const isExpanded = expandedId === criterion.id;

        return (
          <Box
            key={criterion.id}
            className="rounded-2xl border border-border/60 bg-surface/40"
          >
            <Box className="flex items-start gap-2 p-4">
              <IconButton
                aria-label={isExpanded ? 'Collapse criterion' : 'Expand criterion'}
                size="small"
                onClick={() => setExpandedId(isExpanded ? null : criterion.id)}
                className={isExpanded ? 'rotate-180' : undefined}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>

              <Box className="min-w-0 flex-1">
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { md: 'center' } }}
                >
                  <TextField
                    label="Label"
                    size="small"
                    value={criterion.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      updateCriterion(criterion.id, {
                        label,
                        key: slugifyBantKey(label) || criterion.key,
                      });
                    }}
                    disabled={readOnly}
                    className="min-w-[180px]"
                  />
                  <TextField
                    label="Key"
                    size="small"
                    value={criterion.key}
                    onChange={(event) =>
                      updateCriterion(criterion.id, { key: event.target.value })
                    }
                    disabled={readOnly}
                    className="min-w-[160px]"
                  />
                  <TextField
                    label="Weight"
                    size="small"
                    type="number"
                    value={criterion.weight}
                    onChange={(event) =>
                      updateCriterion(criterion.id, {
                        weight: Number(event.target.value),
                      })
                    }
                    disabled={readOnly}
                    slotProps={{ htmlInput: { min: 1, max: 100 } }}
                    className="w-[120px]"
                  />
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Switch
                      checked={criterion.isActive}
                      onChange={(event) =>
                        updateCriterion(criterion.id, {
                          isActive: event.target.checked,
                        })
                      }
                      disabled={readOnly}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Active
                    </Typography>
                  </Stack>
                </Stack>

                <TextField
                  label="Description"
                  size="small"
                  value={criterion.description ?? ''}
                  onChange={(event) =>
                    updateCriterion(criterion.id, {
                      description: event.target.value,
                    })
                  }
                  disabled={readOnly}
                  fullWidth
                  multiline
                  minRows={1}
                  className="mt-3"
                />
              </Box>

              {!readOnly ? (
                <IconButton
                  aria-label="Delete criterion"
                  size="small"
                  onClick={() => removeCriterion(criterion.id)}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </Box>

            <Collapse in={isExpanded}>
              <Box className="border-t border-border/50 px-4 pb-4 pt-3">
                <Typography
                  variant="overline"
                  className="mb-2 block font-semibold tracking-[0.12em] text-primary"
                >
                  Options
                </Typography>
                <BantCriterionOptionsEditor
                  options={criterion.options}
                  onChange={(options) =>
                    updateCriterion(criterion.id, { options })
                  }
                  readOnly={readOnly}
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {!readOnly ? (
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={addCriterion}
          className="self-start"
        >
          Add criterion
        </Button>
      ) : null}
    </Stack>
  );
}
