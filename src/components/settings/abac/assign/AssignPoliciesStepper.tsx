'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type AssignPoliciesStep = 'policies' | 'members' | 'review';

interface AssignPoliciesStepperProps {
  activeStep: AssignPoliciesStep;
  hasPolicies: boolean;
  hasMembers: boolean;
}

const STEPS: Array<{ id: AssignPoliciesStep; label: string }> = [
  { id: 'policies', label: 'Policies' },
  { id: 'members', label: 'Members' },
  { id: 'review', label: 'Review' },
];

function getStepIndex(step: AssignPoliciesStep): number {
  return STEPS.findIndex((item) => item.id === step);
}

export default function AssignPoliciesStepper({
  activeStep,
  hasPolicies,
  hasMembers,
}: AssignPoliciesStepperProps) {
  const activeIndex = getStepIndex(activeStep);
  const completedSteps = [
    hasPolicies,
    hasMembers,
    hasPolicies && hasMembers,
  ];
  const progressValue =
    ((activeIndex + 1) / STEPS.length) * 100;

  return (
    <Box className="rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="body2" className="font-semibold">
          Assignment progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Step {activeIndex + 1} of {STEPS.length}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progressValue}
        className="mb-4 h-1.5 rounded-full"
        aria-label="Assignment wizard progress"
      />

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {STEPS.map((step, index) => {
          const isComplete = completedSteps[index];
          const isActive = step.id === activeStep;

          return (
            <Stack
              key={step.id}
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center' }}
            >
              <CheckCircleOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: isComplete || isActive ? 'primary.main' : 'text.disabled',
                }}
                aria-hidden
              />
              <Typography
                variant="caption"
                className={
                  isActive
                    ? 'font-bold text-primary'
                    : isComplete
                      ? 'font-semibold text-primary'
                      : 'text-text-secondary'
                }
              >
                {step.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
