'use client';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { useEmailAttachmentStaging } from '@/components/email/campaigns/create/sequence/EmailAttachmentStagingContext';
import { useApiQuery } from '@/hooks/api/useApiQuery';
import { emailAttachmentService } from '@/lib/api/services/email-attachment.service';
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  formatAttachmentSize,
  isAllowedAttachmentFile,
  MAX_ATTACHMENTS_PER_STEP,
  type EmailStepAttachment,
} from '@/lib/email/campaigns/attachment-types';

interface EmailStepAttachmentsProps {
  ownerType: 'campaign' | 'template';
  ownerId?: string;
  stepOrder: number;
  disabled?: boolean;
}

export default function EmailStepAttachments({
  ownerType,
  ownerId,
  stepOrder,
  disabled = false,
}: EmailStepAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getStagedAttachments,
    stageAttachment,
    removeStagedAttachment,
  } = useEmailAttachmentStaging();

  const queryKey =
    ownerId != null
      ? `emailAttachments.${ownerType}.${ownerId}.${stepOrder}`
      : `emailAttachments.disabled.${ownerType}.${stepOrder}`;

  const { data, error: fetchError, refetch } = useApiQuery<EmailStepAttachment[]>(
    queryKey,
    () =>
      ownerType === 'campaign'
        ? emailAttachmentService.listCampaignStepAttachments(ownerId!, stepOrder)
        : emailAttachmentService.listTemplateStepAttachments(ownerId!, stepOrder),
    { enabled: Boolean(ownerId) },
  );

  const attachments = data ?? [];
  const stagedAttachments = getStagedAttachments(stepOrder);
  const totalCount = attachments.length + stagedAttachments.length;

  async function handleFileSelect(files: FileList | null) {
    if (!files || disabled) {
      return;
    }

    setError(null);

    for (const file of Array.from(files)) {
      if (totalCount >= MAX_ATTACHMENTS_PER_STEP) {
        setError(`Each email step can have at most ${MAX_ATTACHMENTS_PER_STEP} attachments`);
        break;
      }

      if (!isAllowedAttachmentFile(file)) {
        setError(
          'Unsupported file. Allowed: PDF, Word, Excel, PNG, JPG, GIF up to 5 MB.',
        );
        continue;
      }

      if (!ownerId) {
        stageAttachment(stepOrder, file);
        continue;
      }

      setIsUploading(true);

      try {
        if (ownerType === 'campaign') {
          await emailAttachmentService.uploadCampaignStepAttachment(
            ownerId,
            stepOrder,
            file,
          );
        } else {
          await emailAttachmentService.uploadTemplateStepAttachment(
            ownerId,
            stepOrder,
            file,
          );
        }
        await refetch();
      } catch {
        setError('Unable to upload attachment');
      } finally {
        setIsUploading(false);
      }
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleRemoveUploaded(attachmentId: string) {
    setError(null);

    try {
      await emailAttachmentService.deleteAttachment(attachmentId);
      await refetch();
    } catch {
      setError('Unable to remove attachment');
    }
  }

  const displayError = error ?? fetchError;

  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Attachments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Optional files included when this email is sent.
          {!ownerId ? ' They will upload when you save the draft.' : ''}
        </Typography>
      </Stack>

      <Box
        component="label"
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border bg-background px-4 py-5 transition-colors ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          disabled={disabled || isUploading || totalCount >= MAX_ATTACHMENTS_PER_STEP}
          accept={ALLOWED_ATTACHMENT_EXTENSIONS.join(',')}
          onChange={(event) => void handleFileSelect(event.target.files)}
        />
        {isUploading ? (
          <CircularProgress size={18} />
        ) : (
          <AttachFileIcon fontSize="small" className="text-text-secondary" />
        )}
        <Typography variant="body2" color="text.secondary">
          {totalCount >= MAX_ATTACHMENTS_PER_STEP
            ? 'Attachment limit reached'
            : 'Click to attach files'}
        </Typography>
      </Box>

      {displayError ? <Alert severity="error">{displayError}</Alert> : null}

      <Stack spacing={1}>
        {attachments.map((attachment) => (
          <AttachmentRow
            key={attachment.id}
            name={attachment.originalFilename}
            sizeBytes={attachment.sizeBytes}
            onRemove={
              disabled
                ? undefined
                : () => void handleRemoveUploaded(attachment.id)
            }
          />
        ))}

        {stagedAttachments.map((attachment) => (
          <AttachmentRow
            key={attachment.id}
            name={attachment.file.name}
            sizeBytes={attachment.file.size}
            pending
            onRemove={
              disabled
                ? undefined
                : () => removeStagedAttachment(stepOrder, attachment.id)
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}

function AttachmentRow({
  name,
  sizeBytes,
  pending = false,
  onRemove,
}: {
  name: string;
  sizeBytes: number;
  pending?: boolean;
  onRemove?: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      className="rounded-xl border border-surface-border bg-surface px-3 py-2"
      sx={{ alignItems: 'center' }}
    >
      <AttachFileIcon fontSize="small" className="shrink-0 text-text-secondary" />
      <Box className="min-w-0 flex-1">
        <Typography variant="body2" className="truncate font-medium">
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatAttachmentSize(sizeBytes)}
          {pending ? ' · Pending upload' : ''}
        </Typography>
      </Box>
      {onRemove ? (
        <IconButton size="small" aria-label={`Remove ${name}`} onClick={onRemove}>
          <CloseIcon fontSize="small" />
        </IconButton>
      ) : null}
    </Stack>
  );
}
