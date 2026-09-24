'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ReviewSectionBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ReviewSectionBox({
  title,
  children,
  className,
}: ReviewSectionBoxProps) {
  return (
    <Box
      className={[
        'flex h-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Box className="review-section-box-head px-4 py-3">
        <Typography
          component="h3"
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box className="flex flex-1 flex-col p-4">{children}</Box>
    </Box>
  );
}
