'use client';

import SequenceEmailFields from '@/components/email/campaigns/create/sequence/SequenceEmailFields';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';

export default function InitialOutreachCard() {
  return (
    <WizardFormSection title="Step 1 — Opening Email" divided>
      <SequenceEmailFields
        subjectName="initialOutreach.subject"
        bodyName="initialOutreach.body"
        subjectHtmlId="initial-outreach-subject"
        bodyHtmlId="initial-outreach-body"
        stepOrder={1}
      />
    </WizardFormSection>
  );
}
