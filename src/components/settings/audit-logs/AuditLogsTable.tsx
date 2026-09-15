'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import {
  AUDIT_LOG_ACTION_COLORS,
  AUDIT_LOG_ACTION_LABELS,
  AUDIT_LOG_HTTP_METHODS,
  AUDIT_LOG_MODULE_COLORS,
  AUDIT_LOG_MODULE_LABELS,
  formatAuditLogActor,
  formatAuditLogTimestamp,
} from '@/lib/audit-logs/labels';
import {
  AUDIT_LOG_ACTIONS,
  AUDIT_LOG_MODULES,
  type AuditLog,
  type AuditLogsQuery,
} from '@/lib/audit-logs/types';

interface AuditLogsTableProps {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  query: AuditLogsQuery;
  onQueryChange: (query: AuditLogsQuery) => void;
  showOrganizationFilter?: boolean;
  showActorFilter?: boolean;
}

function AuditLogDetailsRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton
            aria-label={open ? 'Hide details' : 'Show details'}
            size="small"
            onClick={() => setOpen((value) => !value)}
            sx={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {formatAuditLogTimestamp(log.createdAt)}
        </TableCell>
        <TableCell>
          <Stack spacing={0.25}>
            <Typography variant="body2" className="font-medium">
              {formatAuditLogActor(log.actorName, log.actorEmail)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {log.actorEmail}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={AUDIT_LOG_MODULE_LABELS[log.module]}
            color={AUDIT_LOG_MODULE_COLORS[log.module]}
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={AUDIT_LOG_ACTION_LABELS[log.action]}
            color={AUDIT_LOG_ACTION_COLORS[log.action]}
            variant="outlined"
            className="capitalize"
          />
        </TableCell>
        <TableCell sx={{ minWidth: 280 }}>
          <Typography variant="body2">{log.message}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, borderBottom: open ? undefined : 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className="px-4 py-3">
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                  {log.httpMethod} {log.requestPath} · HTTP {log.statusCode}
                  {log.metadata.durationMs !== undefined
                    ? ` · ${log.metadata.durationMs}ms`
                    : ''}
                </Typography>
                {log.resourceType ? (
                  <Typography variant="caption" color="text.secondary">
                    Resource: {log.resourceType}
                    {log.resourceId ? ` (${log.resourceId})` : ''}
                  </Typography>
                ) : null}
                {log.metadata.ip ? (
                  <Typography variant="caption" color="text.secondary">
                    IP: {log.metadata.ip}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AuditLogsTable({
  logs,
  total,
  page,
  limit,
  isLoading,
  error,
  query,
  onQueryChange,
  showOrganizationFilter = false,
  showActorFilter = true,
}: AuditLogsTableProps) {
  const { members } = useTeamMembers();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const actorOptions = useMemo(
    () =>
      members.map((member) => ({
        id: member.id,
        label: member.username?.trim() || member.email,
      })),
    [members],
  );

  function updateQuery(patch: Partial<AuditLogsQuery>) {
    onQueryChange({
      ...query,
      ...patch,
      page: patch.page ?? 1,
    });
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ alignItems: { lg: 'center' } }}
      >
        <TextField
          label="Search"
          value={query.search ?? ''}
          onChange={(event) => updateQuery({ search: event.target.value })}
          size="small"
          placeholder="Message, path, or actor"
          className="min-w-[220px] flex-1"
        />

        <FormControl size="small" className="min-w-[160px]">
          <InputLabel id="audit-log-module-filter">Module</InputLabel>
          <Select
            labelId="audit-log-module-filter"
            label="Module"
            value={query.module ?? ''}
            onChange={(event) =>
              updateQuery({
                module: event.target.value as AuditLogsQuery['module'],
              })
            }
          >
            <MenuItem value="">All modules</MenuItem>
            {AUDIT_LOG_MODULES.map((module) => (
              <MenuItem key={module} value={module}>
                {AUDIT_LOG_MODULE_LABELS[module]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className="min-w-[140px]">
          <InputLabel id="audit-log-action-filter">Action</InputLabel>
          <Select
            labelId="audit-log-action-filter"
            label="Action"
            value={query.action ?? ''}
            onChange={(event) =>
              updateQuery({
                action: event.target.value as AuditLogsQuery['action'],
              })
            }
          >
            <MenuItem value="">All actions</MenuItem>
            {AUDIT_LOG_ACTIONS.map((action) => (
              <MenuItem key={action} value={action}>
                {AUDIT_LOG_ACTION_LABELS[action]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className="min-w-[130px]">
          <InputLabel id="audit-log-method-filter">Method</InputLabel>
          <Select
            labelId="audit-log-method-filter"
            label="Method"
            value={query.httpMethod ?? ''}
            onChange={(event) =>
              updateQuery({ httpMethod: event.target.value || undefined })
            }
          >
            <MenuItem value="">All methods</MenuItem>
            {AUDIT_LOG_HTTP_METHODS.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {showActorFilter ? (
          <FormControl size="small" className="min-w-[180px]">
            <InputLabel id="audit-log-actor-filter">Actor</InputLabel>
            <Select
              labelId="audit-log-actor-filter"
              label="Actor"
              value={query.actorUserId ?? ''}
              onChange={(event) =>
                updateQuery({ actorUserId: event.target.value || undefined })
              }
            >
              <MenuItem value="">All actors</MenuItem>
              {actorOptions.map((actor) => (
                <MenuItem key={actor.id} value={actor.id}>
                  {actor.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="From"
          type="datetime-local"
          size="small"
          value={query.from ?? ''}
          onChange={(event) => updateQuery({ from: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          className="min-w-[220px]"
        />
        <TextField
          label="To"
          type="datetime-local"
          size="small"
          value={query.to ?? ''}
          onChange={(event) => updateQuery({ to: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          className="min-w-[220px]"
        />
        {showOrganizationFilter ? (
          <TextField
            label="Organization ID"
            size="small"
            value={query.organizationId ?? ''}
            onChange={(event) =>
              updateQuery({ organizationId: event.target.value || undefined })
            }
            placeholder="Filter by tenant organization ID"
            className="min-w-[280px] flex-1"
          />
        ) : null}
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box className="dashboard-panel surface-panel rounded-2xl shadow-none">
        {isLoading ? (
          <Box className="flex items-center justify-center px-6 py-16">
            <CircularProgress size={28} />
          </Box>
        ) : logs.length === 0 ? (
          <Box className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              No audit logs found
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Activity will appear here as team members use the workspace.
            </Typography>
          </Box>
        ) : (
          <TableContainer className="px-2 md:px-4">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Time</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <AuditLogDetailsRow key={log.id} log={log} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {total > limit ? (
        <Box className="flex justify-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_event, value) => updateQuery({ page: value })}
            color="primary"
          />
        </Box>
      ) : null}
    </Stack>
  );
}
