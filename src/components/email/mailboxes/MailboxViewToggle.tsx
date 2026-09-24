'use client';

import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { dataTableClassNames } from '@/components/data-table/dataTableStyles';
import type { MailboxViewMode } from '@/lib/email/mailbox-view-mode';

interface MailboxViewToggleProps {
  viewMode: MailboxViewMode;
  onViewModeChange: (viewMode: MailboxViewMode) => void;
}

const viewToggleSx = {
  '& .MuiToggleButtonGroup-grouped': {
    border: 0,
    borderRadius: '10px !important',
    mx: 0.25,
  },
} as const;

export default function MailboxViewToggle({
  viewMode,
  onViewModeChange,
}: MailboxViewToggleProps) {
  return (
    <Box className={`${dataTableClassNames.iconButtonGroup} shrink-0`}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={viewMode}
        onChange={(_event, nextViewMode: MailboxViewMode | null) => {
          if (nextViewMode) {
            onViewModeChange(nextViewMode);
          }
        }}
        aria-label="Mailbox view mode"
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
      </ToggleButtonGroup>
    </Box>
  );
}
