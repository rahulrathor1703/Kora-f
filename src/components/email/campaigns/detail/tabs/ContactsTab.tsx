'use client';

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import AddCampaignRecipientDialog from '@/components/email/campaigns/detail/AddCampaignRecipientDialog';
import AudienceSummaryPanel from '@/components/email/campaigns/detail/AudienceSummaryPanel';
import CampaignRecipientsTable from '@/components/email/campaigns/detail/CampaignRecipientsTable';
import RecipientDetailDrawer from '@/components/email/campaigns/detail/RecipientDetailDrawer';
import { useAddCampaignRecipient } from '@/hooks/useAddCampaignRecipient';
import {
  useCampaignRecipients,
  useEmailCampaign,
} from '@/hooks/useEmailCampaigns';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { EmailCampaign } from '@/lib/email/campaigns/types';
import type { CampaignDetailLabels } from '@/hooks/useCampaignDetailLabels';
import type {
  CampaignRecipientDetail,
  CampaignRecipientEngagementStatus,
  CampaignRecipientDisposition,
} from '@/lib/email/campaigns/recipient-types';
import { CAMPAIGN_RECIPIENT_STATUS_OPTIONS } from '@/lib/email/campaigns/recipient-types';
import { CAMPAIGN_RECIPIENT_DISPOSITION_OPTIONS } from '@/lib/email/campaigns/audience-types';
import { getAudienceListPath } from '@/lib/email/lists/paths';

interface ContactsTabProps {
  campaign: EmailCampaign;
  labels: CampaignDetailLabels;
}

export default function ContactsTab({ campaign, labels }: ContactsTabProps) {
  const toOrgPath = useOrgPath();
  const hasAudience = Boolean(campaign.audienceListId);
  const canAddRecipient =
    campaign.status === 'scheduled' || campaign.status === 'sending';
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CampaignRecipientEngagementStatus | ''>(
    '',
  );
  const [disposition, setDisposition] = useState<
    CampaignRecipientDisposition | ''
  >('');
  const [page, setPage] = useState(1);
  const [selectedRecipient, setSelectedRecipient] =
    useState<CampaignRecipientDetail | null>(null);
  const limit = 25;

  const recipientsQuery = useMemo(
    () => ({
      search,
      status: status || undefined,
      disposition: disposition || undefined,
      page,
      limit,
    }),
    [search, status, disposition, page],
  );

  const { data: recipientsPage, isLoading, refetch: refetchRecipients } =
    useCampaignRecipients(campaign.id, recipientsQuery, {
      campaignStatus: campaign.status,
    });
  const { refetch: refetchCampaign } = useEmailCampaign(campaign.id);

  const refreshRecipients = async () => {
    await Promise.all([refetchRecipients(), refetchCampaign()]);
  };

  const { addRecipient, isAdding } = useAddCampaignRecipient({
    onSuccess: refreshRecipients,
  });

  const audienceListHref =
    campaign.audienceListId && campaign.audienceListType
      ? toOrgPath(
          getAudienceListPath(
            campaign.audienceListType,
            campaign.audienceListId,
          ),
        )
      : toOrgPath('/email/lists');

  const total = recipientsPage?.total ?? 0;

  if (!hasAudience) {
    return (
      <Box className="dashboard-panel flex min-h-[240px] flex-col items-center justify-center rounded-2xl p-6 text-center">
        <Typography variant="subtitle1" className="font-bold">
          No audience selected
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1 max-w-md">
          This campaign does not have an audience list yet. Add contacts during
          campaign setup before scheduling.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {campaign.audienceListType ? (
        <AudienceSummaryPanel
          audienceListType={campaign.audienceListType}
          listName={labels.audienceListName}
          recipientCount={campaign.audienceCount}
          audienceListHref={audienceListHref}
        />
      ) : null}

      <Box className="dashboard-panel rounded-2xl p-4 md:p-6">
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography variant="h6" className="font-bold">
              Recipient tracking
            </Typography>
            {canAddRecipient ? (
              <Button
                variant="contained"
                startIcon={<PersonAddOutlinedIcon />}
                onClick={() => setIsAddDialogOpen(true)}
                className="self-start rounded-xl sm:self-center"
              >
                Add person
              </Button>
            ) : null}
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' } }}
          >
            <TextField
              size="small"
              label="Search email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              fullWidth
              sx={{ flex: { md: 1 }, minWidth: 0 }}
            />
            <TextField
              select
              size="small"
              label="Engagement"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as CampaignRecipientEngagementStatus | '');
                setPage(1);
              }}
              sx={{
                width: { xs: '100%', md: 220 },
                flexShrink: 0,
              }}
            >
              <MenuItem value="">All engagement</MenuItem>
              {CAMPAIGN_RECIPIENT_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Disposition"
              value={disposition}
              onChange={(event) => {
                setDisposition(
                  event.target.value as CampaignRecipientDisposition | '',
                );
                setPage(1);
              }}
              sx={{
                width: { xs: '100%', md: 220 },
                flexShrink: 0,
              }}
            >
              <MenuItem value="">All dispositions</MenuItem>
              {CAMPAIGN_RECIPIENT_DISPOSITION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        <CampaignRecipientsTable
          recipients={recipientsPage?.items ?? []}
          isLoading={isLoading}
          onRowClick={setSelectedRecipient}
          campaignId={campaign.id}
          onActionSuccess={refreshRecipients}
        />

        {total > limit ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3, alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <Typography variant="body2" color="text.secondary">
              Page {page} of {Math.ceil(total / limit)}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={page * limit >= total}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl"
            >
              Next
            </Button>
          </Stack>
        ) : null}
      </Box>

      <RecipientDetailDrawer
        campaignId={campaign.id}
        recipient={selectedRecipient}
        open={Boolean(selectedRecipient)}
        onClose={() => setSelectedRecipient(null)}
        campaignStatus={campaign.status}
      />

      <AddCampaignRecipientDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        isSubmitting={isAdding}
        onSubmit={async (input) => {
          await addRecipient(campaign.id, input);
        }}
      />
    </Stack>
  );
}
