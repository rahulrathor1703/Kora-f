import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function WizardFieldLabel({
  children,
  required = false,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <Stack spacing={0.25} className="mb-1.5">
      <Typography
        variant="body2"
        component="label"
        htmlFor={htmlFor}
        className="block font-medium text-foreground"
      >
        {children}
        {required ? ' *' : null}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
    </Stack>
  );
}
