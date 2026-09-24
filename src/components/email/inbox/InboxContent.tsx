'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import InboxRepliesTable from '@/components/email/inbox/InboxRepliesTable';
import InboxReplyDetailDrawer from '@/components/email/inbox/InboxReplyDetailDrawer';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useInboxReplies } from '@/hooks/useInboxReplies';
import type { EmailCampaignReplyCategory } from '@/lib/email/campaigns/reply-category-utils';
import { REPLY_CATEGORY_OPTIONS } from '@/lib/email/campaigns/reply-category-utils';
import type { InboxReply } from '@/lib/email/inbox/inbox-types';

export default function InboxContent() {
  const { campaigns } = useEmailCampaigns();
  const [search, setSearch] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [replyCategory, setReplyCategory] = useState<
    EmailCampaignReplyCategory | ''
  >('');
  const [page, setPage] = useState(1);
  const [selectedReply, setSelectedReply] = useState<InboxReply | null>(null);
  const limit = 25;

  const repliesQuery = useMemo(
    () => ({
      search,
      campaignId: campaignId || undefined,
      replyCategory: replyCategory || undefined,
      page,
      limit,
    }),
    [search, campaignId, replyCategory, page],
  );

  const { data: repliesPage, isLoading, error } = useInboxReplies(repliesQuery);
  const total = repliesPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Stack spacing={2.5}>
      <Box className="dashboard-panel rounded-2xl p-4 md:p-6">
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h6" className="font-bold">
                Campaign replies
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Replies detected from your campaign mailboxes across all campaigns.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                label="Search replies"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="min-w-[220px]"
              />
              <FormControl size="small" className="min-w-[200px]">
                <InputLabel id="inbox-campaign-filter">Campaign</InputLabel>
                <Select
                  labelId="inbox-campaign-filter"
                  label="Campaign"
                  value={campaignId}
                  onChange={(event) => {
                    setCampaignId(event.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All campaigns</MenuItem>
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="All categories"
              color={replyCategory === '' ? 'primary' : 'default'}
              variant={replyCategory === '' ? 'filled' : 'outlined'}
              onClick={() => {
                setReplyCategory('');
                setPage(1);
              }}
              className="rounded-lg"
            />
            {REPLY_CATEGORY_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                color={replyCategory === option.value ? 'primary' : 'default'}
                variant={replyCategory === option.value ? 'filled' : 'outlined'}
                onClick={() => {
                  setReplyCategory(option.value);
                  setPage(1);
                }}
                className="rounded-lg"
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box className="dashboard-panel rounded-2xl p-4 md:p-6">
        {error ? (
          <Alert severity="error" className="mb-4 rounded-2xl">
            Could not load replies. Please refresh and try again.
          </Alert>
        ) : null}

        <InboxRepliesTable
          replies={repliesPage?.items ?? []}
          isLoading={isLoading}
          onRowClick={setSelectedReply}
        />

        {total > limit ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3, alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <Typography variant="body2" color="text.secondary">
              Page {page} of {totalPages}
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
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl"
            >
              Next
            </Button>
          </Stack>
        ) : null}
      </Box>

      <InboxReplyDetailDrawer
        reply={selectedReply}
        open={Boolean(selectedReply)}
        onClose={() => setSelectedReply(null)}
      />
    </Stack>
  );
}
