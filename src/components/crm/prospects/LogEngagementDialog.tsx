'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useProspectSearch } from '@/hooks/useProspects';
import { PROSPECT_ENGAGEMENT_TYPE_OPTIONS } from '@/lib/crm/prospects/engagement-types';
import type {
  CreateProspectEngagementInput,
  ProspectSearchResult,
} from '@/lib/crm/prospects/types';

interface LogEngagementDialogProps {
  open: boolean;
  isSubmitting: boolean;
  initialProspect?: ProspectSearchResult | null;
  onClose: () => void;
  onSubmit: (
    prospectId: string,
    input: CreateProspectEngagementInput,
  ) => Promise<void>;
}

const ENGAGEMENT_TYPES = PROSPECT_ENGAGEMENT_TYPE_OPTIONS.map(({ value, label }) => ({
  value,
  label,
}));

const OUTCOMES = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'no-answer', label: 'No answer' },
] as const;

interface LogEngagementDialogFormProps {
  initialProspect: ProspectSearchResult | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    prospectId: string,
    input: CreateProspectEngagementInput,
  ) => Promise<void>;
}

function LogEngagementDialogForm({
  initialProspect,
  isSubmitting,
  onClose,
  onSubmit,
}: LogEngagementDialogFormProps) {
  const [search, setSearch] = useState('');
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectSearchResult | null>(initialProspect);
  const [type, setType] =
    useState<CreateProspectEngagementInput['type']>('call');
  const [discussion, setDiscussion] = useState('');
  const [outcome, setOutcome] =
    useState<CreateProspectEngagementInput['outcome']>('positive');
  const [nextStep, setNextStep] = useState('');

  const showProspectSearch = !initialProspect;

  const { data, isLoading: isSearching } = useProspectSearch(
    search,
    showProspectSearch && !selectedProspect,
  );
  const searchResults = data ?? [];

  async function handleSubmit() {
    if (!selectedProspect) {
      return;
    }

    await onSubmit(selectedProspect.id, {
      type,
      discussion: discussion.trim(),
      outcome,
      nextStep: nextStep.trim() || undefined,
    });
  }

  return (
    <>
      <DialogTitle>
        <Typography variant="h6" component="span" className="font-bold">
          Log Engagement
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Record a call, meeting or interaction
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} className="pt-1">
          <Box>
            {showProspectSearch ? (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="mb-2 block font-semibold tracking-wide uppercase"
                >
                  Step 1 — Select prospect
                </Typography>
                {selectedProspect ? (
                  <Box className="rounded-xl border border-border/60 p-3">
                    <Typography variant="body2" className="font-semibold">
                      {selectedProspect.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedProspect.email}
                    </Typography>
                    <Button
                      size="small"
                      className="mt-2"
                      onClick={() => setSelectedProspect(null)}
                    >
                      Change
                    </Button>
                  </Box>
                ) : (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name or email..."
                      fullWidth
                      size="small"
                    />
                    <Button variant="outlined" disabled className="shrink-0">
                      Search
                    </Button>
                  </Stack>
                )}
                {!selectedProspect && search.trim().length >= 2 ? (
                  <List dense className="mt-2 rounded-xl border border-border/60">
                    {isSearching ? (
                      <ListItemText
                        primary="Searching..."
                        className="px-3 py-2"
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    ) : searchResults.length === 0 ? (
                      <ListItemText
                        primary="No prospects found"
                        className="px-3 py-2"
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    ) : (
                      searchResults.map((result) => (
                        <ListItemButton
                          key={result.id}
                          onClick={() => setSelectedProspect(result)}
                        >
                          <ListItemText
                            primary={result.fullName}
                            secondary={result.email}
                          />
                        </ListItemButton>
                      ))
                    )}
                  </List>
                ) : null}
              </>
            ) : selectedProspect ? (
              <Box className="rounded-xl border border-border/60 p-3">
                <Typography variant="body2" className="font-semibold">
                  {selectedProspect.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedProspect.email}
                </Typography>
              </Box>
            ) : null}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              className="mb-2 block font-semibold tracking-wide uppercase"
            >
              {showProspectSearch ? 'Step 2 — Engagement details' : 'Engagement details'}
            </Typography>
            <Stack spacing={2}>
              <TextField
                select
                label="Type"
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as CreateProspectEngagementInput['type'],
                  )
                }
                fullWidth
                disabled={!selectedProspect || isSubmitting}
              >
                {ENGAGEMENT_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="What was discussed? *"
                value={discussion}
                onChange={(event) => setDiscussion(event.target.value)}
                fullWidth
                multiline
                minRows={3}
                placeholder="Describe the conversation..."
                disabled={!selectedProspect || isSubmitting}
              />
              <TextField
                select
                label="Outcome"
                value={outcome}
                onChange={(event) =>
                  setOutcome(
                    event.target.value as CreateProspectEngagementInput['outcome'],
                  )
                }
                fullWidth
                disabled={!selectedProspect || isSubmitting}
              >
                {OUTCOMES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Next Step (optional)"
                value={nextStep}
                onChange={(event) => setNextStep(event.target.value)}
                fullWidth
                placeholder="e.g. Send proposal by Friday"
                disabled={!selectedProspect || isSubmitting}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !selectedProspect || !discussion.trim()}
        >
          Log Engagement
        </Button>
      </DialogActions>
    </>
  );
}

export default function LogEngagementDialog({
  open,
  isSubmitting,
  initialProspect = null,
  onClose,
  onSubmit,
}: LogEngagementDialogProps) {
  const formKey = initialProspect?.id ?? 'search-mode';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open ? (
        <LogEngagementDialogForm
          key={formKey}
          initialProspect={initialProspect}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
