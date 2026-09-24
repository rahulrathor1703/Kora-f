'use client';

import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface FormLayoutEmptyDropZoneProps {
  hint?: string;
}

export default function FormLayoutEmptyDropZone({
  hint = 'Drag and drop fields here',
}: FormLayoutEmptyDropZoneProps) {
  return (
    <Box
      className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200/90 bg-slate-50/40 px-4 py-8 text-center"
      role="status"
    >
      <ViewWeekOutlinedIcon className="mb-2 text-slate-300" sx={{ fontSize: 32 }} />
      <Typography variant="body2" color="text.secondary" className="text-sm">
        {hint}
      </Typography>
    </Box>
  );
}
