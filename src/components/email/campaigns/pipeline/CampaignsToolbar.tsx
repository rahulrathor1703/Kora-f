'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { dataTableClassNames } from '@/components/data-table/dataTableStyles';
import type { CampaignViewMode } from '@/lib/email/campaigns/types';

interface CampaignsToolbarProps {
  viewMode: CampaignViewMode;
  search: string;
  onViewModeChange: (viewMode: CampaignViewMode) => void;
  onSearchChange: (search: string) => void;
  trailingActions?: ReactNode;
}

export default function CampaignsToolbar({
  viewMode,
  search,
  onViewModeChange,
  onSearchChange,
  trailingActions,
}: CampaignsToolbarProps) {
  const isTableView = viewMode === 'table';
  const nextViewMode: CampaignViewMode = isTableView ? 'pipeline' : 'table';
  const ViewToggleIcon = isTableView ? ViewColumnOutlinedIcon : TableRowsOutlinedIcon;
  const viewToggleLabel = isTableView ? 'Switch to pipeline view' : 'Switch to table view';

  return (
    <Box className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <Stack spacing={0.5} className="shrink-0">
        <Typography variant="h6" className="font-bold">
          All campaigns
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search, filter, and manage your email campaigns.
        </Typography>
      </Stack>

      <Box className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <TextField
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search campaigns..."
          className="w-full sm:w-72"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear search"
                    size="small"
                    onClick={() => onSearchChange('')}
                    edge="end"
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Box className={`${dataTableClassNames.iconButtonGroup} shrink-0`}>
          <Tooltip title={viewToggleLabel}>
            <IconButton
              size="small"
              aria-label={viewToggleLabel}
              onClick={() => onViewModeChange(nextViewMode)}
            >
              <ViewToggleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {trailingActions}
        </Box>
      </Box>
    </Box>
  );
}
