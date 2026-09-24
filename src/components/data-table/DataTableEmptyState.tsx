'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { dataTableClassNames } from './dataTableStyles';

interface DataTableEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export default function DataTableEmptyState({
  icon,
  title,
  description,
}: DataTableEmptyStateProps) {
  return (
    <Box className="flex flex-col items-center px-6 py-14 text-center">
      <Box className={dataTableClassNames.emptyIcon} sx={{ mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="subtitle1" className="font-semibold">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" className="mt-2 max-w-sm">
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
