'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import { useSession } from '@/hooks/useAuth';

export default function AccountContent() {
  const { data: session } = useSession();

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Preferences"
        title="Account"
        description="Your signed-in workspace identity."
      />

      <Card className="dashboard-panel surface-panel max-w-2xl rounded-2xl shadow-none">
        <CardContent className="p-6 md:p-8">
          <Typography variant="h6" component="h2" className="font-bold">
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Details for the account currently signed in to this workspace.
          </Typography>

          <Stack spacing={2} className="mt-5">
            <ProfileField label="Email" value={session?.email ?? '—'} />
            <ProfileField label="Username" value={session?.username ?? '—'} />
            <ProfileField
              label="Hierarchy level"
              value={session ? `Level ${session.hierarchyLevel}` : '—'}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" className="block">
                Roles
              </Typography>
              <Stack direction="row" spacing={1} className="mt-2 flex-wrap gap-y-1">
                {session?.roles.length ? (
                  session.roles.map((role) => (
                    <Chip key={role.id} label={role.name} size="small" className="rounded-lg" />
                  ))
                ) : (
                  <Typography variant="body2" className="font-semibold">
                    —
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Box className="rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/40">
      <Typography variant="caption" color="text.secondary" className="block">
        {label}
      </Typography>
      <Typography variant="body2" className="mt-1 font-semibold">
        {value}
      </Typography>
    </Box>
  );
}
