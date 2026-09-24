'use client';

import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import { dataTableClassNames, dataTableSx } from '@/components/data-table/dataTableStyles';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { MailboxCampaignsResponse } from '@/lib/email/mailbox-types';

interface CampaignsTabProps {
  campaignsData: MailboxCampaignsResponse | null;
  isLoading: boolean;
}

const senderStatusColor: Record<
  MailboxCampaignsResponse['campaigns'][number]['sender']['status'],
  'success' | 'warning' | 'default'
> = {
  active: 'success',
  paused: 'warning',
  stopped: 'default',
};

function formatCampaignStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

export default function CampaignsTab({ campaignsData, isLoading }: CampaignsTabProps) {
  const toOrgPath = useOrgPath();

  if (isLoading || !campaignsData) {
    return (
      <Card className="dashboard-panel rounded-[24px] shadow-none">
        <CardContent className="p-5">
          <Stack spacing={1.5}>
            <Skeleton width="40%" height={28} />
            <Skeleton width="100%" height={48} className="rounded-xl" />
            <Skeleton width="100%" height={48} className="rounded-xl" />
            <Skeleton width="100%" height={48} className="rounded-xl" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { campaigns, activeLock } = campaignsData;

  if (campaigns.length === 0) {
    return (
      <Card className="dashboard-panel rounded-[24px] shadow-none">
        <CardContent className="px-6 py-14">
          <Stack spacing={2} sx={{ alignItems: 'center' }} className="w-full text-center">
            <Typography variant="body2" color="text.secondary" className="text-[14px] font-bold">
              Not assigned to any campaigns yet
            </Typography>
            <Box className="flex w-full justify-center">
              <Button
                component={NextLink}
                href={toOrgPath('/email/campaigns')}
                variant="contained"
                endIcon={<ArrowForwardOutlinedIcon />}
                className="w-fit rounded-2xl normal-case shadow-none"
              >
                View campaigns
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {activeLock ? (
        <Box className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <LockOutlinedIcon className="text-amber-600 dark:text-amber-400" fontSize="small" />
            <Typography variant="body2" className="text-amber-900 dark:text-amber-100">
              This mailbox is currently locked and sending through{' '}
              <Link
                component={NextLink}
                href={toOrgPath(`/email/campaigns/${activeLock.campaignId}`)}
                underline="hover"
                className="font-semibold"
              >
                {activeLock.campaignName}
              </Link>
              .
            </Typography>
          </Stack>
        </Box>
      ) : null}

      <TableContainer className="rounded-2xl border border-surface-border">
        <Table size="small">
          <TableHead className={`${dataTableClassNames.headSticky} mailbox-table-head`}>
            <TableRow>
              <TableCell sx={dataTableSx.headCell}>Campaign</TableCell>
              <TableCell sx={dataTableSx.headCell}>Campaign status</TableCell>
              <TableCell sx={dataTableSx.headCell}>Sender status</TableCell>
              <TableCell sx={dataTableSx.headCell}>Daily quota</TableCell>
              <TableCell sx={dataTableSx.headCell}>Sends today</TableCell>
              <TableCell align="right" sx={dataTableSx.actionsHeadCell}>
                Lock
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((assignment) => (
              <TableRow key={assignment.sender.id} className="mailbox-table-row">
                <TableCell sx={dataTableSx.bodyCell}>
                  <Link
                    component={NextLink}
                    href={toOrgPath(`/email/campaigns/${assignment.campaignId}`)}
                    underline="hover"
                    className="font-medium"
                  >
                    {assignment.campaignName}
                  </Link>
                </TableCell>
                <TableCell sx={dataTableSx.bodyCell}>
                  <Chip
                    label={formatCampaignStatus(assignment.campaignStatus)}
                    size="small"
                    variant="outlined"
                    className="rounded-lg capitalize"
                  />
                </TableCell>
                <TableCell sx={dataTableSx.bodyCell}>
                  <Chip
                    label={assignment.sender.status}
                    size="small"
                    color={senderStatusColor[assignment.sender.status]}
                    className="rounded-lg capitalize"
                  />
                </TableCell>
                <TableCell sx={dataTableSx.bodyCell}>
                  {assignment.sender.dailySendQuota ?? '—'}
                </TableCell>
                <TableCell sx={dataTableSx.bodyCell}>
                  {assignment.sender.sendsTodayCount}
                </TableCell>
                <TableCell align="right" sx={dataTableSx.actionsCell}>
                  {assignment.isLocking ? (
                    <Chip
                      icon={<LockOutlinedIcon />}
                      label="Locking"
                      size="small"
                      color="warning"
                      className="rounded-lg"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
