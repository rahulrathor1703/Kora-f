'use client';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DataTable from '@/components/data-table/DataTable';
import { EMAIL_STATUS_LABELS } from '@/lib/email/lists/email-status-utils';
import type {
  ContactListFieldSchema,
  ContactListMember,
  ListEmailStatus,
} from '@/lib/email/lists/detail-types';

interface ContactListMemberRow extends Record<string, unknown> {
  id: string;
  email: string;
  emailStatus: ListEmailStatus;
}

function flattenMember(
  member: ContactListMember,
  fieldSchema: ContactListFieldSchema,
): ContactListMemberRow {
  const row: ContactListMemberRow = {
    id: member.id,
    email: member.email,
    emailStatus: member.emailStatus,
  };

  for (const field of fieldSchema.fields) {
    if (['firstName', 'lastName', 'company', 'phone'].includes(field.key)) {
      row[field.key] =
        (member[field.key as keyof ContactListMember] as string | null) ?? '';
    } else {
      row[field.key] = member.customFields[field.key] ?? '';
    }
  }

  return row;
}

interface ContactListMembersTableProps {
  members: ContactListMember[];
  fieldSchema: ContactListFieldSchema;
  isLoading: boolean;
  canDelete?: boolean;
  canPushToCampaigns?: boolean;
  onDeleteMember?: (member: ContactListMember) => void;
  onPushToCampaigns?: (member: ContactListMember) => void;
}

export default function ContactListMembersTable({
  members,
  fieldSchema,
  isLoading,
  canDelete = false,
  canPushToCampaigns = false,
  onDeleteMember,
  onPushToCampaigns,
}: ContactListMembersTableProps) {
  const rows = members.map((member) => flattenMember(member, fieldSchema));

  const excludeFields = ['id'];
  const columnOverrides: Record<
    string,
    { label: string; render?: (row: ContactListMemberRow) => React.ReactNode }
  > = {
    email: { label: fieldSchema.email.label },
    emailStatus: {
      label: 'Email status',
      render: (row) => (
        <Chip
          label={EMAIL_STATUS_LABELS[row.emailStatus]}
          size="small"
          className="rounded-lg"
        />
      ),
    },
  };

  for (const field of fieldSchema.fields) {
    columnOverrides[field.key] = { label: field.label };
  }

  return (
    <DataTable<ContactListMemberRow>
      tableId="contact-list-members"
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      excludeFields={excludeFields}
      columnOverrides={columnOverrides}
      emptyMessage="No contacts in this list yet"
      noResultsMessage="No contacts match your search or filters."
      enableSearch={false}
      enablePagination={false}
      persistPreferences={false}
      rowActions={
        (canPushToCampaigns && onPushToCampaigns) ||
        (canDelete && onDeleteMember)
          ? (row) => {
              const member = members.find((item) => item.id === row.id);
              if (!member) {
                return null;
              }

              return (
                <>
                  {canPushToCampaigns && onPushToCampaigns ? (
                    <Tooltip title="Add to campaigns">
                      <IconButton
                        size="small"
                        aria-label={`Add ${member.email} to campaigns`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPushToCampaigns(member);
                        }}
                      >
                        <CampaignOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {canDelete && onDeleteMember ? (
                    <Tooltip title="Remove from list">
                      <IconButton
                        size="small"
                        aria-label={`Remove ${member.email} from list`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteMember(member);
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </>
              );
            }
          : undefined
      }
    />
  );
}
