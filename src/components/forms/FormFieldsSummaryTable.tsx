'use client';

import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { FormFieldDefinition } from '@/lib/forms/types';

interface FormFieldsSummaryTableProps {
  fields: FormFieldDefinition[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
}

export default function FormFieldsSummaryTable({
  fields,
  selectedFieldId,
  onSelectField,
}: FormFieldsSummaryTableProps) {
  const rows = fields.filter((field) => !isSectionFieldType(field.type));

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No fields to summarize yet.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} className="rounded-2xl shadow-none">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="center">Required</TableCell>
            <TableCell align="center">On form</TableCell>
            <TableCell align="center">In table</TableCell>
            <TableCell>Source</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((field) => {
            const isSelected = selectedFieldId === field.id;

            return (
              <TableRow
                key={field.id}
                hover
                selected={isSelected}
                className="cursor-pointer"
                onClick={() => onSelectField(field.id)}
              >
                <TableCell>{field.label}</TableCell>
                <TableCell className="font-mono text-xs">{field.key}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell align="center">
                  <Checkbox size="small" checked={Boolean(field.required)} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    size="small"
                    checked={field.showInForm !== false}
                    disabled
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox size="small" checked={Boolean(field.showInTable)} disabled />
                </TableCell>
                <TableCell>{field.source ?? 'platform'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
