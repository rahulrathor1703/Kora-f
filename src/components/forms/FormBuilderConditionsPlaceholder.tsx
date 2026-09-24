'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function FormBuilderConditionsPlaceholder() {
  return (
    <Box className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <Typography variant="subtitle2" className="mb-1 font-semibold text-slate-800">
        No conditions yet
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        className="max-w-xs text-[13px] leading-relaxed"
      >
        Show or hide this field based on other answers — coming in a future update.
      </Typography>
    </Box>
  );
}
