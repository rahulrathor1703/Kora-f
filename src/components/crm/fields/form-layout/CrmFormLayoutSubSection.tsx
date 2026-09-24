'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import SectionMoveButtons from '@/components/crm/fields/form-layout/SectionMoveButtons';
import { useSectionTitleEdit } from '@/components/crm/fields/form-layout/useSectionTitleEdit';
import type { LayoutSectionMoveDirection } from '@/lib/crm/fields/section-field.utils';

interface CrmFormLayoutSubSectionProps {
  sectionId: string;
  title: string;
  children: ReactNode;
  nestedSubSections?: ReactNode;
  readOnly?: boolean;
  showDelete?: boolean;
  emphasizeDelete?: boolean;
  isTitleEditable?: boolean;
  sectionReorderable?: boolean;
  canMoveSectionUp?: boolean;
  canMoveSectionDown?: boolean;
  onMoveSection?: (sectionId: string, direction: LayoutSectionMoveDirection) => void;
  onTitleChange?: (sectionId: string, title: string) => void;
  onDelete?: (sectionId: string) => void;
  onAddSubSection?: (parentSectionId: string) => void;
}

export default function CrmFormLayoutSubSection({
  sectionId,
  title,
  children,
  nestedSubSections,
  readOnly = false,
  showDelete = false,
  emphasizeDelete = false,
  isTitleEditable = false,
  sectionReorderable = false,
  canMoveSectionUp = false,
  canMoveSectionDown = false,
  onMoveSection,
  onTitleChange,
  onDelete,
  onAddSubSection,
}: CrmFormLayoutSubSectionProps) {
  const headingId = `crm-form-layout-sub-${sectionId}`;
  const { isEditingTitle, beginTitleEdit, endTitleEdit } =
    useSectionTitleEdit(isTitleEditable);
  const showTitleField =
    isTitleEditable && (isEditingTitle || title.trim().length === 0);
  const showToolbar =
    !readOnly &&
    (showDelete ||
      onAddSubSection ||
      isTitleEditable ||
      (sectionReorderable && onMoveSection));

  return (
    <Box
      className="rounded-lg border border-slate-200/90 bg-white"
      aria-labelledby={headingId}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        className="px-4 pb-2 pt-3"
      >
        <Box className="min-w-0 flex-1">
          {readOnly || !isTitleEditable ? (
            <Typography
              id={headingId}
              variant="body2"
              component="h4"
              className="text-[14px] font-bold text-slate-800"
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
                    'text-[14px] font-bold text-slate-800 before:border-b-2 before:border-primary/70',
                },
              }}
              className="max-w-xs [&_.MuiInput-underline:before]:border-primary/50 [&_.MuiInput-underline:after]:border-primary"
            />
          ) : (
            <Tooltip title="Double-click to rename" placement="top">
              <Typography
                id={headingId}
                variant="body2"
                component="h4"
                onDoubleClick={beginTitleEdit}
                className="cursor-text select-none text-[14px] font-bold text-slate-800"
              >
                {title}
              </Typography>
            </Tooltip>
          )}
        </Box>

        {showToolbar ? (
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
              <Tooltip title="Remove sub section" placement="top">
                <IconButton
                  size="small"
                  aria-label={`Delete ${title} sub section`}
                  className={
                    emphasizeDelete
                      ? 'text-red-500 transition-colors hover:text-red-700'
                      : 'text-slate-400 transition-colors hover:text-red-600'
                  }
                  onClick={() => onDelete(sectionId)}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
            {onAddSubSection ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onAddSubSection(sectionId)}
                className="shrink-0 rounded-md border-dashed border-slate-300 px-2 py-0.5 text-xs font-medium normal-case text-slate-600 hover:border-slate-400 hover:bg-slate-50"
              >
                Sub Section
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <Box className="px-4 pb-4 pt-1">{children}</Box>
      {nestedSubSections ? (
        <Stack spacing={3} className="px-4 pb-4">
          {nestedSubSections}
        </Stack>
      ) : null}
    </Box>
  );
}
