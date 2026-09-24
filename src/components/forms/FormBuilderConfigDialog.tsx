'use client';

import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useId, useState } from 'react';

export type FormBuilderConfigDialogTab = 'properties' | 'validation' | 'conditions';

export type FormBuilderFieldLockHeaderState =
  | { kind: 'platform' }
  | { kind: 'toggle'; locked: boolean; onToggle: () => void };

interface FormBuilderConfigDialogProps {
  open: boolean;
  title: string;
  subtitle?: string;
  /** Sections show properties only; fields show properties + validation tabs. */
  kind: 'section' | 'field';
  confirmLabel: string;
  confirmDisabled?: boolean;
  /** @deprecated Use `fieldLockHeader` */
  showLockIcon?: boolean;
  fieldLockHeader?: FormBuilderFieldLockHeaderState;
  onClose: () => void;
  onConfirm: () => void;
  propertiesContent: ReactNode;
  validationContent?: ReactNode;
  conditionsContent?: ReactNode;
}

function ConfigDialogTabButton({
  active,
  label,
  tabId,
  panelId,
  onClick,
}: {
  active: boolean;
  label: string;
  tabId: string;
  panelId: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={[
        'relative flex-1 px-2 py-3.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35',
        active ? 'text-primary' : 'text-slate-500 hover:text-slate-800',
      ].join(' ')}
    >
      {label}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primary"
        />
      ) : null}
    </button>
  );
}

function FormBuilderConfigDialogContent({
  title,
  subtitle,
  kind,
  confirmLabel,
  confirmDisabled = false,
  showLockIcon = false,
  fieldLockHeader,
  onClose,
  onConfirm,
  propertiesContent,
  validationContent,
  conditionsContent,
}: Omit<FormBuilderConfigDialogProps, 'open'>) {
  const [activeTab, setActiveTab] =
    useState<FormBuilderConfigDialogTab>('properties');
  const showFieldTabs = kind === 'field';
  const titleId = useId();
  const tabBaseId = useId();

  const tabBody =
    activeTab === 'properties'
      ? propertiesContent
      : activeTab === 'validation'
        ? validationContent
        : conditionsContent;

  const panelId = `${tabBaseId}-panel`;
  const propertiesTabId = `${tabBaseId}-properties`;
  const validationTabId = `${tabBaseId}-validation`;
  const conditionsTabId = `${tabBaseId}-conditions`;

  const lockHeaderNode =
    fieldLockHeader?.kind === 'platform' || showLockIcon ? (
      <Tooltip title="Platform field — read-only in organization mode">
        <span className="inline-flex">
          <LockOutlinedIcon
            className="text-slate-400"
            fontSize="small"
            aria-label="Read-only field"
          />
        </span>
      </Tooltip>
    ) : fieldLockHeader?.kind === 'toggle' ? (
      <Tooltip
        title={
          fieldLockHeader.locked
            ? 'Unlock field — allow editing and layout changes'
            : 'Lock field — prevent editing and layout changes'
        }
      >
        <IconButton
          size="small"
          aria-pressed={fieldLockHeader.locked}
          aria-label={
            fieldLockHeader.locked ? 'Unlock field' : 'Lock field'
          }
          onClick={fieldLockHeader.onToggle}
          className={
            fieldLockHeader.locked
              ? 'text-primary hover:bg-primary/8'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }
        >
          {fieldLockHeader.locked ? (
            <LockOutlinedIcon fontSize="small" />
          ) : (
            <LockOpenOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    ) : null;

  return (
    <>
      <Box className="border-b border-slate-200/90 bg-white">
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          className="px-6 pb-0 pt-5"
        >
          <Typography
            id={titleId}
            variant="h6"
            component="h2"
            className="min-w-0 flex-1 text-[17px] font-semibold tracking-tight text-slate-900"
          >
            {title}
          </Typography>
          {lockHeaderNode ? (
            <Box className="flex shrink-0 items-center">{lockHeaderNode}</Box>
          ) : null}
        </Stack>

        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            className="px-6 pb-2 pt-1.5 text-[13px] leading-relaxed"
          >
            {subtitle}
          </Typography>
        ) : null}

        {showFieldTabs ? (
          <Box
            role="tablist"
            aria-label="Field configuration"
            className="mt-1 flex border-t border-slate-100 px-2"
          >
            <ConfigDialogTabButton
              active={activeTab === 'properties'}
              label="Properties"
              tabId={propertiesTabId}
              panelId={panelId}
              onClick={() => setActiveTab('properties')}
            />
            <ConfigDialogTabButton
              active={activeTab === 'validation'}
              label="Validation"
              tabId={validationTabId}
              panelId={panelId}
              onClick={() => setActiveTab('validation')}
            />
            <ConfigDialogTabButton
              active={activeTab === 'conditions'}
              label="Conditions"
              tabId={conditionsTabId}
              panelId={panelId}
              onClick={() => setActiveTab('conditions')}
            />
          </Box>
        ) : null}
      </Box>

      <Box
        id={panelId}
        role={showFieldTabs ? 'tabpanel' : undefined}
        aria-labelledby={
          showFieldTabs
            ? activeTab === 'properties'
              ? propertiesTabId
              : activeTab === 'validation'
                ? validationTabId
                : conditionsTabId
            : undefined
        }
        className="min-h-[280px] max-h-[min(56vh,440px)] overflow-y-auto bg-white px-6 py-6"
      >
        {showFieldTabs ? tabBody : propertiesContent}
      </Box>

      <Stack
        direction="row"
        spacing={1.25}
        sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
        className="border-t border-slate-200/90 bg-slate-50/40 px-6 py-4"
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          className="min-w-[96px] rounded-xl normal-case"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className="min-w-[96px] rounded-xl px-5 normal-case shadow-none"
        >
          {confirmLabel}
        </Button>
      </Stack>
    </>
  );
}

export default function FormBuilderConfigDialog({
  open,
  title,
  ...rest
}: FormBuilderConfigDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={rest.onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="form-builder-config-dialog-title"
      slots={{ transition: Fade }}
      slotProps={{
        transition: { timeout: 200 },
        backdrop: {
          className: 'bg-slate-900/40 backdrop-blur-[2px]',
        },
        paper: {
          className: [
            'overflow-hidden rounded-2xl border border-slate-200/90',
            'shadow-[0_20px_60px_rgba(15,23,42,0.14)]',
          ].join(' '),
        },
      }}
    >
      {open ? (
        <FormBuilderConfigDialogContent key={title} title={title} {...rest} />
      ) : null}
    </Dialog>
  );
}
