import ManualListDetailContent from '@/components/email/lists/detail/manual/ManualListDetailContent';
import EmailHubShell from '@/components/email/EmailHubShell';

interface ManualListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManualListDetailPage({
  params,
}: ManualListDetailPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell hideHeader>
      <ManualListDetailContent listId={id} />
    </EmailHubShell>
  );
}
