'use client';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { type CSSProperties } from 'react';
import { dataTableClassNames, dataTableSx } from '@/components/data-table/dataTableStyles';
import MailboxDeliverabilityBadge from '@/components/email/mailboxes/MailboxDeliverabilityBadge';
import MailboxProviderLogo from '@/components/email/mailboxes/MailboxProviderLogo';
import MailboxSpamRateDisplay from '@/components/email/mailboxes/MailboxSpamRateDisplay';
import MailboxTestConnectionButton from '@/components/email/mailboxes/MailboxTestConnectionButton';
import { deliverabilityItems } from '@/lib/email/mailbox-deliverability-config';
import { getMailboxDeliverability } from '@/lib/email/mailbox-deliverability';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

interface MailboxTableProps {
  mailboxes: SenderMailbox[];
  onViewDetails: (mailbox: SenderMailbox) => void;
  onTestConnection?: (mailbox: SenderMailbox) => void;
  canTestConnection?: boolean;
  isTestConnectionPassed?: (mailbox: SenderMailbox) => boolean;
  selectMode?: boolean;
  selectedMailboxIds?: ReadonlySet<string>;
  onToggleSelect?: (mailbox: SenderMailbox) => void;
}

interface MailboxTableRowProps {
  mailbox: SenderMailbox;
  onViewDetails: (mailbox: SenderMailbox) => void;
  onTestConnection?: (mailbox: SenderMailbox) => void;
  canTestConnection?: boolean;
  isTestConnectionPassed?: (mailbox: SenderMailbox) => boolean;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (mailbox: SenderMailbox) => void;
}

function MailboxTableRow({
  mailbox,
  onViewDetails,
  onTestConnection,
  canTestConnection = false,
  isTestConnectionPassed,
  selectMode = false,
  isSelected = false,
  onToggleSelect,
}: MailboxTableRowProps) {
  const deliverability = getMailboxDeliverability(mailbox);
  const deliverabilityChecks = {
    spf: deliverability.spfEnabled,
    dkim: deliverability.dkimEnabled,
    dmarc: deliverability.dmarcEnabled,
  };
  const isInactive = mailbox.status === 'inactive';
  const testPassed = isTestConnectionPassed?.(mailbox) ?? false;

  function handleRowClick() {
    if (selectMode) {
      onToggleSelect?.(mailbox);
      return;
    }

    onViewDetails(mailbox);
  }

  return (
    <TableRow
      className={[
        'mailbox-table-row',
        selectMode ? 'mailbox-table-row-select-mode' : 'cursor-pointer',
        isSelected ? 'mailbox-table-row-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      sx={{
        opacity: isInactive ? 0.65 : 1,
      }}
      hover
      onClick={handleRowClick}
      aria-selected={selectMode ? isSelected : undefined}
    >
      {selectMode ? (
        <TableCell
          sx={dataTableSx.bodyCell}
          className="mailbox-table-cell-center"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect?.(mailbox)}
            size="small"
            slotProps={{ input: { 'aria-label': `Select ${mailbox.email}` } }}
          />
        </TableCell>
      ) : null}
      <TableCell sx={dataTableSx.bodyCell} className="mailbox-table-cell-center">
        <Box className="mailbox-card-logo mx-auto">
          <MailboxProviderLogo provider={mailbox.provider} className="h-4 w-4" />
        </Box>
      </TableCell>
      <TableCell sx={dataTableSx.bodyCell} className="mailbox-table-cell-text">
        <Typography variant="body2" className="truncate font-medium">
          {mailbox.displayName}
        </Typography>
      </TableCell>
      <TableCell sx={dataTableSx.bodyCell} className="mailbox-table-cell-text">
        <Typography variant="body2" color="text.secondary" className="truncate">
          {mailbox.email}
        </Typography>
      </TableCell>
      {deliverabilityItems.map((item) => (
        <TableCell
          key={item.key}
          sx={dataTableSx.bodyCell}
          className="mailbox-table-cell-center"
        >
          <MailboxDeliverabilityBadge
            item={item}
            enabled={deliverabilityChecks[item.key]}
            compact
          />
        </TableCell>
      ))}
      <TableCell sx={dataTableSx.bodyCell} className="mailbox-table-cell-center">
        <MailboxSpamRateDisplay
          score={deliverability.spamScore}
          variant="compact"
        />
      </TableCell>
      {canTestConnection && !selectMode ? (
        <TableCell
          sx={dataTableSx.bodyCell}
          className="mailbox-table-cell-action"
          onClick={(event) => event.stopPropagation()}
        >
          <MailboxTestConnectionButton
            passed={testPassed}
            fullWidth
            onClick={() => onTestConnection?.(mailbox)}
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
}

export default function MailboxTable({
  mailboxes,
  onViewDetails,
  onTestConnection,
  canTestConnection = false,
  isTestConnectionPassed,
  selectMode = false,
  selectedMailboxIds,
  onToggleSelect,
}: MailboxTableProps) {
  const hasActionsColumn = canTestConnection && !selectMode;
  const columnCount = 7 + (selectMode ? 1 : 0) + (hasActionsColumn ? 1 : 0);
  const tableStyle = {
    '--mailbox-table-columns': columnCount,
  } as CSSProperties;

  return (
    <TableContainer className="rounded-2xl border border-surface-border">
      <Table size="small" className="mailbox-table" style={tableStyle}>
        <TableHead className={`${dataTableClassNames.headSticky} mailbox-table-head`}>
          <TableRow>
            {selectMode ? (
              <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center" />
            ) : null}
            <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center" />
            <TableCell sx={dataTableSx.headCell}>Name</TableCell>
            <TableCell sx={dataTableSx.headCell}>Email</TableCell>
            <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center">
              SPF
            </TableCell>
            <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center">
              DKIM
            </TableCell>
            <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center">
              DMARC
            </TableCell>
            <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center">
              Spam rate
            </TableCell>
            {hasActionsColumn ? (
              <TableCell sx={dataTableSx.headCell} className="mailbox-table-cell-center">
                Actions
              </TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {mailboxes.map((mailbox) => (
            <MailboxTableRow
              key={mailbox.id}
              mailbox={mailbox}
              onViewDetails={onViewDetails}
              onTestConnection={onTestConnection}
              canTestConnection={canTestConnection}
              isTestConnectionPassed={isTestConnectionPassed}
              selectMode={selectMode}
              isSelected={selectedMailboxIds?.has(mailbox.id) ?? false}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
