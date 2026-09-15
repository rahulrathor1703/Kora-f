'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { AnalyticsDashboard } from '@/lib/email/analytics/types';

interface DashboardTabBarProps {
  dashboards: AnalyticsDashboard[];
  activeDashboardId: string | null;
  onSelect: (dashboardId: string) => void;
  onCreate: () => void;
  onRename: (dashboard: AnalyticsDashboard) => void;
  onDelete: (dashboard: AnalyticsDashboard) => void;
}

export default function DashboardTabBar({
  dashboards,
  activeDashboardId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: DashboardTabBarProps) {
  const activeDashboard =
    dashboards.find((dashboard) => dashboard.id === activeDashboardId) ?? null;

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'center' }}
    >
      {dashboards.map((dashboard) => {
        const selected = dashboard.id === activeDashboardId;

        return (
          <Button
            key={dashboard.id}
            type="button"
            variant={selected ? 'contained' : 'outlined'}
            onClick={() => onSelect(dashboard.id)}
            sx={{
              textTransform: 'none',
              minHeight: 40,
              borderRadius: 2,
              px: 2,
            }}
          >
            {dashboard.name}
          </Button>
        );
      })}

      {activeDashboard ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Rename dashboard">
            <IconButton size="small" onClick={() => onRename(activeDashboard)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete dashboard">
            <IconButton size="small" onClick={() => onDelete(activeDashboard)}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}

      <Button
        type="button"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onCreate}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        New Dashboard
      </Button>
    </Stack>
  );
}
