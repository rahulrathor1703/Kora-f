export type DeliverabilityKey = 'spf' | 'dkim' | 'dmarc';

export interface DeliverabilityItem {
  key: DeliverabilityKey;
  label: string;
  fullName: string;
}

export const deliverabilityItems: DeliverabilityItem[] = [
  { key: 'spf', label: 'SPF', fullName: 'Sender Policy Framework' },
  { key: 'dkim', label: 'DKIM', fullName: 'DomainKeys Identified Mail' },
  {
    key: 'dmarc',
    label: 'DMARC',
    fullName: 'Domain-based Message Authentication',
  },
];
