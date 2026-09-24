'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormPaletteTile from '@/components/forms/FormPaletteTile';
import { paletteItemsForEntity } from '@/lib/forms/form-palette.config';
import {
  formPaletteDragId,
  type FormPaletteDragData,
} from '@/lib/forms/form-layout-dnd';
import type { CustomFieldEntity } from '@/lib/forms/org-registry-forms';
import type { FormPaletteAction } from '@/lib/forms/form-palette.config';

interface FormFieldPaletteProps {
  entity: CustomFieldEntity | null;
  readOnly?: boolean;
  onPaletteAction: (action: FormPaletteAction) => void;
}

export default function FormFieldPalette({
  entity,
  readOnly = false,
  onPaletteAction,
}: FormFieldPaletteProps) {
  const gridItems = paletteItemsForEntity(entity);

  return (
    <Paper
      elevation={0}
      className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
    >
      <Typography
        variant="subtitle1"
        component="h2"
        className="mb-3 text-[15px] font-bold text-slate-900"
      >
        Drag &amp; Drop the Fields
      </Typography>

      <Box className="grid grid-cols-2 gap-2">
        <Box className="col-span-2">
          <FormPaletteTile
            label="Main Section"
            icon={<AddOutlinedIcon />}
            variant="dashed"
            readOnly={readOnly}
            draggableId={readOnly ? undefined : formPaletteDragId('main-section')}
            dragData={
              {
                kind: 'palette',
                action: { kind: 'main-section' },
                label: 'Main Section',
              } satisfies FormPaletteDragData
            }
            onClick={() => onPaletteAction({ kind: 'main-section' })}
          />
        </Box>

        {entity ? (
          <FormPaletteTile
            label="Sub Section"
            icon={<ViewDayOutlinedIcon />}
            variant="palette"
            readOnly={readOnly}
            draggableId={readOnly ? undefined : formPaletteDragId('sub-section')}
            dragData={
              {
                kind: 'palette',
                action: { kind: 'sub-section' },
                label: 'Sub Section',
              } satisfies FormPaletteDragData
            }
            onClick={() => onPaletteAction({ kind: 'sub-section' })}
          />
        ) : null}

        {gridItems.length > 0 ? (
          gridItems.map((item) => (
            <FormPaletteTile
              key={item.id}
              label={item.label}
              icon={item.icon}
              variant="palette"
              readOnly={readOnly}
              inactive={!item.supported}
              draggableId={
                readOnly || !item.supported
                  ? undefined
                  : formPaletteDragId(item.id)
              }
              dragData={
                {
                  kind: 'palette',
                  action: item.action,
                  label: item.label,
                } satisfies FormPaletteDragData
              }
              onClick={() => {
                if (!item.supported) {
                  return;
                }
                onPaletteAction(item.action);
              }}
            />
          ))
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            className="col-span-2 block pt-1"
          >
            Custom field types are available for CRM prospect and company forms.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
