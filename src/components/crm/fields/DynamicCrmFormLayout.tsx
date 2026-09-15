'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  buildFormFieldGroups,
  getFormFieldColSpanClassName,
  getFormFieldGridClassName,
  type FormLayoutField,
} from '@/lib/crm/fields/form-layout.utils';

interface CrmFormSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function CrmFormSection({ id, title, children }: CrmFormSectionProps) {
  const headingId = `crm-form-section-${id}`;

  return (
    <Box
      component="section"
      aria-labelledby={headingId}
      className="rounded-2xl border border-border/60 bg-surface/50 p-4 sm:p-5"
    >
      <Typography
        id={headingId}
        variant="subtitle2"
        component="h3"
        className="mb-4 font-semibold text-foreground"
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

interface CrmFormFieldGridProps<T extends FormLayoutField> {
  fields: T[];
  renderField: (field: T) => React.ReactNode;
  getFieldClassName?: (field: T) => string;
}

function CrmFormFieldGrid<T extends FormLayoutField>({
  fields,
  renderField,
  getFieldClassName,
}: CrmFormFieldGridProps<T>) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <Box className={getFormFieldGridClassName()}>
      {fields.map((field) => (
        <Box
          key={field.id}
          className={`min-w-0 ${getFieldClassName?.(field) ?? getFormFieldColSpanClassName(field)}`}
        >
          {renderField(field)}
        </Box>
      ))}
    </Box>
  );
}

interface DynamicCrmFormLayoutProps<T extends FormLayoutField> {
  fields: T[];
  renderField: (field: T) => React.ReactNode;
  getFieldClassName?: (field: T) => string;
}

export default function DynamicCrmFormLayout<T extends FormLayoutField>({
  fields,
  renderField,
  getFieldClassName,
}: DynamicCrmFormLayoutProps<T>) {
  const groups = buildFormFieldGroups(fields);

  if (groups.length === 0) {
    return null;
  }

  const hasSections = groups.some((group) => group.kind === 'section');

  return (
    <Stack spacing={hasSections ? 3 : 2.5}>
      {groups.map((group) => {
        if (group.kind === 'section') {
          const title = group.title ?? 'Additional details';

          return (
            <CrmFormSection key={group.id} id={group.id} title={title}>
              <CrmFormFieldGrid
                fields={group.fields}
                renderField={renderField}
                getFieldClassName={getFieldClassName}
              />
            </CrmFormSection>
          );
        }

        return (
          <CrmFormFieldGrid
            key={group.id}
            fields={group.fields}
            renderField={renderField}
            getFieldClassName={getFieldClassName}
          />
        );
      })}
    </Stack>
  );
}
