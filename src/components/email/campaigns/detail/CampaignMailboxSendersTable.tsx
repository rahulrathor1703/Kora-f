'use client';

import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CampaignMailboxSenderActions from '@/components/email/campaigns/detail/CampaignMailboxSenderActions';
import { getMailboxSenderStatusLabel } from '@/lib/email/campaigns/mailbox-sender-utils';
import type {
  EmailCampaign,
  EmailCampaignMailboxSender,
  PauseCampaignMailboxSenderInput,
  StopCampaignMailboxSenderInput,
} from '@/lib/email/campaigns/types';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

interface CampaignMailboxSendersTableProps {
  campaignId: string;
  campaignName: string;
  campaignStatus: EmailCampaign['status'];
  activeSenderCount: number;
  senders: EmailCampaignMailboxSender[];
  mailboxesById: Map<string, SenderMailbox>;
  isUpdating?: boolean;
  onEdit: (sender: EmailCampaignMailboxSender) => void;
  onPause: (
    campaignId: string,
    senderId: string,
    mailboxLabel: string,
    options?: PauseCampaignMailboxSenderInput,
  ) => void;
  onStop: (
    campaignId: string,
    senderId: string,
    mailboxLabel: string,
    options?: StopCampaignMailboxSenderInput,
  ) => void;
  onResume: (campaignId: string, senderId: string, mailboxLabel: string) => void;
}

function resolveMailboxLabel(
  sender: EmailCampaignMailboxSender,
  mailboxesById: Map<string, SenderMailbox>,
): string {
  const mailbox = mailboxesById.get(sender.mailboxId);
  return mailbox?.email ?? sender.senderEmail;
}

function statusChipColor(
  status: EmailCampaignMailboxSender['status'],
): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'active':
      return 'success';
    case 'paused':
      return 'warning';
    case 'stopped':
      return 'default';
  }
}

export default function CampaignMailboxSendersTable({
  campaignId,
  campaignName,
  campaignStatus,
  activeSenderCount,
  senders,
  mailboxesById,
  isUpdating = false,
  onEdit,
  onPause,
  onStop,
  onResume,
}: CampaignMailboxSendersTableProps) {
  if (senders.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No mailboxes assigned to this campaign yet.
      </Typography>
    );
  }

  return (
    <TableContainer className="rounded-2xl border border-surface-border">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Mailbox</TableCell>
            <TableCell>Sender</TableCell>
            <TableCell align="right">Quota/day</TableCell>
            <TableCell align="right">Sent today</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {senders.map((sender) => {
            const mailbox = mailboxesById.get(sender.mailboxId);
            const mailboxLabel = resolveMailboxLabel(sender, mailboxesById);
            const isStopped = sender.status === 'stopped';

            return (
              <TableRow
                key={sender.id}
                sx={{
                  opacity: isStopped ? 0.65 : 1,
                }}
              >
                <TableCell>
                  <Typography variant="body2" className="font-medium">
                    {mailbox?.displayName ?? 'Unknown mailbox'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mailboxLabel}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{sender.senderName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sender.senderEmail}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {sender.dailySendQuota?.toLocaleString() ?? '—'}
                </TableCell>
                <TableCell align="right">
                  {sender.sendsTodayCount?.toLocaleString() ?? '0'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getMailboxSenderStatusLabel(sender.status ?? 'active')}
                    size="small"
                    color={statusChipColor(sender.status ?? 'active')}
                    variant="outlined"
                    className="rounded-lg"
                  />
                </TableCell>
                <TableCell align="right">
                  <CampaignMailboxSenderActions
                    campaignId={campaignId}
                    campaignName={campaignName}
                    campaignStatus={campaignStatus}
                    activeSenderCount={activeSenderCount}
                    senderId={sender.id}
                    mailboxLabel={mailboxLabel}
                    status={sender.status ?? 'active'}
                    isUpdating={isUpdating}
                    onEdit={() => onEdit(sender)}
                    onPause={onPause}
                    onStop={onStop}
                    onResume={onResume}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
