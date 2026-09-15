import { notFound } from 'next/navigation';
import WebsiteComingSoon from '@/components/website/WebsiteComingSoon';
import WebsiteConfigContent from '@/components/website/config/WebsiteConfigContent';
import OnPageSeoContent from '@/components/website/on-page/OnPageSeoContent';
import WebsiteHubShell from '@/components/website/WebsiteHubShell';
import { websiteTabs } from '@/lib/website/navigation';

interface WebsiteSectionPageProps {
  params: Promise<{ section: string }>;
}

const SECTION_CONTENT: Record<string, React.ReactNode> = {
  'on-page': <OnPageSeoContent />,
  configuration: <WebsiteConfigContent />,
};

export default async function WebsiteSectionPage({ params }: WebsiteSectionPageProps) {
  const { section } = await params;
  const tab = websiteTabs.find((item) => item.href === `/website/${section}`);

  if (!tab) {
    notFound();
  }

  const content = SECTION_CONTENT[section];

  if (content) {
    return <WebsiteHubShell>{content}</WebsiteHubShell>;
  }

  return (
    <WebsiteHubShell>
      <WebsiteComingSoon tab={tab} />
    </WebsiteHubShell>
  );
}
