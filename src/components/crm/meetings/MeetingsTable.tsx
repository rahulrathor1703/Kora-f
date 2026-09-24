'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useMemo } from 'react';
import DataTable from '@/components/data-table/DataTable';
import DataTablePagination from '@/components/data-table/DataTablePagination';
import {
  buildProspectSubtitle,
  formatMeetingCreatedAt,
  formatMeetingDateTime,
  renderMeetingPlatformChip,
  renderMeetingProspectCell,
  renderMeetingStatusChip,
} from '@/components/crm/meetings/meeting-renderers';
import type { Meeting } from '@/lib/crm/meetings/types';

interface MeetingRow extends Record<string, unknown> {
  id: string;
  title: string | null;
  prospectName: string;
  prospectEmail: string;
  prospectSubtitle: string;
  platform: Meeting['platform'];
  status: Meeting['status'];
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

interface MeetingsTableProps {
  meetings: Meeting[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function flattenMeetingForTable(meeting: Meeting): MeetingRow {
  return {
    id: meeting.id,
    title: meeting.title,
    prospectName: meeting.prospect.name,
    prospectEmail: meeting.prospect.email,
    prospectSubtitle: buildProspectSubtitle(
      meeting.prospect.designation,
      meeting.prospect.product,
    ) ?? '',
    platform: meeting.platform,
    status: meeting.status,
    startAt: meeting.startAt,
    endAt: meeting.endAt,
    createdAt: meeting.createdAt,
  };
}

export default function MeetingsTable({
  meetings,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: MeetingsTableProps) {
  const rows = meetings.map(flattenMeetingForTable);

  const columnOverrides = useMemo(
    () => ({
      title: {
        label: 'TITLE',
        render: (row: MeetingRow) => row.title ?? 'Untitled meeting',
      },
      prospectName: {
        label: 'PROSPECT',
        render: (row: MeetingRow) =>
          renderMeetingProspectCell(
            row.prospectName,
            row.prospectEmail,
            row.prospectSubtitle || undefined,
          ),
      },
      platform: {
        label: 'PLATFORM',
        render: (row: MeetingRow) => renderMeetingPlatformChip(row.platform),
      },
      status: {
        label: 'STATUS',
        render: (row: MeetingRow) => renderMeetingStatusChip(row.status),
      },
      startAt: {
        label: 'START',
        render: (row: MeetingRow) => formatMeetingDateTime(row.startAt),
      },
      endAt: {
        label: 'END',
        render: (row: MeetingRow) =>
          row.endAt ? formatMeetingDateTime(row.endAt) : '—',
      },
      createdAt: {
        label: 'CREATED',
        render: (row: MeetingRow) => formatMeetingCreatedAt(row.createdAt),
      },
    }),
    [],
  );

  return (
    <Paper className="overflow-hidden rounded-2xl">
      <DataTable<MeetingRow>
        tableId="meetings"
        rows={rows}
        getRowId={(row) => row.id}
        excludeFields={[
          'id',
          'prospectEmail',
          'prospectSubtitle',
        ]}
        columnOverrides={columnOverrides}
        isLoading={isLoading}
        emptyMessage="No meetings yet. Create your first meeting to get started."
        noResultsMessage="No meetings match the selected filter."
        enableSearch={false}
        enablePagination={false}
        persistPreferences
      />
      <Box className="border-t border-border/60">
        <DataTablePagination
          page={page - 1}
          pageSize={pageSize}
          totalRows={total}
          onPageChange={(nextPage) => onPageChange(nextPage + 1)}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </Paper>
  );
}
