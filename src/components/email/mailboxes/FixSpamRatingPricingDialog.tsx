'use client';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import FixSpamRatingPlanCard from '@/components/email/mailboxes/FixSpamRatingPlanCard';
import {
  calculateFixSpamRatingTotal,
  fixSpamRatingPlans,
  type FixSpamRatingPlan,
} from '@/lib/email/fix-spam-rating-plans';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

export type FixSpamRatingMailboxSummary = Pick<SenderMailbox, 'id' | 'email' | 'displayName'>;

interface FixSpamRatingPricingDialogProps {
  mailboxes: FixSpamRatingMailboxSummary[] | null;
  onClose: () => void;
}

function SelectedMailboxesSummary({
  mailboxes,
}: {
  mailboxes: FixSpamRatingMailboxSummary[];
}) {
  const visibleMailboxes = mailboxes.slice(0, 3);
  const hiddenCount = mailboxes.length - visibleMailboxes.length;

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {mailboxes.length === 1
          ? 'Plan applies to this mailbox:'
          : `${mailboxes.length} mailboxes selected:`}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {visibleMailboxes.map((mailbox) => (
          <Chip
            key={mailbox.id}
            icon={<MailOutlineOutlinedIcon />}
            label={mailbox.email}
            size="small"
            variant="outlined"
            className="max-w-full rounded-lg font-medium normal-case"
          />
        ))}
        {hiddenCount > 0 ? (
          <Chip
            label={`+${hiddenCount} more`}
            size="small"
            variant="outlined"
            className="rounded-lg font-medium normal-case"
          />
        ) : null}
      </Stack>
    </Stack>
  );
}

export default function FixSpamRatingPricingDialog({
  mailboxes,
  onClose,
}: FixSpamRatingPricingDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { notifySuccess } = useNotify();
  const [selectedPlanId, setSelectedPlanId] = useState<FixSpamRatingPlan['id'] | null>(null);

  const mailboxCount = mailboxes?.length ?? 0;
  const selectedPlan = fixSpamRatingPlans.find((plan) => plan.id === selectedPlanId) ?? null;
  const selectedTotal = selectedPlan
    ? calculateFixSpamRatingTotal(selectedPlan.price, mailboxCount)
    : null;

  function handleClose() {
    setSelectedPlanId(null);
    onClose();
  }

  function handleSelectPlan(plan: FixSpamRatingPlan) {
    setSelectedPlanId(plan.id);
  }

  function handleContinue() {
    if (!selectedPlan || mailboxCount === 0) {
      return;
    }

    const mailboxLabel =
      mailboxCount === 1
        ? mailboxes?.[0]?.email ?? 'this mailbox'
        : `${mailboxCount} mailboxes`;

    notifySuccess(
      `${selectedPlan.name} plan selected for ${mailboxLabel} ($${selectedTotal}/mo). Checkout coming soon.`,
    );
    handleClose();
  }

  return (
    <Dialog
      key={mailboxes?.map((mailbox) => mailbox.id).join('-') ?? 'closed'}
      open={mailboxCount > 0}
      onClose={handleClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="lg"
      slotProps={{
        paper: {
          className: [
            'spam-rating-pricing-dialog',
            isMobile ? 'spam-rating-pricing-dialog-mobile' : 'rounded-[28px]',
          ].join(' '),
        },
      }}
    >
      <DialogContent className="spam-rating-pricing-content p-0">
        <Box className="spam-rating-pricing-hero">
          <Box className="spam-rating-pricing-orb spam-rating-pricing-orb-a" aria-hidden="true" />
          <Box className="spam-rating-pricing-orb spam-rating-pricing-orb-b" aria-hidden="true" />

          <Stack spacing={2} className="relative z-10">
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box className="spam-rating-pricing-icon">
                  <AutoFixHighOutlinedIcon fontSize="small" />
                </Box>
                <Box className="min-w-0">
                  <Typography
                    variant={isMobile ? 'h6' : 'h5'}
                    component="h2"
                    className="spam-rating-pricing-title font-bold tracking-tight"
                  >
                    Restore inbox reputation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mt-0.5">
                    Per-mailbox plans · cancel anytime · no setup fee
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                aria-label="Close pricing dialog"
                onClick={handleClose}
                size="small"
                className="spam-rating-pricing-close shrink-0 rounded-xl"
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>

            {mailboxes ? <SelectedMailboxesSummary mailboxes={mailboxes} /> : null}
          </Stack>
        </Box>

        <Box className="spam-rating-pricing-body">
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }} className="spam-rating-pricing-plans">
            {fixSpamRatingPlans.map((plan) => (
              <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                <FixSpamRatingPlanCard
                  plan={plan}
                  mailboxCount={mailboxCount}
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
            <Button onClick={handleClose} variant="text" className="rounded-xl normal-case">
              Maybe later
            </Button>
            <Button
              variant="contained"
              disabled={!selectedPlan}
              onClick={handleContinue}
              fullWidth={isMobile}
              className="rounded-xl px-5 normal-case shadow-primary-soft"
            >
              {selectedPlan && selectedTotal !== null
                ? mailboxCount > 1
                  ? `Continue with ${selectedPlan.name} · $${selectedTotal}/mo total`
                  : `Continue with ${selectedPlan.name} · $${selectedTotal}/mo`
                : 'Select a plan to continue'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
