'use client';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
}

function buildRequirements(
  password: string,
  confirmPassword?: string,
): PasswordRequirement[] {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
  ];

  if (confirmPassword !== undefined) {
    requirements.push({
      id: 'match',
      label: 'Passwords match',
      met: password.length > 0 && password === confirmPassword,
    });
  }

  return requirements;
}

export default function PasswordRequirements({
  password,
  confirmPassword,
}: PasswordRequirementsProps) {
  const requirements = buildRequirements(password, confirmPassword);
  const hasInput = password.length > 0 || (confirmPassword?.length ?? 0) > 0;

  if (!hasInput) {
    return (
      <Stack spacing={0.75} aria-label="Password requirements">
        <Typography variant="body2" className="text-muted" sx={{ fontWeight: 600 }}>
          Your password must include:
        </Typography>
        {requirements.map((requirement) => (
          <Typography
            key={requirement.id}
            variant="body2"
            className="text-muted"
            sx={{ pl: 0.5 }}
          >
            • {requirement.label}
          </Typography>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.75} aria-label="Password requirements">
      <Typography variant="body2" className="text-muted" sx={{ fontWeight: 600 }}>
        Password requirements
      </Typography>
      {requirements.map((requirement) => (
        <Stack
          key={requirement.id}
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          {requirement.met ? (
            <CheckCircleOutlineOutlinedIcon
              fontSize="small"
              aria-hidden
              sx={{ color: 'success.main' }}
            />
          ) : (
            <RadioButtonUncheckedIcon
              fontSize="small"
              className="text-muted"
              aria-hidden
            />
          )}
          <Typography
            variant="body2"
            className={requirement.met ? undefined : 'text-muted'}
            sx={requirement.met ? { color: 'success.main' } : undefined}
          >
            {requirement.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
