import MailboxDetailContent from '@/components/email/mailboxes/detail/MailboxDetailContent';
import EmailHubShell from '@/components/email/EmailHubShell';

interface MailboxDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MailboxDetailPage({
  params,
}: MailboxDetailPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell hideHeader>
      <MailboxDetailContent mailboxId={id} />
    </EmailHubShell>
  );
}
