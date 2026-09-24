'use client';

import { useDraggable } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type FormPaletteTileVariant = 'palette' | 'dashed' | 'list';

interface FormPaletteTileProps {
  label: string;
  icon: ReactNode;
  subtitle?: string;
  /** Blocks interaction (drag/click) but keeps full-color palette styling. */
  inactive?: boolean;
  readOnly?: boolean;
  variant?: FormPaletteTileVariant;
  onClick?: () => void;
  className?: string;
  draggableId?: string;
  dragData?: Record<string, unknown>;
}

export default function FormPaletteTile({
  label,
  icon,
  subtitle,
  inactive = false,
  readOnly = false,
  variant = 'palette',
  onClick,
  className,
  draggableId,
  dragData,
}: FormPaletteTileProps) {
  const interactionBlocked = readOnly || inactive;
  const draggable = Boolean(draggableId) && !interactionBlocked;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId ?? 'palette-tile-disabled',
    disabled: !draggable,
    data: dragData,
  });

  const variantClasses: Record<FormPaletteTileVariant, string> = {
    palette:
      'border border-transparent bg-slate-100/90 hover:border-primary/30 hover:bg-slate-100',
    dashed:
      'border border-dashed border-slate-300 bg-white hover:border-primary/40 hover:bg-primary/[0.02]',
    list: 'border border-slate-200/80 bg-white hover:border-primary/30 hover:bg-slate-50',
  };

  return (
    <Box
      ref={draggable ? setNodeRef : undefined}
      component="button"
      type="button"
      disabled={readOnly}
      onClick={interactionBlocked && !readOnly ? undefined : onClick}
      title={
        inactive && !readOnly
          ? `${label} — not available for this form yet`
          : subtitle
            ? `${label} — ${subtitle}`
            : label
      }
      {...(draggable ? { ...attributes, ...listeners } : {})}
      className={[
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-200',
        variantClasses[variant],
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        readOnly ? 'cursor-not-allowed opacity-50' : '',
        inactive && !readOnly ? 'cursor-not-allowed opacity-60' : '',
        isDragging ? 'opacity-50' : '',
        className ?? '',
      ].join(' ')}
    >
      <Box className="flex shrink-0 items-center justify-center text-slate-600 [&_svg]:text-[14px]">
        {icon}
      </Box>
      <Box className="min-w-0 flex-1">
        <Typography
          component="span"
          variant="inherit"
          className="block truncate font-medium leading-tight text-slate-800"
          sx={{ fontSize: 10, lineHeight: 1.25 }}
        >
          {label}
        </Typography>
        {variant === 'list' && subtitle ? (
          <Typography
            variant="caption"
            color="text.secondary"
            className="block truncate text-[11px] leading-tight"
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
