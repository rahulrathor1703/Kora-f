'use client';

import { useDroppable } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import FormLayoutEmptyDropZone from '@/components/forms/FormLayoutEmptyDropZone';
import { formLayoutDropId } from '@/lib/forms/form-layout-dnd';

interface FormLayoutDropZoneProps {
  groupKey: string;
  children?: ReactNode;
  emptyHint?: string;
  isEmpty?: boolean;
  /** `quiet`: highlight only while dragging over; `hint`: dashed empty state + caption. */
  variant?: 'quiet' | 'hint' | 'rich';
}

export default function FormLayoutDropZone({
  groupKey,
  children,
  emptyHint = 'Drop fields here',
  isEmpty = false,
  variant = 'hint',
}: FormLayoutDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: formLayoutDropId(groupKey),
  });

  const quiet = variant === 'quiet';
  const rich = variant === 'rich';

  return (
    <Box
      ref={setNodeRef}
      className={[
        'rounded-xl transition-colors',
        quiet ? 'min-h-0' : rich ? 'min-h-0' : 'min-h-[3rem]',
        isOver ? 'bg-primary/[0.06] ring-2 ring-primary/35' : '',
        !quiet && !rich && isEmpty ? 'border border-dashed border-border/70 p-3' : '',
      ].join(' ')}
    >
      {rich && isEmpty ? <FormLayoutEmptyDropZone hint={emptyHint} /> : null}
      {!quiet && !rich && isEmpty ? (
        <Typography
          variant="caption"
          color="text.secondary"
          className="mb-2 block text-center"
        >
          {emptyHint}
        </Typography>
      ) : null}
      {!rich || !isEmpty ? children : null}
    </Box>
  );
}
