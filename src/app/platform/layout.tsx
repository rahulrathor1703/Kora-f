import { redirect } from 'next/navigation';
import PlatformShell from '@/components/platform/PlatformShell';
import { getSession } from '@/lib/auth/session';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'superadmin') {
    redirect('/login?error=unauthorized');
  }

  return <PlatformShell user={session}>{children}</PlatformShell>;
}
