'use client';

import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type SequenceSetupMode = 'template' | 'scratch';

interface SequenceSetupChoiceProps {
  onSelect: (mode: SequenceSetupMode) => void;
}

interface SetupOption {
  mode: SequenceSetupMode;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SETUP_OPTIONS: SetupOption[] = [
  {
    mode: 'template',
    title: 'Choose template',
    description: 'Start from a saved sequence and customize it for this campaign.',
    icon: <AutoStoriesOutlinedIcon fontSize="medium" />,
  },
  {
    mode: 'scratch',
    title: 'Start from scratch',
    description: 'Write your own outreach and follow-ups from a blank slate.',
    icon: <EditOutlinedIcon fontSize="medium" />,
  },
];

export default function SequenceSetupChoice({ onSelect }: SequenceSetupChoiceProps) {
  return (
    <Stack spacing={2}>
      {SETUP_OPTIONS.map((option) => (
        <Box
          key={option.mode}
          component="button"
          type="button"
          onClick={() => onSelect(option.mode)}
          className="flex w-full items-start gap-4 rounded-2xl border border-surface-border bg-surface p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Box
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
            aria-hidden
          >
            {option.icon}
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="subtitle1" component="span" className="font-bold">
              {option.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.description}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
