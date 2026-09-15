'use client';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import { dataTableClassNames } from '@/components/data-table/dataTableStyles';
import {
  MEETING_LIST_STATUS_LABELS,
} from '@/lib/crm/meetings/status-config';
import {
  MEETING_LIST_STATUSES,
  type MeetingListStatus,
  type MeetingViewMode,
} from '@/lib/crm/meetings/types';

interface MeetingsToolbarProps {
  activeStatus: MeetingListStatus;
  viewMode: MeetingViewMode;
  onStatusChange: (status: MeetingListStatus) => void;
  onViewModeChange: (viewMode: MeetingViewMode) => void;
}

const viewToggleSx = {
  '& .MuiToggleButtonGroup-grouped': {
    border: 0,
    borderRadius: '10px !important',
    mx: 0.25,
  },
} as const;

export default function MeetingsToolbar({
  activeStatus,
  viewMode,
  onStatusChange,
  onViewModeChange,
}: MeetingsToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'stretch', lg: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" spacing={1} className="flex-wrap gap-y-2">
        {MEETING_LIST_STATUSES.map((status) => {
          const isActive = status === activeStatus;

          return (
            <Button
              key={status}
              size="small"
              variant={isActive ? 'contained' : 'outlined'}
              onClick={() => onStatusChange(status)}
              className="rounded-full px-4 normal-case"
              sx={
                isActive
                  ? {
                      bgcolor: '#4338CA',
                      '&:hover': { bgcolor: '#3730A3' },
                    }
                  : {
                      borderColor: 'divider',
                      color: 'text.secondary',
                    }
              }
            >
              {MEETING_LIST_STATUS_LABELS[status]}
            </Button>
          );
        })}
      </Stack>

      <Box className={`${dataTableClassNames.iconButtonGroup} shrink-0 self-end lg:self-auto`}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_event, nextViewMode: MeetingViewMode | null) => {
            if (nextViewMode) {
              onViewModeChange(nextViewMode);
            }
          }}
          aria-label="Meeting view mode"
          sx={viewToggleSx}
        >
          <Tooltip title="Table view">
            <ToggleButton value="table" aria-label="Table view">
              <TableRowsOutlinedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Cards view">
            <ToggleButton value="cards" aria-label="Cards view">
              <ViewModuleOutlinedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Calendar view">
            <ToggleButton value="calendar" aria-label="Calendar view">
              <CalendarMonthOutlinedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
    </Stack>
  );
}
