'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormAlert from '@/components/ui/FormAlert';
import NotionColumnToggleList from '@/components/settings/connectors/NotionColumnToggleList';
import {
  useImportFromNotion,
  useNotionColumns,
  useNotionDatabases,
} from '@/hooks/useNotionIntegration';
import type { CrmImportResult } from '@/lib/crm/import/types';
import type { NotionImportDestination } from '@/lib/api/services/notion-integrations.service';

const DESTINATIONS: Array<{ value: NotionImportDestination; label: string }> = [
  { value: 'company', label: 'Companies' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'contact-list', label: 'Contact list' },
];

export default function NotionImportWizard() {
  const databasesQuery = useNotionDatabases(true);
  const importMutation = useImportFromNotion();
  const [databaseId, setDatabaseId] = useState('');
  const [destination, setDestination] = useState<NotionImportDestination | ''>(
    '',
  );
  const [excludedPropertyIds, setExcludedPropertyIds] = useState<string[] | null>(
    null,
  );
  const [contactListName, setContactListName] = useState('');
  const [importResult, setImportResult] = useState<CrmImportResult | null>(null);

  const columnsQuery = useNotionColumns(
    databaseId,
    destination,
    databaseId.length > 0 && destination.length > 0,
  );

  const columns = columnsQuery.data?.columns ?? [];
  const defaultExcludedPropertyIds = columns
    .filter(
      (column) =>
        column.status === 'unsupported' || column.status === 'skipped',
    )
    .map((column) => column.propertyId);
  const resolvedExcludedPropertyIds =
    excludedPropertyIds ?? defaultExcludedPropertyIds;

  function handleDatabaseChange(nextDatabaseId: string) {
    setDatabaseId(nextDatabaseId);
    setExcludedPropertyIds(null);
    setImportResult(null);
  }

  function handleDestinationChange(nextDestination: NotionImportDestination | '') {
    setDestination(nextDestination);
    setExcludedPropertyIds(null);
    setImportResult(null);
  }

  function toggleColumn(propertyId: string) {
    const column = columns.find((entry) => entry.propertyId === propertyId);
    if (!column || column.status === 'unsupported') {
      return;
    }

    setExcludedPropertyIds((current) => {
      const active = current ?? defaultExcludedPropertyIds;
      return active.includes(propertyId)
        ? active.filter((id) => id !== propertyId)
        : [...active, propertyId];
    });
  }

  const missingRequired = (columnsQuery.data?.missingRequiredLabels ?? []).filter(
    (label) => {
      const column = columns.find(
        (entry) =>
          entry.status === 'mapped' &&
          entry.targetLabel === label &&
          !resolvedExcludedPropertyIds.includes(entry.propertyId),
      );
      return !column;
    },
  );

  const canImport =
    databaseId.length > 0 &&
    destination.length > 0 &&
    missingRequired.length === 0 &&
    (destination !== 'contact-list' || contactListName.trim().length > 0);

  async function handleImport() {
    if (!destination) {
      return;
    }

    const result = await importMutation.mutate({
      databaseId,
      destination,
      excludedPropertyIds: resolvedExcludedPropertyIds,
      contactListName:
        destination === 'contact-list' ? contactListName.trim() : undefined,
    });
    setImportResult(result);
  }

  return (
    <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
      <CardContent className="p-6 md:p-8">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" component="h2" className="font-bold">
              Import from Notion
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Choose a database and destination. Green columns import. Click the
              icon to skip a column.
            </Typography>
          </Box>

          {databasesQuery.error ? (
            <FormAlert message={databasesQuery.error} />
          ) : null}

          <TextField
            select
            label="Notion database"
            value={databaseId}
            onChange={(event) => handleDatabaseChange(event.target.value)}
            fullWidth
          >
            <MenuItem value="">
              <Typography color="text.secondary">Select a database</Typography>
            </MenuItem>
            {(databasesQuery.data ?? []).map((database) => (
              <MenuItem key={database.id} value={database.id}>
                {database.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Import into"
            value={destination}
            onChange={(event) =>
              handleDestinationChange(
                event.target.value as NotionImportDestination | '',
              )
            }
            fullWidth
          >
            <MenuItem value="">
              <Typography color="text.secondary">Select destination</Typography>
            </MenuItem>
            {DESTINATIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {destination === 'contact-list' ? (
            <TextField
              label="New contact list name"
              value={contactListName}
              onChange={(event) => setContactListName(event.target.value)}
              fullWidth
            />
          ) : null}

          {columnsQuery.isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading Notion columns…
            </Typography>
          ) : null}

          {columnsQuery.error ? <FormAlert message={columnsQuery.error} /> : null}

          {columns.length > 0 ? (
            <NotionColumnToggleList
              columns={columns}
              excludedPropertyIds={resolvedExcludedPropertyIds}
              onToggle={toggleColumn}
            />
          ) : null}

          {missingRequired.length > 0 ? (
            <FormAlert
              message={`Keep these required fields green: ${missingRequired.join(', ')}`}
            />
          ) : null}

          {importMutation.error ? (
            <FormAlert message={importMutation.error} />
          ) : null}

          {importResult ? (
            <Typography variant="body2" className="text-emerald-700 dark:text-emerald-300">
              Imported {importResult.created.toLocaleString()} records
              {importResult.skipped
                ? `, skipped ${importResult.skipped.toLocaleString()}`
                : ''}
              {importResult.failed
                ? `, failed ${importResult.failed.toLocaleString()}`
                : ''}
              .
            </Typography>
          ) : null}

          <Box>
            <Button
              variant="contained"
              disabled={!canImport || importMutation.isLoading}
              onClick={() => {
                void handleImport();
              }}
            >
              {importMutation.isLoading ? 'Importing…' : 'Import'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
