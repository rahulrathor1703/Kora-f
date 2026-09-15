'use client';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import MailboxProviderLogo from '@/components/email/mailboxes/MailboxProviderLogo';
import MailboxSpamRateDisplay from '@/components/email/mailboxes/MailboxSpamRateDisplay';
import type { FixSpamRatingMailboxSummary } from '@/components/email/mailboxes/FixSpamRatingPricingDialog';
import {
  calculateFixSpamRatingTotal,
  type FixSpamRatingPlan,
} from '@/lib/email/fix-spam-rating-plans';
import { getMailboxDeliverability } from '@/lib/email/mailbox-deliverability';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

interface FixSpamRatingMailboxSelectDialogProps {
  open: boolean;
  plan: FixSpamRatingPlan | null;
  mailboxes: SenderMailbox[];
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (mailboxes: FixSpamRatingMailboxSummary[]) => void;
}

export default function FixSpamRatingMailboxSelectDialog({
  open,
  plan,
  mailboxes,
  isLoading,
  onClose,
  onConfirm,
}: FixSpamRatingMailboxSelectDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedMailboxIds, setSelectedMailboxIds] = useState<Set<string>>(() => new Set());

  const selectedCount = selectedMailboxIds.size;
  const totalPrice =
    plan && selectedCount > 0
      ? calculateFixSpamRatingTotal(plan.price, selectedCount)
      : null;

  function handleToggleMailbox(mailbox: SenderMailbox) {
    setSelectedMailboxIds((current) => {
      const next = new Set(current);

      if (next.has(mailbox.id)) {
        next.delete(mailbox.id);
      } else {
        next.add(mailbox.id);
      }

      return next;
    });
  }

  function handleDismiss() {
    setSelectedMailboxIds(new Set());
    onClose();
  }

  function handleConfirm() {
    if (!plan || selectedCount === 0) {
      return;
    }

    const selected = mailboxes
      .filter((mailbox) => selectedMailboxIds.has(mailbox.id))
      .map((mailbox) => ({
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.displayName,
      }));

    setSelectedMailboxIds(new Set());
    onConfirm(selected);
  }

  return (
    <Dialog
      open={open && plan !== null}
      onClose={handleDismiss}
      fullWidth
      fullScreen={isMobile}
      maxWidth="md"
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
                    Select mailboxes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mt-0.5">
                    {plan
                      ? `${plan.name} plan · $${plan.price}/mailbox/month · choose one or more`
                      : 'Choose one or more mailboxes in your organization'}
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                aria-label="Close mailbox selection"
                onClick={handleDismiss}
                size="small"
                className="spam-rating-pricing-close shrink-0 rounded-xl"
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Box className="spam-rating-mailbox-select-body">
          {isLoading ? (
            <Stack spacing={1.25}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={64} className="rounded-xl" />
              ))}
            </Stack>
          ) : mailboxes.length === 0 ? (
            <Stack spacing={1.5} className="items-center py-8 text-center">
              <Box className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <MailOutlineOutlinedIcon />
              </Box>
              <Typography variant="subtitle1" className="font-bold">
                No mailboxes yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="max-w-sm">
                Add a sender mailbox before subscribing to a spam rating recovery plan.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1} component="ul" className="m-0 list-none p-0">
              {mailboxes.map((mailbox) => {
                const isSelected = selectedMailboxIds.has(mailbox.id);
                const deliverability = getMailboxDeliverability(mailbox);

                return (
                  <Box
                    key={mailbox.id}
                    component="li"
                    className={[
                      'spam-rating-mailbox-select-row',
                      isSelected ? 'spam-rating-mailbox-select-row-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => handleToggleMailbox(mailbox)}
                      className="spam-rating-mailbox-select-button"
                      aria-pressed={isSelected}
                    >
                      <Checkbox
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                        className="spam-rating-mailbox-select-checkbox"
                        slotProps={{ input: { 'aria-hidden': true } }}
                      />
                      <MailboxProviderLogo provider={mailbox.provider} className="h-9 w-9 shrink-0" />
                      <Box className="min-w-0 flex-1 text-left">
                        <Typography variant="subtitle2" className="truncate font-semibold">
                          {mailbox.displayName || mailbox.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="truncate">
                          {mailbox.email}
                        </Typography>
                      </Box>
                      <MailboxSpamRateDisplay
                        score={deliverability.spamScore}
                        variant="compact"
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Box className="spam-rating-pricing-footer">
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.25}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography variant="body2" color="text.secondary" className="font-medium">
              {selectedCount === 0
                ? 'Select at least one mailbox'
                : `${selectedCount} mailbox${selectedCount === 1 ? '' : 'es'} selected`}
            </Typography>
            <Stack direction="row" spacing={1.25} className="w-full sm:w-auto">
              <Button onClick={handleDismiss} variant="text" className="rounded-xl normal-case">
                Back to plans
              </Button>
              <Button
                variant="contained"
                disabled={!plan || selectedCount === 0 || mailboxes.length === 0}
                onClick={handleConfirm}
                fullWidth={isMobile}
                className="rounded-xl px-5 normal-case shadow-primary-soft"
              >
                {totalPrice !== null ? `Continue · $${totalPrice}/mo` : 'Continue'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
