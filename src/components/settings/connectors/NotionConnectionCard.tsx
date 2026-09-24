'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FormAlert from '@/components/ui/FormAlert';
import {
  useConnectNotion,
  useDisconnectNotion,
  useNotionConnection,
} from '@/hooks/useNotionIntegration';

export default function NotionConnectionCard() {
  const { data, isLoading, refetch } = useNotionConnection();
  const connectMutation = useConnectNotion();
  const disconnectMutation = useDisconnectNotion();
  const [token, setToken] = useState('');
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const connected = Boolean(data?.connected);

  async function handleConnect() {
    setSuccessMessage(null);
    try {
      await connectMutation.mutate(token.trim());
      setToken('');
      setSuccessMessage('Notion is connected.');
      await refetch();
    } catch {
      // Mutation hook stores the error message.
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectMutation.mutate(undefined);
      setDisconnectOpen(false);
      setSuccessMessage('Notion was disconnected. Imported records stay in Markos.');
      await refetch();
    } catch {
      // Mutation hook stores the error message.
    }
  }

  return (
    <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
      <CardContent className="p-6 md:p-8">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" component="h2" className="font-bold">
              Notion
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Paste an internal integration token. Share each database with that
              integration in Notion before importing.
            </Typography>
          </Box>

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Checking connection…
            </Typography>
          ) : connected ? (
            <Box className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <Typography variant="body2" className="font-semibold">
                Connected
              </Typography>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setDisconnectOpen(true)}
              >
                Disconnect
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              <TextField
                type="password"
                label="Integration token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
                fullWidth
              />
              <Box>
                <Button
                  variant="contained"
                  disabled={!token.trim() || connectMutation.isLoading}
                  onClick={() => {
                    void handleConnect();
                  }}
                >
                  {connectMutation.isLoading ? 'Connecting…' : 'Connect Notion'}
                </Button>
              </Box>
            </Stack>
          )}

          {connectMutation.error ? (
            <FormAlert message={connectMutation.error} />
          ) : null}
          {disconnectMutation.error ? (
            <FormAlert message={disconnectMutation.error} />
          ) : null}
          {successMessage ? (
            <Typography variant="body2" className="text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>

      <ConfirmDialog
        open={disconnectOpen}
        title="Disconnect Notion?"
        description="The connection will be removed. Data already imported into Markos will stay."
        confirmLabel="Disconnect"
        variant="warning"
        isLoading={disconnectMutation.isLoading}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={() => {
          void handleDisconnect();
        }}
      />
    </Card>
  );
}
