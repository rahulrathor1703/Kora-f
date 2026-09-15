import ContactListDetailContent from '@/components/email/lists/detail/contact/ContactListDetailContent';
import EmailHubShell from '@/components/email/EmailHubShell';

interface ContactListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactListDetailPage({
  params,
}: ContactListDetailPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell hideHeader>
      <ContactListDetailContent listId={id} />
    </EmailHubShell>
  );
}
