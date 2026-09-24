'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CRM_IMPORT_WIZARD_STEPS } from '@/lib/schemas/crm-import';

interface CrmImportStepperProps {
  activeStepIndex: number;
}

const CIRCLE_SIZE = 36;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const LINE_HEIGHT = 3;

export default function CrmImportStepper({
  activeStepIndex,
}: CrmImportStepperProps) {
  return (
    <Box component="nav" aria-label="CRM import progress" className="w-full">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {CRM_IMPORT_WIZARD_STEPS.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex;
          const isReached = index <= activeStepIndex;
          const isLast = index === CRM_IMPORT_WIZARD_STEPS.length - 1;
          const isLineFilled = index < activeStepIndex;

          return (
            <Box
              key={step.id}
              sx={{
                position: 'relative',
                flex: '1 1 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 0,
              }}
              aria-current={isActive ? 'step' : undefined}
            >
              {!isLast ? (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: CIRCLE_RADIUS - LINE_HEIGHT / 2,
                    left: `calc(50% + ${CIRCLE_RADIUS}px)`,
                    width: `calc(100% - ${CIRCLE_SIZE}px)`,
                    height: LINE_HEIGHT,
                    zIndex: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      backgroundColor:
                        'color-mix(in srgb, var(--foreground) 14%, transparent)',
                    }}
                  />
                  <Box
                    className="bg-foreground"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: isLineFilled ? '100%' : '0%',
                      borderRadius: 9999,
                      transition: 'width 300ms ease-out',
                    }}
                  />
                </Box>
              ) : null}

              <Box
                className={`relative z-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
                  isReached
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-text-secondary'
                }`}
                sx={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  flexShrink: 0,
                  backgroundColor: isReached ? undefined : 'var(--background)',
                  border: isReached
                    ? 'none'
                    : '2px solid color-mix(in srgb, var(--foreground) 22%, transparent)',
                }}
              >
                {index + 1}
              </Box>

              <Typography
                variant="caption"
                className={`mt-1.5 px-1 text-center leading-snug ${
                  isActive
                    ? 'font-bold text-foreground'
                    : isComplete
                      ? 'font-semibold text-foreground'
                      : 'text-text-secondary'
                }`}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
