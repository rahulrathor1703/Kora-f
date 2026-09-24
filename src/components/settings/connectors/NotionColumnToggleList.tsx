'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { NotionColumnStatus } from '@/lib/api/services/notion-integrations.service';

interface NotionColumnToggleListProps {
  columns: NotionColumnStatus[];
  excludedPropertyIds: string[];
  onToggle: (propertyId: string) => void;
}

function statusHint(column: NotionColumnStatus, included: boolean): string {
  if (!included && column.status === 'unsupported') {
    return 'Unsupported Notion type';
  }

  if (!included) {
    return 'Skipped';
  }

  if (column.status === 'mapped' && column.targetLabel) {
    return `Mapped to ${column.targetLabel}`;
  }

  if (column.status === 'create') {
    return `Will create ${column.targetLabel ?? column.propertyName}`;
  }

  return 'Included';
}

export default function NotionColumnToggleList({
  columns,
  excludedPropertyIds,
  onToggle,
}: NotionColumnToggleListProps) {
  return (
    <Stack spacing={1}>
      {columns.map((column) => {
        const isUnsupported = column.status === 'unsupported';
        const included =
          !isUnsupported && !excludedPropertyIds.includes(column.propertyId);

        return (
          <Box
            key={column.propertyId}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
              included
                ? 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                : 'border-red-200/80 bg-red-50/80 dark:border-red-900/60 dark:bg-red-950/30'
            }`}
          >
            <Box className="min-w-0">
              <Typography variant="body2" className="font-semibold">
                {column.propertyName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {statusHint(column, included)}
              </Typography>
            </Box>
            <button
              type="button"
              disabled={isUnsupported}
              onClick={() => onToggle(column.propertyId)}
              aria-label={
                included
                  ? `Skip ${column.propertyName}`
                  : `Include ${column.propertyName}`
              }
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 ${
                included
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {included ? (
                <CheckRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </button>
          </Box>
        );
      })}
    </Stack>
  );
}
