'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import type { AbacPolicy, BulkAssignAbacPoliciesMode, TeamMember } from '@/lib/api';

interface AssignReviewPanelProps {
  mode: BulkAssignAbacPoliciesMode;
  onModeChange: (mode: BulkAssignAbacPoliciesMode) => void;
  selectedPolicies: AbacPolicy[];
  selectedMembers: TeamMember[];
}

export default function AssignReviewPanel({
  mode,
  onModeChange,
  selectedPolicies,
  selectedMembers,
}: AssignReviewPanelProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const totalAssignments = selectedPolicies.length * selectedMembers.length;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body2" className="mb-2 font-semibold">
          Assignment mode
        </Typography>
        <RadioGroup
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value as BulkAssignAbacPoliciesMode)
          }
        >
          <FormControlLabel
            value="add"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" className="font-semibold">
                  Add policies
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Merge selected policies with each member&apos;s existing assignments.
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="replace"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" className="font-semibold">
                  Replace all policies
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Each selected member will have exactly the selected policies.
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Box>

      {mode === 'replace' ? (
        <Alert severity="warning">
          Replace mode removes any existing ABAC policies not included in your selection
          for each selected member.
        </Alert>
      ) : null}

      <Box className="rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/40">
        <Typography variant="subtitle2" className="font-bold">
          Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-2">
          Assigning{' '}
          <strong>{selectedPolicies.length}</strong> polic
          {selectedPolicies.length === 1 ? 'y' : 'ies'} to{' '}
          <strong>{selectedMembers.length}</strong> member
          {selectedMembers.length === 1 ? '' : 's'} ({totalAssignments} potential
          assignment{totalAssignments === 1 ? '' : 's'}).
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', mt: 2 }}
        >
          <Typography variant="caption" className="font-semibold uppercase tracking-wider text-text-secondary">
            Details
          </Typography>
          <IconButton
            size="small"
            onClick={() => setDetailsExpanded((current) => !current)}
            aria-expanded={detailsExpanded}
            aria-label={detailsExpanded ? 'Collapse details' : 'Expand details'}
          >
            <ExpandMoreIcon
              sx={{
                transform: detailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>
        </Stack>

        <Collapse in={detailsExpanded}>
          <Stack spacing={0.5} className="mt-2">
            <Typography variant="caption" className="font-semibold">
              Policies
            </Typography>
            {selectedPolicies.map((policy) => (
              <Typography key={policy.id} variant="caption" color="text.secondary">
                {policy.name} ({policy.resource}:{policy.action})
              </Typography>
            ))}
            <Typography variant="caption" className="mt-2 font-semibold">
              Members
            </Typography>
            {selectedMembers.map((member) => (
              <Typography key={member.id} variant="caption" color="text.secondary">
                {member.username ?? member.email}
              </Typography>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Stack>
  );
}
