'use client';

import AddIcon from '@mui/icons-material/Add';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { dataTableClassNames, dataTableSx } from '@/components/data-table/dataTableStyles';
import AddMailboxDialog from '@/components/email/mailboxes/AddMailboxDialog';
import FixSpamRatingPricingDialog, {
  type FixSpamRatingMailboxSummary,
} from '@/components/email/mailboxes/FixSpamRatingPricingDialog';
import MailboxCard from '@/components/email/mailboxes/MailboxCard';
import MailboxFixSpamRatingSelectBar from '@/components/email/mailboxes/MailboxFixSpamRatingSelectBar';
import MailboxTable from '@/components/email/mailboxes/MailboxTable';
import MailboxViewToggle from '@/components/email/mailboxes/MailboxViewToggle';
import TestMailboxConnectionDialog from '@/components/email/mailboxes/TestMailboxConnectionDialog';
import EmailHubShell from '@/components/email/EmailHubShell';
import { useMailboxes } from '@/hooks/useMailboxes';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api/client';
import { mailboxService } from '@/lib/api';
import { getMailboxErrorMessage } from '@/lib/email/mailbox-error-messages';
import type { OAuthPrefill, SenderMailbox } from '@/lib/email/mailbox-types';
import {
  DEFAULT_MAILBOX_DAILY_SEND_LIMIT,
  deriveMailboxIdentityFromEmail,
} from '@/lib/email/mailbox-form-defaults';
import {
  MAILBOX_VIEW_MODE_STORAGE_KEY,
  readStoredMailboxViewMode,
  type MailboxViewMode,
} from '@/lib/email/mailbox-view-mode';
import {
  isMailboxTestConnectionPassed,
  markMailboxTestConnectionPassed,
  readMailboxTestConnectionSnapshots,
  writeMailboxTestConnectionSnapshots,
  type MailboxTestConnectionSnapshots,
} from '@/lib/email/mailbox-test-connection-state';

interface OAuthCallbackState {
  prefill: OAuthPrefill | null;
  errorMessage: string | null;
  successMessage: string | null;
}

function parseOAuthCallback(): OAuthCallbackState {
  if (typeof window === 'undefined') {
    return { prefill: null, errorMessage: null, successMessage: null };
  }

  const params = new URLSearchParams(window.location.search);
  const oauth = params.get('oauth');

  if (!oauth) {
    return { prefill: null, errorMessage: null, successMessage: null };
  }

  if (oauth === 'error') {
    return {
      prefill: null,
      errorMessage: getMailboxErrorMessage(
        params.get('message') ?? '',
        'Could not connect your email account. Try again.',
      ),
      successMessage: null,
    };
  }

  if (oauth === 'success') {
    const provider = params.get('provider');
    const email = params.get('email');
    const oauthToken = params.get('oauthToken');

    if (
      (provider === 'gmail' || provider === 'outlook') &&
      email &&
      oauthToken
    ) {
      return {
        prefill: { provider, email, oauthToken },
        errorMessage: null,
        successMessage:
          provider === 'gmail'
            ? 'Google account connected. Adding your mailbox…'
            : 'Microsoft account connected. Adding your mailbox…',
      };
    }
  }

  return { prefill: null, errorMessage: null, successMessage: null };
}

interface MailboxesContentProps {
  initialFixSpamSelectMode?: boolean;
}

export default function MailboxesContent({
  initialFixSpamSelectMode = false,
}: MailboxesContentProps) {
  const {
    mailboxes,
    isLoading,
    isSaving,
    error,
    createMailbox,
  } = useMailboxes();
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canManageMailbox = useHasPermission('mailboxes:update');
  const shownFetchErrorRef = useRef<string | null>(null);
  const oauthCreateAttemptedRef = useRef(false);
  const [oauthCallback] = useState(() => parseOAuthCallback());

  const [addOpen, setAddOpen] = useState(() => Boolean(oauthCallback.prefill));
  const [oauthPrefill, setOauthPrefill] = useState<OAuthPrefill | null>(
    () => oauthCallback.prefill,
  );
  const [viewMode, setViewMode] = useState<MailboxViewMode>(() =>
    readStoredMailboxViewMode(),
  );
  const [isFixSpamRatingSelectMode, setIsFixSpamRatingSelectMode] = useState(
    initialFixSpamSelectMode,
  );
  const [selectedMailboxIds, setSelectedMailboxIds] = useState<Set<string>>(() => new Set());
  const [fixSpamRatingMailboxes, setFixSpamRatingMailboxes] =
    useState<FixSpamRatingMailboxSummary[] | null>(null);
  const [testMailbox, setTestMailbox] = useState<SenderMailbox | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testConnectionSnapshots, setTestConnectionSnapshots] =
    useState<MailboxTestConnectionSnapshots>(() => readMailboxTestConnectionSnapshots());

  useEffect(() => {
    if (!error || error === shownFetchErrorRef.current) {
      return;
    }

    shownFetchErrorRef.current = error;
    notifyError(getMailboxErrorMessage(error, 'Could not load mailboxes.'));
  }, [error, notifyError]);

  useEffect(() => {
    if (
      !oauthCallback.errorMessage &&
      !oauthCallback.successMessage &&
      !window.location.search.includes('oauth=')
    ) {
      return;
    }

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, '', cleanUrl);

    if (oauthCallback.errorMessage) {
      notifyError(oauthCallback.errorMessage);
    }

    if (oauthCallback.successMessage) {
      notifySuccess(oauthCallback.successMessage);
    }
  }, [oauthCallback, notifyError, notifySuccess]);

  useEffect(() => {
    window.localStorage.setItem(MAILBOX_VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const prefill = oauthCallback.prefill;

    if (!prefill || oauthCreateAttemptedRef.current || isLoading) {
      return;
    }

    oauthCreateAttemptedRef.current = true;
    const identity = deriveMailboxIdentityFromEmail(prefill.email);

    void handleCreate({
      provider: prefill.provider,
      email: prefill.email,
      oauthToken: prefill.oauthToken,
      displayName: identity.displayName,
      fromName: identity.fromName,
      dailySendLimit: DEFAULT_MAILBOX_DAILY_SEND_LIMIT,
      warmupEnabled: false,
    })
      .then(() => {
        setAddOpen(false);
        setOauthPrefill(null);
      })
      .catch(() => {
        oauthCreateAttemptedRef.current = false;
        setAddOpen(true);
        setOauthPrefill(prefill);
      });
    // handleCreate is stable enough for this one-shot OAuth callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when OAuth prefill is available
  }, [oauthCallback.prefill, isLoading]);

  async function handleCreate(input: Parameters<typeof createMailbox>[0]) {
    try {
      await createMailbox(input);
      notifySuccess('Mailbox added successfully.');
    } catch (err) {
      const message = getMailboxErrorMessage(
        getApiErrorMessage(err, 'Failed to create mailbox'),
        'Failed to create mailbox',
      );
      notifyError(message);
      throw err;
    }
  }

  function handleViewDetails(mailbox: SenderMailbox) {
    router.push(toOrgPath(`/email/mailboxes/${mailbox.id}`));
  }

  function isTestConnectionPassed(mailbox: SenderMailbox): boolean {
    return isMailboxTestConnectionPassed(mailbox, testConnectionSnapshots);
  }

  function handleStartFixSpamRatingSelect() {
    setIsFixSpamRatingSelectMode(true);
    setSelectedMailboxIds(new Set());
  }

  function handleCancelFixSpamRatingSelect() {
    setIsFixSpamRatingSelectMode(false);
    setSelectedMailboxIds(new Set());
  }

  function handleToggleMailboxSelect(mailbox: SenderMailbox) {
    setSelectedMailboxIds((current) => {
      const next = new Set(current);

      if (next.has(mailbox.id)) {
        next.delete(mailbox.id);
      } else {
        next.add(mailbox.id);
      }

      return next;
    });
  }

  function handleContinueFixSpamRatingSelect() {
    const selected = mailboxes.filter((mailbox) => selectedMailboxIds.has(mailbox.id));

    if (selected.length === 0) {
      return;
    }

    setFixSpamRatingMailboxes(
      selected.map((mailbox) => ({
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.displayName,
      })),
    );
    setIsFixSpamRatingSelectMode(false);
    setSelectedMailboxIds(new Set());
  }

  function handleCloseFixSpamRatingPricing() {
    setFixSpamRatingMailboxes(null);
  }

  function handleTestConnection(mailbox: SenderMailbox) {
    if (isTestConnectionPassed(mailbox)) {
      return;
    }

    setTestMailbox(mailbox);
  }

  function handleMarkTestConnectionPassed(mailbox: SenderMailbox) {
    const nextSnapshots = markMailboxTestConnectionPassed(mailbox, testConnectionSnapshots);
    setTestConnectionSnapshots(nextSnapshots);
    writeMailboxTestConnectionSnapshots(nextSnapshots);
  }

  async function handleSendTestEmail(to: string) {
    if (!testMailbox) {
      return;
    }

    setIsSendingTest(true);

    try {
      await mailboxService.sendTestEmail(testMailbox.id, to);
      handleMarkTestConnectionPassed(testMailbox);
      notifySuccess(`Test email sent to ${to}.`);
      setTestMailbox(null);
    } catch (err) {
      notifyError(
        getMailboxErrorMessage(
          getApiErrorMessage(err, 'Failed to send test email'),
          'Failed to send test email',
        ),
      );
    } finally {
      setIsSendingTest(false);
    }
  }

  return (
    <EmailHubShell
      actions={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }} className="shrink-0">
          <MailboxViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {canManageMailbox && mailboxes.length > 0 ? (
            <Button
              variant={isFixSpamRatingSelectMode ? 'contained' : 'outlined'}
              startIcon={<AutoFixHighOutlinedIcon />}
              onClick={() => {
                if (isFixSpamRatingSelectMode) {
                  handleCancelFixSpamRatingSelect();
                } else {
                  handleStartFixSpamRatingSelect();
                }
              }}
              className="rounded-2xl px-4 py-2.5 normal-case"
              sx={
                isFixSpamRatingSelectMode
                  ? undefined
                  : { color: 'text.primary', borderColor: 'divider' }
              }
            >
              Fix spam rating
            </Button>
          ) : null}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            className="rounded-2xl px-5 py-2.5 shadow-primary-soft"
          >
            Add Mailbox
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
      {isFixSpamRatingSelectMode && !isLoading && mailboxes.length > 0 ? (
        <MailboxFixSpamRatingSelectBar
          selectedCount={selectedMailboxIds.size}
          onCancel={handleCancelFixSpamRatingSelect}
          onContinue={handleContinueFixSpamRatingSelect}
        />
      ) : null}

      {isLoading ? (
        viewMode === 'table' ? (
          <TableContainer className="rounded-2xl border border-surface-border">
            <Table size="small">
              <TableHead className={`${dataTableClassNames.headSticky} mailbox-table-head`}>
                <TableRow>
                  <TableCell sx={dataTableSx.headCell} className="w-14" />
                  <TableCell sx={dataTableSx.headCell}>Name</TableCell>
                  <TableCell sx={dataTableSx.headCell}>Email</TableCell>
                  <TableCell sx={dataTableSx.headCell} align="center">
                    SPF
                  </TableCell>
                  <TableCell sx={dataTableSx.headCell} align="center">
                    DKIM
                  </TableCell>
                  <TableCell sx={dataTableSx.headCell} align="center">
                    DMARC
                  </TableCell>
                  <TableCell sx={dataTableSx.headCell}>Spam rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell sx={dataTableSx.bodyCell}>
                      <Skeleton variant="rounded" width={36} height={36} />
                    </TableCell>
                    <TableCell sx={dataTableSx.bodyCell}>
                      <Skeleton variant="text" width="60%" />
                    </TableCell>
                    <TableCell sx={dataTableSx.bodyCell}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                    <TableCell sx={dataTableSx.bodyCell} align="center">
                      <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell sx={dataTableSx.bodyCell} align="center">
                      <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell sx={dataTableSx.bodyCell} align="center">
                      <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell sx={dataTableSx.bodyCell}>
                      <Skeleton variant="text" width="50%" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={2.5}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                <Skeleton variant="rounded" height={148} className="rounded-xl" />
              </Grid>
            ))}
          </Grid>
        )
      ) : mailboxes.length === 0 ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <Box className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <MailOutlineOutlinedIcon />
            </Box>
            <Typography variant="h6" className="font-bold">
              No mailboxes yet
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2 max-w-sm">
              Add your first sender account to start sending outreach campaigns.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
              className="mt-5 rounded-2xl px-5 shadow-primary-soft"
            >
              Add Mailbox
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <MailboxTable
          mailboxes={mailboxes}
          onViewDetails={handleViewDetails}
          onTestConnection={handleTestConnection}
          canTestConnection={canManageMailbox}
          isTestConnectionPassed={isTestConnectionPassed}
          selectMode={isFixSpamRatingSelectMode}
          selectedMailboxIds={selectedMailboxIds}
          onToggleSelect={handleToggleMailboxSelect}
        />
      ) : (
        <Grid container spacing={2.5}>
          {mailboxes.map((mailbox) => (
            <Grid key={mailbox.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
              <MailboxCard
                mailbox={mailbox}
                onViewDetails={handleViewDetails}
                onTestConnection={handleTestConnection}
                canTestConnection={canManageMailbox}
                isTestConnectionPassed={isTestConnectionPassed}
                selectMode={isFixSpamRatingSelectMode}
                isSelected={selectedMailboxIds.has(mailbox.id)}
                onToggleSelect={handleToggleMailboxSelect}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddMailboxDialog
        open={addOpen}
        isSaving={isSaving}
        oauthPrefill={oauthPrefill}
        onClose={() => {
          setAddOpen(false);
          setOauthPrefill(null);
        }}
        onCreate={handleCreate}
      />

      <FixSpamRatingPricingDialog
        mailboxes={fixSpamRatingMailboxes}
        onClose={handleCloseFixSpamRatingPricing}
      />

      <TestMailboxConnectionDialog
        mailbox={testMailbox}
        isSending={isSendingTest}
        onClose={() => setTestMailbox(null)}
        onSend={handleSendTestEmail}
      />
      </Stack>
    </EmailHubShell>
  );
}
