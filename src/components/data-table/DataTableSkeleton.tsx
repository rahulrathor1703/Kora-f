'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { dataTableClassNames } from './dataTableStyles';

export default function DataTableSkeleton() {
  return (
    <Box className="p-4">
      <Stack direction="row" spacing={2} className="mb-4 items-center">
        <Skeleton variant="rounded" height={40} className="max-w-md flex-1" />
        <Skeleton variant="rounded" width={88} height={40} />
      </Stack>
      <Skeleton
        variant="rounded"
        height={44}
        className={`mb-2 ${dataTableClassNames.toolbar}`}
      />
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={52} />
        ))}
      </Stack>
    </Box>
  );
}
