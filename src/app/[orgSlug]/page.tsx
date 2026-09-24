import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { env } from '@/config/env';
import { getSession } from '@/lib/auth/session';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { isOrgModuleEnabled } from '@/lib/org-entitlements/workspace-access';
import { resolveWorkspaceHomePath } from '@/lib/workspace-navigation';
import { orgPath } from '@/lib/org-path';

interface OrgDashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
  const { orgSlug } = await params;
  const session = await getSession();
  const enabledModules = session?.organization?.enabledModules;

  if (!isOrgModuleEnabled(enabledModules, 'dashboard')) {
    redirect(
      orgPath(
        orgSlug,
        resolveWorkspaceHomePath(
          enabledModules,
          session?.permissions ?? [],
          isPlatformOwner(session),
        ),
      ),
    );
  }

  return (
    <DashboardContent>
      <Box className="dashboard-hero surface-panel mb-6 rounded-2xl border border-surface p-6 md:p-8">
        <Typography
          variant="overline"
          className="font-semibold tracking-[0.12em] text-primary"
        >
          {env.brandName} workspace
        </Typography>
        <Typography variant="h4" component="h1" className="mt-2 font-bold tracking-tight">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mt-2 max-w-2xl">
          Welcome to your organization workspace. Manage team access, roles, and
          preferences from Settings in the sidebar.
        </Typography>
      </Box>
    </DashboardContent>
  );
}
