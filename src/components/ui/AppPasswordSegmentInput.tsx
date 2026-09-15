'use client';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { MAILBOX_APP_PASSWORD_SEGMENT_LENGTHS } from '@/lib/email/mailbox-providers';

const DEFAULT_SEGMENT_LENGTHS = MAILBOX_APP_PASSWORD_SEGMENT_LENGTHS.gmail;

interface AppPasswordSegmentInputProps {
  value: string;
  onChange: (value: string) => void;
  segmentLengths?: readonly number[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  labelAdornment?: ReactNode;
  idPrefix?: string;
}

function getAppPasswordLength(segmentLengths: readonly number[]): number {
  return segmentLengths.reduce((sum, length) => sum + length, 0);
}

function normalizeAppPassword(
  value: string,
  appPasswordLength: number,
): string {
  return value.replace(/[\s-]/g, '').toLowerCase().slice(0, appPasswordLength);
}

function splitIntoSegments(
  value: string,
  segmentLengths: readonly number[],
  appPasswordLength: number,
): string[] {
  const normalized = normalizeAppPassword(value, appPasswordLength);
  let cursor = 0;

  return segmentLengths.map((length) => {
    const segment = normalized.slice(cursor, cursor + length);
    cursor += length;
    return segment;
  });
}

function segmentGridColumns(segmentLengths: readonly number[]): string {
  return segmentLengths.map((length) => `${length}fr`).join(' ');
}

export default function AppPasswordSegmentInput({
  value,
  onChange,
  segmentLengths = DEFAULT_SEGMENT_LENGTHS,
  disabled = false,
  error = false,
  helperText,
  label = 'App password',
  labelAdornment,
  idPrefix = 'app-password',
}: AppPasswordSegmentInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const appPasswordLength = useMemo(
    () => getAppPasswordLength(segmentLengths),
    [segmentLengths],
  );
  const segments = splitIntoSegments(value, segmentLengths, appPasswordLength);
  const labelId = `${idPrefix}-label`;

  const focusInput = useCallback((index: number) => {
    const input = inputRefs.current[index];
    input?.focus();
    input?.select();
  }, []);

  const updateFromSegments = useCallback(
    (nextSegments: string[]) => {
      onChange(nextSegments.join('').slice(0, appPasswordLength));
    },
    [appPasswordLength, onChange],
  );

  function handleChange(index: number, nextValue: string) {
    const maxLength = segmentLengths[index] ?? 4;
    const sanitized = nextValue.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const nextSegments = [...segments];

    if (sanitized.length > maxLength) {
      const overflow = sanitized.slice(maxLength);
      nextSegments[index] = sanitized.slice(0, maxLength);
      let cursor = index + 1;

      for (const char of overflow) {
        if (cursor >= segmentLengths.length) {
          break;
        }

        const segmentMax = segmentLengths[cursor] ?? 4;
        nextSegments[cursor] = `${nextSegments[cursor] ?? ''}${char}`.slice(
          0,
          segmentMax,
        );

        if ((nextSegments[cursor]?.length ?? 0) >= segmentMax) {
          cursor += 1;
        }
      }

      updateFromSegments(nextSegments);
      focusInput(Math.min(cursor, segmentLengths.length - 1));
      return;
    }

    nextSegments[index] = sanitized;
    updateFromSegments(nextSegments);

    if (sanitized.length === maxLength && index < segmentLengths.length - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !segments[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < segmentLengths.length - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = normalizeAppPassword(
      event.clipboardData.getData('text'),
      appPasswordLength,
    );

    if (!pasted) {
      return;
    }

    onChange(pasted);

    let remaining = pasted.length;
    let focusIndex = 0;

    for (let index = 0; index < segmentLengths.length; index += 1) {
      const segmentLength = segmentLengths[index] ?? 4;
      if (remaining <= segmentLength) {
        focusIndex = index;
        break;
      }
      remaining -= segmentLength;
      focusIndex = index;
    }

    focusInput(focusIndex);
  }

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
      >
        <InputLabel
          id={labelId}
          shrink
          error={error}
          className="relative block text-sm font-medium text-muted"
        >
          {label}
        </InputLabel>
        {labelAdornment}
      </Stack>
      <Box
        className="app-password-segments"
        role="group"
        aria-labelledby={labelId}
        sx={{ gridTemplateColumns: segmentGridColumns(segmentLengths) }}
      >
        {segments.map((segment, index) => {
          const segmentLength = segmentLengths[index] ?? 4;
          const placeholder = 'x'.repeat(segmentLength);

          return (
            <Box
              key={index}
              component="input"
              ref={(element: HTMLInputElement | null) => {
                inputRefs.current[index] = element;
              }}
              id={`${idPrefix}-${index}`}
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={segmentLength}
              value={segment}
              disabled={disabled}
              placeholder={placeholder}
              aria-invalid={error || undefined}
              aria-label={`App password segment ${index + 1} of ${segmentLengths.length}`}
              className={`app-password-segment app-password-segment-${segmentLength}${error ? ' app-password-segment-error' : ''}`}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              onFocus={(event) => event.currentTarget.select()}
            />
          );
        })}
      </Box>
      {helperText ? (
        <FormHelperText error={error} className="mx-0 mt-1">
          {helperText}
        </FormHelperText>
      ) : null}
    </Box>
  );
}

export const APP_PASSWORD_LENGTH = getAppPasswordLength(DEFAULT_SEGMENT_LENGTHS);
