'use client';

import Box from '@mui/material/Box';

interface WidgetWizardStepperProps {
  activeStepIndex: number;
  stepCount?: number;
}

export default function WidgetWizardStepper({
  activeStepIndex,
  stepCount = 3,
}: WidgetWizardStepperProps) {
  return (
    <Box
      aria-label="Widget wizard progress"
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))`,
        gap: 1,
      }}
    >
      {Array.from({ length: stepCount }).map((_, index) => (
        <Box
          key={index}
          sx={{
            height: 4,
            borderRadius: 9999,
            bgcolor:
              index <= activeStepIndex
                ? 'var(--theme-primary)'
                : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
            transition: 'background-color 200ms ease',
          }}
        />
      ))}
    </Box>
  );
}
