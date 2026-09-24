import Box from '@mui/material/Box';

export default function SidebarNotificationDot() {
  return (
    <Box
      aria-hidden
      className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-error-main"
      sx={{ transform: 'translate(25%, -25%)' }}
    />
  );
}
