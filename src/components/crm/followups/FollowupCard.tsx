'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FollowupMarkDoneForm from '@/components/crm/followups/FollowupMarkDoneForm';
import FollowupRescheduleForm from '@/components/crm/followups/FollowupRescheduleForm';
import { renderProspectSelectCell } from '@/components/crm/prospects/prospect-field-renderers';
import {
  formatFollowUpDate,
  getFollowUpRelativeLabel,
  getFollowUpUrgencyColor,
} from '@/lib/crm/followups/date-utils';
import { getProspectFollowUpDate } from '@/lib/crm/followups/resolve-follow-up-field';
import { PIPELINE_STAGE_FIELD_KEY } from '@/lib/crm/pipeline/constants';
import { resolveProductLabels } from '@/lib/crm/prospects/product-labels';
import type { CreateProspectEngagementInput, Prospect, ProspectFieldDefinition } from '@/lib/crm/prospects/types';

export type FollowupCardAction = 'done' | 'reschedule' | null;

interface FollowupCardProps {
  prospect: Prospect;
  fields: ProspectFieldDefinition[];
  followUpFieldKey: string;
  activeAction: FollowupCardAction;
  canUpdate: boolean;
  isSubmitting: boolean;
  onActionChange: (action: FollowupCardAction) => void;
  onMarkDone: (input: CreateProspectEngagementInput) => Promise<void>;
  onReschedule: (newDate: string) => Promise<void>;
}

function resolveProductLabel(
  productField: ProspectFieldDefinition | undefined,
  prospect: Prospect,
): string {
  return resolveProductLabels(
    productField,
    prospect.values.product,
    prospect.email || 'No company',
  );
}

function resolveSubtitle(prospect: Prospect, productField?: ProspectFieldDefinition): string {
  const designation = prospect.values.designation;
  const designationLabel =
    typeof designation === 'string' && designation.trim().length > 0
      ? designation.trim()
      : null;
  const productLabel = resolveProductLabel(productField, prospect);

  if (designationLabel) {
    return `${designationLabel} · ${productLabel}`;
  }

  return productLabel;
}

export default function FollowupCard({
  prospect,
  fields,
  followUpFieldKey,
  activeAction,
  canUpdate,
  isSubmitting,
  onActionChange,
  onMarkDone,
  onReschedule,
}: FollowupCardProps) {
  const followUpDue = getProspectFollowUpDate(prospect.values, followUpFieldKey);
  const stageField = fields.find((field) => field.key === PIPELINE_STAGE_FIELD_KEY);
  const productField = fields.find((field) => field.key === 'product');
  const stageValue = prospect.values[PIPELINE_STAGE_FIELD_KEY];
  const urgencyColor = getFollowUpUrgencyColor(followUpDue);
  const relativeLabel = getFollowUpRelativeLabel(followUpDue);

  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-border/60 bg-surface/40 p-5"
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={3}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', lg: 'flex-start' },
        }}
      >
        <Box className="min-w-0 flex-1">
          <Typography variant="h6" className="font-semibold leading-tight">
            {prospect.fullName || 'Unnamed'}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            {resolveSubtitle(prospect, productField)}
          </Typography>
          {stageField ? (
            <Box className="mt-3">
              {renderProspectSelectCell(
                stageField,
                typeof stageValue === 'string' || typeof stageValue === 'number'
                  ? stageValue
                  : null,
              )}
            </Box>
          ) : null}
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          className="shrink-0"
        >
          <Box className="text-left sm:text-right">
            <Typography variant="body2" className="font-medium">
              {formatFollowUpDate(followUpDue)}
            </Typography>
            {relativeLabel ? (
              <Typography
                variant="caption"
                className="mt-0.5 block font-medium"
                sx={{ color: urgencyColor ?? 'text.secondary' }}
              >
                {relativeLabel}
              </Typography>
            ) : null}
          </Box>

          {canUpdate ? (
            <Stack direction="row" spacing={1} className="shrink-0">
              <Button
                variant="outlined"
                size="small"
                disabled={isSubmitting}
                onClick={() =>
                  onActionChange(activeAction === 'reschedule' ? null : 'reschedule')
                }
                sx={{ borderColor: 'divider', color: 'text.primary' }}
              >
                Reschedule
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={isSubmitting}
                onClick={() =>
                  onActionChange(activeAction === 'done' ? null : 'done')
                }
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' },
                }}
              >
                Mark Done
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      {activeAction === 'done' ? (
        <FollowupMarkDoneForm
          isSubmitting={isSubmitting}
          onCancel={() => onActionChange(null)}
          onSubmit={onMarkDone}
        />
      ) : null}

      {activeAction === 'reschedule' ? (
        <FollowupRescheduleForm
          currentDate={followUpDue}
          isSubmitting={isSubmitting}
          onCancel={() => onActionChange(null)}
          onSubmit={onReschedule}
        />
      ) : null}
    </Paper>
  );
}
