'use client';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'isomorphic-dompurify';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import {
  EMAIL_BODY_ALLOWED_HTML_ATTR,
  EMAIL_BODY_ALLOWED_HTML_TAGS,
  normalizeEmailBodyHtml,
  plainTextToHtml,
} from '@/lib/email/campaigns/email-body-html';
import { renderMergeTagPreview } from '@/lib/email/campaigns/merge-tags';

export interface RichTextEmailEditorHandle {
  insertAtCursor: (content: string) => void;
  focus: () => void;
}

interface RichTextEmailEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const RichTextEmailEditor = forwardRef<
  RichTextEmailEditorHandle,
  RichTextEmailEditorProps
>(function RichTextEmailEditor(
  {
    id,
    value,
    onChange,
    error,
    placeholder = 'Write your email...',
    readOnly = false,
  },
  ref,
) {
  const initialContent = plainTextToHtml(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        id,
        class:
          'email-body-content min-h-48 px-4 py-3 outline-none max-w-none text-foreground',
        'aria-label': 'Email body',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const normalizedValue = normalizeEmailBodyHtml(value);
    const currentHtml = editor.getHTML();

    if (normalizedValue !== currentHtml) {
      editor.commands.setContent(normalizedValue, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useImperativeHandle(ref, () => ({
    insertAtCursor(content: string) {
      editor?.chain().focus().insertContent(content).run();
    },
    focus() {
      editor?.chain().focus().run();
    },
  }));

  function toggleLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter link URL', previousUrl ?? 'https://');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  if (!editor) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      {!readOnly ? (
        <Stack
          direction="row"
          spacing={0.25}
          className="rounded-t-xl border border-b-0 border-surface-border bg-surface px-1 py-1"
        >
          <Tooltip title="Bold">
            <IconButton
              size="small"
              aria-label="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-primary-soft text-primary' : ''}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              size="small"
              aria-label="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-primary-soft text-primary' : ''}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton
              size="small"
              aria-label="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={
                editor.isActive('underline') ? 'bg-primary-soft text-primary' : ''
              }
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton
              size="small"
              aria-label="Link"
              onClick={toggleLink}
              className={editor.isActive('link') ? 'bg-primary-soft text-primary' : ''}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 1">
            <IconButton
              size="small"
              aria-label="Heading 1"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive('heading', { level: 1 })
                  ? 'bg-primary-soft text-primary'
                  : ''
              }
            >
              <TitleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet list">
            <IconButton
              size="small"
              aria-label="Bullet list"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={
                editor.isActive('bulletList') ? 'bg-primary-soft text-primary' : ''
              }
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered list">
            <IconButton
              size="small"
              aria-label="Numbered list"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={
                editor.isActive('orderedList') ? 'bg-primary-soft text-primary' : ''
              }
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : null}

      <Box
        className={`rounded-b-xl border border-surface-border bg-background ${
          readOnly ? 'rounded-t-xl' : ''
        } ${error ? 'border-error' : ''}`}
      >
        <EditorContent editor={editor} />
      </Box>

      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
});

export function renderSanitizedEmailPreview(html: string): string {
  const withMergeTags = renderMergeTagPreview(html);
  return DOMPurify.sanitize(withMergeTags, {
    ALLOWED_TAGS: [...EMAIL_BODY_ALLOWED_HTML_TAGS],
    ALLOWED_ATTR: [...EMAIL_BODY_ALLOWED_HTML_ATTR],
  });
}

export default RichTextEmailEditor;
