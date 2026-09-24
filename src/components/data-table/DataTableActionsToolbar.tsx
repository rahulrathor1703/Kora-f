'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { dataTableClassNames } from './dataTableStyles';

interface DataTableActionsToolbarProps {
  leadingContent?: ReactNode;
  toolbarActions?: ReactNode;
}

export default function DataTableActionsToolbar({
  leadingContent,
  toolbarActions,
}: DataTableActionsToolbarProps) {
  if (!leadingContent && !toolbarActions) {
    return null;
  }

  return (
    <Box className={`${dataTableClassNames.toolbar} px-4 py-4`}>
      <Box
        className={
          leadingContent
            ? 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'
            : 'flex items-center justify-end'
        }
      >
        {leadingContent ? (
          <Box className="min-w-0 shrink-0">{leadingContent}</Box>
        ) : null}

        {toolbarActions ? (
          <Box
            className={`${dataTableClassNames.iconButtonGroup} shrink-0 self-end lg:self-auto`}
          >
            {toolbarActions}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
