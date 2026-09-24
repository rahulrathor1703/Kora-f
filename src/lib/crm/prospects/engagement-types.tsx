'use client';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import type { ProspectEngagementType } from '@/lib/crm/prospects/types';

export interface ProspectEngagementTypeOption {
  value: ProspectEngagementType;
  label: string;
  icon: React.ReactNode;
}

export const PROSPECT_ENGAGEMENT_TYPE_OPTIONS: ProspectEngagementTypeOption[] = [
  { value: 'call', label: 'Call', icon: <PhoneOutlinedIcon fontSize="small" /> },
  { value: 'email', label: 'Email', icon: <EmailOutlinedIcon fontSize="small" /> },
  {
    value: 'meeting',
    label: 'Meeting',
    icon: <GroupsOutlinedIcon fontSize="small" />,
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    icon: <LinkedInIcon fontSize="small" />,
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: <WhatsAppIcon fontSize="small" />,
  },
];

export const PROSPECT_ENGAGEMENT_TYPE_LABELS: Record<
  ProspectEngagementType,
  string
> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  status_change: 'Status change',
};

export const PROSPECT_ENGAGEMENT_TYPE_ICONS: Record<
  ProspectEngagementType,
  React.ReactNode
> = {
  call: <PhoneOutlinedIcon fontSize="small" />,
  email: <EmailOutlinedIcon fontSize="small" />,
  meeting: <GroupsOutlinedIcon fontSize="small" />,
  linkedin: <LinkedInIcon fontSize="small" />,
  whatsapp: <WhatsAppIcon fontSize="small" />,
  status_change: <SwapHorizOutlinedIcon fontSize="small" />,
};

export const PROSPECT_ENGAGEMENT_OUTCOME_LABELS = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
  'no-answer': 'No answer',
} as const;
