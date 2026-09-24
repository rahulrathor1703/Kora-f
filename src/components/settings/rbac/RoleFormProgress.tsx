'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface RoleFormProgressProps {
  hasValidName: boolean;
  hasPermissions: boolean;
}

const STEPS = [
  { id: 'name', label: 'Name' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'ready', label: 'Ready' },
] as const;

export default function RoleFormProgress({
  hasValidName,
  hasPermissions,
}: RoleFormProgressProps) {
  const completedSteps = [
    hasValidName,
    hasPermissions,
    hasValidName && hasPermissions,
  ];
  const progressValue = (completedSteps.filter(Boolean).length / STEPS.length) * 100;

  return (
    <Box className="rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="body2" className="font-semibold">
          Setup progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {completedSteps.filter(Boolean).length} of {STEPS.length} complete
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progressValue}
        className="mb-4 h-1.5 rounded-full"
        aria-label="Role setup progress"
      />

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {STEPS.map((step, index) => {
          const isComplete = completedSteps[index];

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
                  color: isComplete ? 'primary.main' : 'text.disabled',
                }}
                aria-hidden
              />
              <Typography
                variant="caption"
                className={isComplete ? 'font-semibold text-primary' : 'text-text-secondary'}
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
