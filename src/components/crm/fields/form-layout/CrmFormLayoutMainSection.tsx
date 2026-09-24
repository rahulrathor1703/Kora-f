'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import SectionMoveButtons from '@/components/crm/fields/form-layout/SectionMoveButtons';
import { useSectionTitleEdit } from '@/components/crm/fields/form-layout/useSectionTitleEdit';
import type { LayoutSectionMoveDirection } from '@/lib/crm/fields/section-field.utils';

interface CrmFormLayoutMainSectionProps {
  sectionId: string;
  title: string;
  children: ReactNode;
  readOnly?: boolean;
  showDelete?: boolean;
  isTitleEditable?: boolean;
  sectionReorderable?: boolean;
  canMoveSectionUp?: boolean;
  canMoveSectionDown?: boolean;
  onMoveSection?: (sectionId: string, direction: LayoutSectionMoveDirection) => void;
  onTitleChange?: (sectionId: string, title: string) => void;
  onDelete?: (sectionId: string) => void;
}

export default function CrmFormLayoutMainSection({
  sectionId,
  title,
  children,
  readOnly = false,
  showDelete = false,
  isTitleEditable = false,
  sectionReorderable = false,
  canMoveSectionUp = false,
  canMoveSectionDown = false,
  onMoveSection,
  onTitleChange,
  onDelete,
}: CrmFormLayoutMainSectionProps) {
  const headingId = `crm-form-layout-main-${sectionId}`;
  const { isEditingTitle, beginTitleEdit, endTitleEdit } =
    useSectionTitleEdit(isTitleEditable);
  const showTitleField =
    isTitleEditable && (isEditingTitle || title.trim().length === 0);

  return (
    <Box
      component="section"
      aria-labelledby={headingId}
      className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        className="border-b border-slate-200/80 bg-[#eef2fb] px-4 py-2.5"
      >
        <Box className="min-w-0 flex-1">
          {readOnly || !isTitleEditable ? (
            <Typography
              id={headingId}
              variant="body2"
              component="h3"
              className="text-[15px] font-bold tracking-tight text-slate-900"
            >
              {title}
            </Typography>
          ) : showTitleField ? (
            <TextField
              id={headingId}
              size="small"
              value={title}
              placeholder="Section title"
              variant="standard"
              autoFocus
              onChange={(event) => onTitleChange?.(sectionId, event.target.value)}
              onBlur={(event) => {
                onTitleChange?.(sectionId, event.target.value.trim());
                endTitleEdit();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onTitleChange?.(sectionId, title.trim());
                  endTitleEdit();
                }
              }}
              slotProps={{
                input: {
                  className:
                    'text-[15px] font-bold tracking-tight text-slate-900 before:border-b-2 before:border-primary/70',
                },
              }}
              className="max-w-md [&_.MuiInput-underline:before]:border-primary/50 [&_.MuiInput-underline:after]:border-primary"
            />
          ) : (
            <Tooltip title="Double-click to rename" placement="top">
              <Typography
                id={headingId}
                variant="body2"
                component="h3"
                onDoubleClick={beginTitleEdit}
                className="cursor-text select-none text-[15px] font-bold tracking-tight text-slate-900"
              >
                {title}
              </Typography>
            </Tooltip>
          )}
        </Box>
        {!readOnly ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {sectionReorderable && onMoveSection ? (
              <SectionMoveButtons
                sectionTitle={title}
                canMoveUp={canMoveSectionUp}
                canMoveDown={canMoveSectionDown}
                onMove={(direction) => onMoveSection(sectionId, direction)}
              />
            ) : null}
            {showDelete && onDelete ? (
              <Tooltip title="Remove section" placement="top">
                <IconButton
                  size="small"
                  aria-label={`Delete ${title} section`}
                  className="text-slate-400 transition-colors hover:text-red-600"
                  onClick={() => onDelete(sectionId)}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <Stack spacing={3} className="p-4">
        {children}
      </Stack>
    </Box>
  );
}
