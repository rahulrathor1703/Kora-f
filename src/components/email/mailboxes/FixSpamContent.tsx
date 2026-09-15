'use client';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import EmailHubShell from '@/components/email/EmailHubShell';
import FixSpamRatingMailboxSelectDialog from '@/components/email/mailboxes/FixSpamRatingMailboxSelectDialog';
import FixSpamRatingPlanCard from '@/components/email/mailboxes/FixSpamRatingPlanCard';
import type { FixSpamRatingMailboxSummary } from '@/components/email/mailboxes/FixSpamRatingPricingDialog';
import { useMailboxes } from '@/hooks/useMailboxes';
import { useNotify } from '@/hooks/useNotify';
import {
  calculateFixSpamRatingTotal,
  fixSpamRatingPlans,
  type FixSpamRatingPlan,
} from '@/lib/email/fix-spam-rating-plans';

export default function FixSpamContent() {
  const { mailboxes, isLoading } = useMailboxes();
  const { notifySuccess } = useNotify();
  const [selectedPlanId, setSelectedPlanId] = useState<FixSpamRatingPlan['id'] | null>(null);
  const [isMailboxSelectOpen, setIsMailboxSelectOpen] = useState(false);

  const selectedPlan = fixSpamRatingPlans.find((plan) => plan.id === selectedPlanId) ?? null;

  function handleSelectPlan(plan: FixSpamRatingPlan) {
    setSelectedPlanId(plan.id);
  }

  function handleContinueToMailboxes() {
    if (!selectedPlan) {
      return;
    }

    setIsMailboxSelectOpen(true);
  }

  function handleCloseMailboxSelect() {
    setIsMailboxSelectOpen(false);
  }

  function handleConfirmMailboxes(selectedMailboxes: FixSpamRatingMailboxSummary[]) {
    if (!selectedPlan || selectedMailboxes.length === 0) {
      return;
    }

    const totalPrice = calculateFixSpamRatingTotal(
      selectedPlan.price,
      selectedMailboxes.length,
    );
    const mailboxLabel =
      selectedMailboxes.length === 1
        ? selectedMailboxes[0]?.email ?? 'this mailbox'
        : `${selectedMailboxes.length} mailboxes`;

    notifySuccess(
      `${selectedPlan.name} plan selected for ${mailboxLabel} ($${totalPrice}/mo). Checkout coming soon.`,
    );
    setIsMailboxSelectOpen(false);
    setSelectedPlanId(null);
  }

  return (
    <EmailHubShell>
      <Box className="spam-rating-plans-page dashboard-panel overflow-hidden rounded-[28px] border border-surface-border">
        <Box className="spam-rating-pricing-hero">
          <Box className="spam-rating-pricing-orb spam-rating-pricing-orb-a" aria-hidden="true" />
          <Box className="spam-rating-pricing-orb spam-rating-pricing-orb-b" aria-hidden="true" />

          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }} className="relative z-10">
            <Box className="spam-rating-pricing-icon">
              <AutoFixHighOutlinedIcon fontSize="small" />
            </Box>
            <Box className="min-w-0">
              <Typography variant="h5" component="h1" className="spam-rating-pricing-title font-bold tracking-tight">
                Restore inbox reputation
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-0.5">
                Per-mailbox plans · cancel anytime · no setup fee
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box className="spam-rating-plans-page-body">
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }} className="spam-rating-pricing-plans">
            {fixSpamRatingPlans.map((plan) => (
              <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                <FixSpamRatingPlanCard
                  plan={plan}
                  mailboxCount={0}
                  isSelected={selectedPlanId === plan.id}
                  onSelect={handleSelectPlan}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box className="spam-rating-pricing-footer">
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.25}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'flex-end' }}
          >
            <Typography variant="body2" color="text.secondary" className="mr-auto font-medium">
              {selectedPlan
                ? `${selectedPlan.name} selected · $${selectedPlan.price}/mailbox/month`
                : 'Choose a plan to continue'}
            </Typography>
            <Button
              variant="contained"
              disabled={!selectedPlan}
              onClick={handleContinueToMailboxes}
              className="rounded-xl px-5 normal-case shadow-primary-soft"
            >
              Choose plan
            </Button>
          </Stack>
        </Box>
      </Box>

      <FixSpamRatingMailboxSelectDialog
        open={isMailboxSelectOpen}
        plan={selectedPlan}
        mailboxes={mailboxes}
        isLoading={isLoading}
        onClose={handleCloseMailboxSelect}
        onConfirm={handleConfirmMailboxes}
      />
    </EmailHubShell>
  );
}
