'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FormEditorMode } from '@/lib/forms/types';

const PLATFORM_NOTES = [
  'Define the default form layout and fields for all organizations.',
  'Rename sections by double-clicking the section title on the layout.',
  'Use the drag handle on a field to reorder it within a section.',
  'Use the up/down arrows on a section header to reorder main sections and sub-sections.',
  'Use the gear icon on a field to open settings — change label, required, and width there.',
] as const;

const ORG_NOTES = [
  'Platform default fields (lock icon) are fixed — only the platform owner can change them.',
  'Add organization-only fields from the palette; use unique keys not already on the platform form.',
  'Create organization sections for your custom fields; platform sections stay read-only.',
  'Reorder org sections with the up/down arrows on the section header.',
  'Removed org fields go to Unused Fields — drag them back onto an org section.',
] as const;

interface FormEditorNotesPanelProps {
  mode?: FormEditorMode;
}

export default function FormEditorNotesPanel({
  mode = 'org',
}: FormEditorNotesPanelProps) {
  const notes = mode === 'platform' ? PLATFORM_NOTES : ORG_NOTES;

  return (
    <Box className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-3">
      <Typography variant="subtitle2" className="mb-2 font-semibold text-amber-950">
        Notes
      </Typography>
      <Box component="ol" className="m-0 list-decimal space-y-1.5 pl-4">
        {notes.map((note) => (
          <Typography
            key={note}
            component="li"
            variant="caption"
            className="leading-snug text-amber-950/80"
          >
            {note}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
