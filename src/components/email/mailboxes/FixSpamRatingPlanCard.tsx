'use client';

import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type ReactElement } from 'react';
import {
  calculateFixSpamRatingTotal,
  type FixSpamRatingPlan,
  type FixSpamRatingPlanAccent,
} from '@/lib/email/fix-spam-rating-plans';

const planIcons: Record<FixSpamRatingPlanAccent, ReactElement> = {
  essential: <ShieldOutlinedIcon fontSize="small" />,
  professional: <SpeedOutlinedIcon fontSize="small" />,
  enterprise: <DiamondOutlinedIcon fontSize="small" />,
};

interface FixSpamRatingPlanCardProps {
  plan: FixSpamRatingPlan;
  mailboxCount: number;
  isSelected: boolean;
  onSelect: (plan: FixSpamRatingPlan) => void;
}

export default function FixSpamRatingPlanCard({
  plan,
  mailboxCount,
  isSelected,
  onSelect,
}: FixSpamRatingPlanCardProps) {
  const isRecommended = Boolean(plan.recommended);
  const totalPrice = calculateFixSpamRatingTotal(plan.price, mailboxCount);

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(plan)}
      className={[
        'spam-rating-plan-card',
        `spam-rating-plan-card-${plan.accent}`,
        isRecommended ? 'spam-rating-plan-card-recommended' : '',
        isSelected ? 'spam-rating-plan-card-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={isSelected}
      aria-label={`${plan.name} plan, $${plan.price} per mailbox per month`}
    >
      {isRecommended ? (
        <Chip
          label="Most popular"
          size="small"
          className="spam-rating-plan-badge mb-2 self-center rounded-full font-semibold normal-case"
        />
      ) : null}

      {isSelected ? (
        <Box className="spam-rating-plan-selected-mark" aria-hidden="true">
          <CheckOutlinedIcon fontSize="inherit" />
        </Box>
      ) : null}

      <Stack spacing={0} className="h-full w-full text-left">
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
          <Box className={`spam-rating-plan-icon spam-rating-plan-icon-${plan.accent}`}>
            {planIcons[plan.accent]}
          </Box>
          <Box className="min-w-0 flex-1">
            <Typography variant="subtitle1" className="font-bold tracking-tight">
              {plan.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-0.5 leading-snug">
              {plan.description}
            </Typography>
          </Box>
        </Stack>

        <Box className="spam-rating-plan-price-block">
          <Typography component="span" className="spam-rating-plan-currency">
            $
          </Typography>
          <Typography component="span" className="spam-rating-plan-amount">
            {plan.price}
          </Typography>
          <Typography component="span" className="spam-rating-plan-period">
            /mail · month
          </Typography>
        </Box>

        {mailboxCount > 1 ? (
          <Typography variant="body2" color="text.secondary" className="mt-1 font-medium">
            ${plan.price} × {mailboxCount} mailboxes = ${totalPrice}/mo
          </Typography>
        ) : null}

        <Box className="spam-rating-plan-features-panel">
          <Stack component="ul" spacing={1} className="m-0 list-none p-0">
            {plan.features.map((feature) => (
              <Stack
                key={feature}
                component="li"
                direction="row"
                spacing={1}
                sx={{ alignItems: 'flex-start' }}
              >
                <Box className={`spam-rating-plan-check spam-rating-plan-check-${plan.accent}`}>
                  <CheckOutlinedIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                </Box>
                <Typography variant="body2" className="leading-snug">
                  {feature}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
