'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import {
  isPipelineFilterCandidate,
  PIPELINE_PRIMARY_FILTER_KEYS,
} from '@/lib/crm/pipeline/filter-config';
import { PIPELINE_STAGE_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import type {
  ProspectFieldDefinition,
  UpdateProspectFieldSchemaInput,
} from '@/lib/crm/prospects/types';

interface ManagePipelineFiltersEditorProps {
  fields: ProspectFieldDefinition[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateProspectFieldSchemaInput) => Promise<void>;
}

function sortFields(fields: ProspectFieldDefinition[]): ProspectFieldDefinition[] {
  return [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
}

export default function ManagePipelineFiltersEditor({
  fields,
  isSubmitting,
  onCancel,
  onSubmit,
}: ManagePipelineFiltersEditorProps) {
  const [draftFields, setDraftFields] = useState<ProspectFieldDefinition[]>(() =>
    sortFields(fields),
  );

  const stageField = useMemo(
    () => draftFields.find((field) => field.key === PIPELINE_STAGE_FIELD_KEY),
    [draftFields],
  );

  const primaryFields = useMemo(
    () =>
      PIPELINE_PRIMARY_FILTER_KEYS.map((key) =>
        draftFields.find((field) => field.key === key),
      ).filter((field): field is ProspectFieldDefinition => field !== undefined),
    [draftFields],
  );

  const optionalFields = useMemo(
    () => draftFields.filter((field) => isPipelineFilterCandidate(field)),
    [draftFields],
  );

  function updateFieldFilterable(fieldKey: string, filterable: boolean) {
    setDraftFields((current) =>
      current.map((field) =>
        field.key === fieldKey ? { ...field, filterable } : field,
      ),
    );
  }

  async function handleSave() {
    const normalized = sortFields(
      draftFields.map((field, index) => {
        if (PIPELINE_PRIMARY_FILTER_KEYS.includes(field.key as (typeof PIPELINE_PRIMARY_FILTER_KEYS)[number])) {
          return { ...field, filterable: true, sortOrder: index };
        }

        return { ...field, sortOrder: index };
      }),
    );

    await onSubmit({ fields: normalized });
  }

  return (
    <Stack spacing={3}>
      <Paper className="rounded-2xl p-4">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" className="font-semibold">
              Pipeline filters
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Choose which fields appear in the pipeline board toolbar. Email
              status is always shown; add other filters as needed.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Always shown</Typography>
            {primaryFields.map((field) => (
              <Stack
                key={field.key}
                direction="row"
                spacing={1.5}
                className="items-center justify-between rounded-xl border border-border/60 px-3 py-2"
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" className="font-medium">
                    {field.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Inline filter on every pipeline view
                  </Typography>
                </Stack>
                <Chip label="Required" size="small" color="primary" variant="outlined" />
              </Stack>
            ))}
          </Stack>

          {stageField ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Pipeline board</Typography>
              <Stack
                direction="row"
                spacing={1.5}
                className="items-center justify-between rounded-xl border border-border/60 px-3 py-2"
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" className="font-medium">
                    {stageField.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stages are board columns — configure stage options in Manage
                    fields.
                  </Typography>
                </Stack>
                <Chip label="Board columns" size="small" variant="outlined" />
              </Stack>
            </Stack>
          ) : null}

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Optional filters</Typography>
            {optionalFields.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Add select or multiselect fields in Manage fields to enable more
                pipeline filters.
              </Typography>
            ) : (
              optionalFields.map((field) => (
                <Stack
                  key={field.key}
                  direction="row"
                  spacing={1.5}
                  className="items-center justify-between rounded-xl border border-border/60 px-3 py-2"
                >
                  <Typography variant="body2" className="font-medium">
                    {field.label}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.filterable ?? false}
                        onChange={(event) =>
                          updateFieldFilterable(field.key, event.target.checked)
                        }
                      />
                    }
                    label="Show in pipeline"
                    labelPlacement="start"
                  />
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper className="sticky bottom-0 rounded-2xl border border-border/60 p-4">
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isSubmitting}
          >
            Save pipeline filters
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
