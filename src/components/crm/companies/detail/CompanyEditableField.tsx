'use client';

import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CompanyFieldRenderer from '@/components/crm/companies/CompanyFieldRenderer';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
} from '@/lib/crm/companies/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';

interface CompanyEditableFieldProps {
  field: CompanyFieldDefinition;
  value: FieldStoredValue;
  displayValue: string;
  isEditing: boolean;
  isGlobalEdit: boolean;
  canUpdate: boolean;
  isSaving: boolean;
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  onStartEdit: (fieldKey: string) => void;
  onCancelEdit: () => void;
  onSaveField: (fieldKey: string) => void;
  onChange: (fieldKey: string, value: FieldStoredValue) => void;
}

export default function CompanyEditableField({
  field,
  value,
  displayValue,
  isEditing,
  isGlobalEdit,
  canUpdate,
  isSaving,
  categories,
  locations,
  onStartEdit,
  onCancelEdit,
  onSaveField,
  onChange,
}: CompanyEditableFieldProps) {
  const showInlineActions = isEditing && !isGlobalEdit;
  const canEditField = canUpdate && field.editableOnDetail !== false;

  return (
    <Stack
      spacing={0.75}
      className="group rounded-xl border border-transparent p-3 transition-colors hover:border-border/60"
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          className="flex-1 font-semibold uppercase tracking-wide"
        >
          {field.label}
        </Typography>
        {canEditField && !isGlobalEdit && !isEditing ? (
          <Tooltip title={`Edit ${field.label.toLowerCase()}`}>
            <IconButton
              size="small"
              aria-label={`Edit ${field.label}`}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onStartEdit(field.key)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        {showInlineActions ? (
          <>
            <Tooltip title="Save">
              <IconButton
                size="small"
                color="primary"
                aria-label="Save field"
                disabled={isSaving}
                onClick={() => onSaveField(field.key)}
              >
                <CheckOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                aria-label="Cancel edit"
                disabled={isSaving}
                onClick={onCancelEdit}
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : null}
      </Stack>

      {isEditing || isGlobalEdit ? (
        <Box className="[&_.MuiTextField-root]:text-sm">
          <CompanyFieldRenderer
            field={field}
            value={value}
            onChange={(nextValue) => onChange(field.key, nextValue)}
            disabled={isSaving}
            categories={categories}
            locations={locations}
          />
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" className="whitespace-pre-wrap">
            {displayValue || '—'}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
