'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsLink from '@/components/settings/SettingsLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import AssignPoliciesStepper, {
  type AssignPoliciesStep,
} from '@/components/settings/abac/assign/AssignPoliciesStepper';
import AssignReviewPanel from '@/components/settings/abac/assign/AssignReviewPanel';
import AssignSummarySidebar from '@/components/settings/abac/assign/AssignSummarySidebar';
import MemberMultiPicker from '@/components/settings/abac/assign/MemberMultiPicker';
import PolicyMultiPicker from '@/components/settings/abac/assign/PolicyMultiPicker';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useAbacPolicies,
  useBulkAssignAbacPolicies,
} from '@/hooks/useAbacPolicies';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import type { BulkAssignAbacPoliciesMode } from '@/lib/api';
import { bulkAssignAbacPoliciesSchema } from '@/lib/schemas/abac-policy';

function parseIdsParam(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSuccessMessage(
  policyCount: number,
  memberCount: number,
  mode: BulkAssignAbacPoliciesMode,
  assignmentsCreated: number,
): string {
  if (mode === 'add') {
    if (assignmentsCreated === 0) {
      return 'All selected policies were already assigned to the selected members.';
    }

    return `Added ${assignmentsCreated} new assignment${assignmentsCreated === 1 ? '' : 's'} across ${memberCount} member${memberCount === 1 ? '' : 's'}.`;
  }

  return `Updated policies for ${memberCount} member${memberCount === 1 ? '' : 's'} with ${policyCount} polic${policyCount === 1 ? 'y' : 'ies'}.`;
}

export default function AssignPoliciesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { policies, refetch: refetchPolicies } = useAbacPolicies();
  const { members, refetch: refetchMembers } = useTeamMembers();
  const { bulkAssign, isAssigning, error: assignError } =
    useBulkAssignAbacPolicies();

  const [activeStep, setActiveStep] = useState<AssignPoliciesStep>(() => {
    const initialPolicyIds = parseIdsParam(searchParams.get('policyIds'));
    const initialUserIds = parseIdsParam(searchParams.get('userIds'));

    if (initialUserIds.length > 0) {
      return initialPolicyIds.length > 0 ? 'review' : 'members';
    }

    return 'policies';
  });
  const [policyIds, setPolicyIds] = useState<string[]>(() =>
    parseIdsParam(searchParams.get('policyIds')),
  );
  const [userIds, setUserIds] = useState<string[]>(() =>
    parseIdsParam(searchParams.get('userIds')),
  );
  const [mode, setMode] = useState<BulkAssignAbacPoliciesMode>('add');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const selectedPolicies = useMemo(
    () => policies.filter((policy) => policyIds.includes(policy.id)),
    [policies, policyIds],
  );

  const selectedMembers = useMemo(
    () => members.filter((member) => userIds.includes(member.id)),
    [members, userIds],
  );

  const hasPolicies = policyIds.length > 0;
  const hasMembers = userIds.length > 0;
  const canContinuePolicies = hasPolicies;
  const canContinueMembers = hasMembers;
  const canSubmit = hasPolicies && hasMembers;

  async function handleAssign() {
    const parsed = bulkAssignAbacPoliciesSchema.safeParse({
      policyIds,
      userIds,
      mode,
    });

    if (!parsed.success) {
      return;
    }

    try {
      const result = await bulkAssign(parsed.data);
      await Promise.all([refetchPolicies(), refetchMembers()]);
      setSnackbar(
        formatSuccessMessage(
          policyIds.length,
          userIds.length,
          mode,
          result.assignmentsCreated,
        ),
      );
      setPolicyIds([]);
      setUserIds([]);
      setMode('add');
      setActiveStep('policies');
      router.replace('/settings/abac/assign');
    } catch {
      // error surfaced via hook
    }
  }

  function handleAssignClick() {
    if (mode === 'replace') {
      setShowReplaceConfirm(true);
      return;
    }

    void handleAssign();
  }

  function handleBack() {
    if (activeStep === 'members') {
      setActiveStep('policies');
      return;
    }

    if (activeStep === 'review') {
      setActiveStep('members');
    }
  }

  function handleContinue() {
    if (activeStep === 'policies' && canContinuePolicies) {
      setActiveStep('members');
      return;
    }

    if (activeStep === 'members' && canContinueMembers) {
      setActiveStep('review');
    }
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Access control"
        title="Assign ABAC policies"
        description="Select multiple policies and assign them to one or many team members in a single action."
      />

      <AssignPoliciesStepper
        activeStep={activeStep}
        hasPolicies={hasPolicies}
        hasMembers={hasMembers}
      />

      {assignError ? <Alert severity="error">{assignError}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card className="surface-panel rounded-2xl shadow-primary-soft">
            <CardContent className="p-5 sm:p-6">
              <Fade in key={activeStep}>
                <Box>
                  {activeStep === 'policies' ? (
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" className="font-bold">
                        Choose policies
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Select one or more ABAC policies to assign.
                      </Typography>
                      <PolicyMultiPicker value={policyIds} onChange={setPolicyIds} />
                    </Stack>
                  ) : null}

                  {activeStep === 'members' ? (
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" className="font-bold">
                        Choose members
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Select one or many team members to receive the policies.
                      </Typography>
                      <MemberMultiPicker value={userIds} onChange={setUserIds} />
                    </Stack>
                  ) : null}

                  {activeStep === 'review' ? (
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" className="font-bold">
                        Review assignment
                      </Typography>
                      <AssignReviewPanel
                        mode={mode}
                        onModeChange={setMode}
                        selectedPolicies={selectedPolicies}
                        selectedMembers={selectedMembers}
                      />
                    </Stack>
                  ) : null}
                </Box>
              </Fade>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', mt: 4 }}
              >
                <Stack direction="row" spacing={1.5}>
                  {activeStep !== 'policies' ? (
                    <Button
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                      className="rounded-xl"
                    >
                      Back
                    </Button>
                  ) : (
                    <Button
                      component={SettingsLink}
                      href="/settings/abac"
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>

                {activeStep === 'review' ? (
                  <Button
                    variant="contained"
                    disabled={!canSubmit || isAssigning}
                    onClick={handleAssignClick}
                    className="rounded-xl px-5 shadow-primary-soft"
                    startIcon={
                      isAssigning ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {isAssigning ? 'Assigning…' : 'Assign policies'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={
                      activeStep === 'policies'
                        ? !canContinuePolicies
                        : !canContinueMembers
                    }
                    onClick={handleContinue}
                    endIcon={<ArrowForwardIcon />}
                    className="rounded-xl px-5 shadow-primary-soft"
                  >
                    Continue
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <AssignSummarySidebar
            activeStep={activeStep}
            policyCount={policyIds.length}
            memberCount={userIds.length}
            mode={mode}
          />
        </Grid>
      </Grid>

      <ConfirmDialog
        open={showReplaceConfirm}
        title="Replace all policies?"
        description="This will remove any existing ABAC policies not in your selection for each selected member. This action cannot be undone from this screen."
        variant="warning"
        confirmLabel="Replace policies"
        isLoading={isAssigning}
        onClose={() => setShowReplaceConfirm(false)}
        onConfirm={() => {
          setShowReplaceConfirm(false);
          void handleAssign();
        }}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        message={snackbar ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
