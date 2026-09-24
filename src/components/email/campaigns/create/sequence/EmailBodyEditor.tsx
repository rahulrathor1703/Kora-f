'use client';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import RichTextEmailEditor, {
  renderSanitizedEmailPreview,
  type RichTextEmailEditorHandle,
} from '@/components/email/campaigns/create/sequence/RichTextEmailEditor';
import { hasEmailBodyContent } from '@/lib/email/campaigns/email-body-html';
import { insertAtCursor } from '@/lib/email/campaigns/merge-tags';

type EditorMode = 'text' | 'html' | 'ai' | 'preview';

export interface EmailBodyEditorHandle {
  insertAtCursor: (content: string) => void;
  focus: () => void;
}

interface EmailBodyEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  headerAction?: React.ReactNode;
}

const modeToggleSx = {
  gap: '2px',
  '& .MuiToggleButtonGroup-grouped': {
    border: 0,
    borderRadius: '9999px !important',
    borderLeft: 'none !important',
    px: 1.75,
    py: 0.625,
    mx: 0,
    minWidth: 56,
    fontSize: '0.8125rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: 'text.secondary',
    textTransform: 'none',
    transition:
      'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
    '&.Mui-selected': {
      bgcolor: 'background.paper',
      color: 'text.primary',
      fontWeight: 600,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
      '&:hover': {
        bgcolor: 'background.paper',
      },
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
  },
} as const;

const aiToggleSx = {
  gap: 0.5,
  px: 1.5,
  py: 0.625,
  minHeight: 0,
  fontSize: '0.8125rem',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '9999px',
  border: '1px solid',
  transition:
    'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
  '&.Mui-selected': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderColor: 'primary.main',
    fontWeight: 600,
    boxShadow: '0 1px 3px color-mix(in srgb, var(--color-primary) 35%, transparent)',
    '&:hover': {
      bgcolor: 'primary.dark',
      borderColor: 'primary.dark',
    },
  },
  '&:not(.Mui-selected)': {
    color: 'primary.main',
    borderColor: 'color-mix(in srgb, var(--color-primary) 22%, var(--surface-border))',
    bgcolor: 'color-mix(in srgb, var(--color-primary) 7%, var(--surface))',
    '&:hover': {
      bgcolor: 'color-mix(in srgb, var(--color-primary) 12%, var(--surface))',
      borderColor: 'color-mix(in srgb, var(--color-primary) 32%, var(--surface-border))',
    },
  },
} as const;

const EmailBodyEditor = forwardRef<EmailBodyEditorHandle, EmailBodyEditorProps>(
  function EmailBodyEditor({ id, value, onChange, error, headerAction }, ref) {
    const [mode, setMode] = useState<EditorMode>('text');
    const editorRef = useRef<RichTextEmailEditorHandle>(null);
    const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        insertAtCursor(content: string) {
          if (mode === 'text') {
            editorRef.current?.insertAtCursor(content);
            return;
          }

          if (mode === 'html') {
            const textarea = htmlTextareaRef.current;
            const { nextValue, nextCursor } = insertAtCursor(
              value,
              content,
              textarea?.selectionStart ?? value.length,
              textarea?.selectionEnd ?? value.length,
            );

            onChange(nextValue);

            requestAnimationFrame(() => {
              textarea?.focus();
              textarea?.setSelectionRange(nextCursor, nextCursor);
            });
          }
        },
        focus() {
          if (mode === 'text') {
            editorRef.current?.focus();
            return;
          }

          if (mode === 'html') {
            htmlTextareaRef.current?.focus();
          }
        },
      }),
      [mode, onChange, value],
    );

    return (
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="caption" color="text.secondary">
            Email body *
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
            className="shrink-0"
          >
            {headerAction}

            {headerAction ? (
              <Box
                aria-hidden
                sx={{
                  width: '1px',
                  height: 22,
                  bgcolor: 'divider',
                  flexShrink: 0,
                }}
              />
            ) : null}

            <Tooltip title="Draft with AI">
              <ToggleButton
                value="ai"
                selected={mode === 'ai'}
                onClick={() => setMode('ai')}
                size="small"
                aria-label="AI editor"
                sx={aiToggleSx}
              >
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />
                AI
              </ToggleButton>
            </Tooltip>

            <Box
              aria-hidden
              sx={{
                width: '1px',
                height: 22,
                bgcolor: 'divider',
                flexShrink: 0,
              }}
            />

            <Box
              className="inline-flex shrink-0 rounded-full border border-surface-border p-0.5"
              sx={{
                bgcolor: 'color-mix(in srgb, var(--color-primary) 4%, var(--surface))',
              }}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={mode === 'ai' ? null : mode}
                onChange={(_, nextMode: Exclude<EditorMode, 'ai'> | null) => {
                  if (nextMode) {
                    setMode(nextMode);
                  }
                }}
                aria-label="Email body editor mode"
                sx={modeToggleSx}
              >
                <Tooltip title="Rich text editor">
                  <ToggleButton value="text" aria-label="Text editor">
                    Text
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Edit raw HTML">
                  <ToggleButton value="html" aria-label="HTML editor">
                    HTML
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="See rendered email">
                  <ToggleButton value="preview" aria-label="Preview">
                    Preview
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Stack>

        {mode === 'text' ? (
          <RichTextEmailEditor
            ref={editorRef}
            id={id}
            value={value}
            onChange={onChange}
            error={error}
          />
        ) : null}

        {mode === 'html' ? (
          <Stack spacing={0.5}>
            <TextField
              id={id}
              inputRef={htmlTextareaRef}
              multiline
              minRows={8}
              fullWidth
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="<p>Hello {{first_name}},</p>"
              error={Boolean(error)}
              slotProps={{
                htmlInput: {
                  className: 'font-mono text-sm',
                  spellCheck: 'false',
                  'aria-label': 'Email body HTML',
                },
              }}
              className="rounded-xl"
            />
            {error ? (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        {mode === 'ai' ? (
          <Box
            className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-background px-6 py-10 text-center"
            aria-labelledby={id}
          >
            <Box className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AutoAwesomeOutlinedIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle2" className="mb-1">
              Draft with AI
            </Typography>
            <Typography variant="body2" color="text.secondary" className="max-w-sm">
              Describe the email you want to send and AI will draft it for you.
              Coming soon.
            </Typography>
          </Box>
        ) : null}

        {mode === 'preview' ? (
          <Stack spacing={0.5}>
            <Box
              className={`min-h-48 rounded-xl border border-surface-border bg-background px-4 py-3 ${
                error ? 'border-error' : ''
              }`}
              aria-labelledby={id}
            >
              {hasEmailBodyContent(value) ? (
                <Box
                  className="email-body-content max-w-none text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: renderSanitizedEmailPreview(value),
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nothing to preview yet.
                </Typography>
              )}
            </Box>
            {error ? (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    );
  },
);

export default EmailBodyEditor;
