'use client';

import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AuthUser } from '@/lib/api/auth';

interface WorkspaceHomeContentProps {
  user: AuthUser;
}

const placeholderCards = [
  {
    icon: GroupsOutlinedIcon,
    title: 'Team',
    description: 'Invite teammates and manage organization access.',
  },
  {
    icon: SettingsOutlinedIcon,
    title: 'Settings',
    description: 'Configure workspace preferences and security controls.',
  },
  {
    icon: HelpOutlineOutlinedIcon,
    title: 'Support',
    description: 'Get help from the Markos platform team when you need it.',
  },
] as const;

export default function WorkspaceHomeContent({ user }: WorkspaceHomeContentProps) {
  const organizationName = user.organization?.name ?? 'your organization';

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full">
      <Stack spacing={4} className="max-w-5xl">
        <Box className="workspace-hero surface-panel rounded-2xl p-6 md:p-8">
          <Stack spacing={1.5}>
            <Typography
              variant="h3"
              component="h1"
              className="text-balance text-foreground"
              sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}
            >
              Welcome to {organizationName}
            </Typography>
            <Typography variant="body1" className="max-w-2xl text-pretty text-muted">
              Your workspace is ready. This is your organization home on Markos —
              manage your team, settings, and workflows from here as features roll out.
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Typography variant="h6" component="h2" className="font-semibold text-foreground">
            Getting started
          </Typography>
          <Box className="workspace-card-grid">
            {placeholderCards.map(({ icon: Icon, title, description }) => (
              <Box key={title} className="workspace-card surface-panel rounded-2xl p-5">
                <Stack spacing={1.5}>
                  <Box className="workspace-card-icon">
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle1" className="font-semibold text-foreground">
                    {title}
                  </Typography>
                  <Typography variant="body2" className="text-muted">
                    {description}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
