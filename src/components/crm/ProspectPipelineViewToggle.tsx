'use client';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { useProspectPipelineView } from '@/components/crm/ProspectPipelineViewContext';
import { prospectPipelineViews } from '@/lib/crm/navigation';
import {
  PROSPECT_PIPELINE_VIEW_TOOLTIPS,
  type ProspectPipelineView,
} from '@/lib/crm/prospect-pipeline-view';

export default function ProspectPipelineViewToggle() {
  const { view, setView } = useProspectPipelineView();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={view}
      onChange={(_event, nextView: ProspectPipelineView | null) => {
        if (nextView && nextView !== view) {
          setView(nextView);
        }
      }}
      aria-label="Prospects and pipeline view"
    >
      {prospectPipelineViews.map((entry) => {
        const viewKey = entry.href as ProspectPipelineView;
        const Icon = entry.icon;
        const tooltip =
          PROSPECT_PIPELINE_VIEW_TOOLTIPS[viewKey] ?? entry.label;

        return (
          <Tooltip key={viewKey} title={tooltip}>
            <ToggleButton
              value={viewKey}
              aria-label={tooltip}
              sx={{
                color: 'text.secondary',
                borderColor: 'divider',
                '&.Mui-selected': {
                  color: 'primary.contrastText',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <Icon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        );
      })}
    </ToggleButtonGroup>
  );
}
