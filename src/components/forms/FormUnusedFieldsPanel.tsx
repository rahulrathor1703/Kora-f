'use client';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormPaletteTile from '@/components/forms/FormPaletteTile';
import { getFieldPalettePresentation } from '@/lib/forms/form-palette.config';
import {
  formUnusedDragId,
  type FormUnusedDragData,
} from '@/lib/forms/form-layout-dnd';
import { listUnusedFormFields } from '@/lib/forms/unused-form-fields.utils';
import type { FormFieldDefinition } from '@/lib/forms/types';

interface FormUnusedFieldsPanelProps {
  fields: FormFieldDefinition[];
  readOnly?: boolean;
  onRestoreField: (fieldId: string) => void;
}

export default function FormUnusedFieldsPanel({
  fields,
  readOnly = false,
  onRestoreField,
}: FormUnusedFieldsPanelProps) {
  const unusedFields = listUnusedFormFields(fields);

  return (
    <Paper
      elevation={0}
      className="shrink-0 rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
    >
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        className="bg-transparent before:hidden"
      >
        <AccordionSummary
          expandIcon={<ExpandMoreOutlinedIcon fontSize="small" className="text-slate-500" />}
          className="min-h-[48px] px-4 py-0 [&_.MuiAccordionSummary-content]:my-2"
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: 1 }}>
            <Typography
              variant="body2"
              component="span"
              className="font-bold text-slate-500"
            >
              #
            </Typography>
            <Typography variant="body2" className="font-bold text-slate-800">
              Unused Fields
            </Typography>
            <Chip
              size="small"
              label={unusedFields.length}
              className="ml-1 h-6 min-w-[24px] bg-slate-100 font-semibold text-slate-700"
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails className="border-t border-slate-100 px-3 pb-3 pt-2">
          {unusedFields.length === 0 ? (
            <Typography variant="caption" color="text.secondary" className="leading-snug">
              Fields removed from the layout appear here. Drag them onto a section to use them
              again.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {unusedFields.map((field) => {
                const presentation = getFieldPalettePresentation(field);

                return (
                  <FormPaletteTile
                    key={field.id}
                    label={field.label.trim() || presentation.label}
                    icon={presentation.icon}
                    variant="list"
                    readOnly={readOnly}
                    draggableId={readOnly ? undefined : formUnusedDragId(field.id)}
                    dragData={
                      {
                        kind: 'unused',
                        fieldId: field.id,
                        label: field.label,
                      } satisfies FormUnusedDragData
                    }
                    onClick={() => onRestoreField(field.id)}
                  />
                );
              })}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
