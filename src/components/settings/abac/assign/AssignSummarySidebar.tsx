'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AssignPoliciesStep } from '@/components/settings/abac/assign/AssignPoliciesStepper';
import type { BulkAssignAbacPoliciesMode } from '@/lib/api';

interface AssignSummarySidebarProps {
  activeStep: AssignPoliciesStep;
  policyCount: number;
  memberCount: number;
  mode: BulkAssignAbacPoliciesMode;
}

const STEP_LABELS: Record<AssignPoliciesStep, string> = {
  policies: 'Select policies',
  members: 'Select members',
  review: 'Review and assign',
};

export default function AssignSummarySidebar({
  activeStep,
  policyCount,
  memberCount,
  mode,
}: AssignSummarySidebarProps) {
  const totalAssignments = policyCount * memberCount;

  return (
    <Card className="surface-panel sticky top-6 rounded-2xl shadow-primary-soft">
      <CardContent className="p-5">
        <Typography variant="overline" color="text.secondary" className="font-bold">
          Live summary
        </Typography>
        <Typography variant="h6" className="mt-1 font-bold">
          {STEP_LABELS[activeStep]}
        </Typography>

        <Stack spacing={2} className="mt-4">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Policies
            </Typography>
            <Typography variant="h5" className="font-bold">
              {policyCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Members
            </Typography>
            <Typography variant="h5" className="font-bold">
              {memberCount}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Mode
            </Typography>
            <Chip
              label={mode === 'add' ? 'Add policies' : 'Replace all'}
              size="small"
              color={mode === 'add' ? 'primary' : 'warning'}
              variant="outlined"
              className="mt-1 font-semibold"
            />
          </Box>
          {activeStep === 'review' ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total assignments
              </Typography>
              <Typography variant="body1" className="font-semibold">
                {totalAssignments}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
