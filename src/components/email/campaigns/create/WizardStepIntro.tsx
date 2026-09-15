'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface WizardStepIntroProps {
  title: string;
  description: string;
}

export default function WizardStepIntro({
  title,
  description,
}: WizardStepIntroProps) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="h6" component="h2" className="font-bold">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}
