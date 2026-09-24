'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/data-table/DataTable';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  formatStatusLabel,
  STATUS_COLORS,
} from '@/lib/email/campaigns/detail-utils';
import type { LinkedCampaignSummary } from '@/lib/email/lists/detail-types';
import type { EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface ListCampaignsSectionProps {
  campaigns: LinkedCampaignSummary[];
  isLoading: boolean;
}

export default function ListCampaignsSection({
  campaigns,
  isLoading,
}: ListCampaignsSectionProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();

  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent className="p-4 md:p-6">
        <DataTable<LinkedCampaignSummary>
          tableId="list-linked-campaigns"
          rows={campaigns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          excludeFields={['id']}
          enableSearch={false}
          enablePagination={campaigns.length > 10}
          emptyMessage="No campaigns linked to this list yet"
          noResultsMessage="No campaigns match your search."
          toolbarLeadingContent={
            <Typography variant="h6" className="font-bold">
              Campaigns
            </Typography>
          }
          onRowClick={(row) =>
            router.push(toOrgPath(`/email/campaigns/${row.id}`))
          }
          columnOverrides={{
            name: { label: 'Campaign' },
            status: {
              label: 'Status',
              render: (row) => (
                <Chip
                  label={formatStatusLabel(row.status as EmailCampaignStatus)}
                  color={STATUS_COLORS[row.status as EmailCampaignStatus] ?? 'default'}
                  size="small"
                  className="rounded-lg capitalize"
                />
              ),
            },
            audienceCount: {
              label: 'Audience',
              render: (row) => row.audienceCount.toLocaleString(),
            },
            createdAt: {
              label: 'Created',
              render: (row) =>
                new Date(row.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
