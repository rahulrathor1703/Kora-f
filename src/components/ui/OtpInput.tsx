'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
} from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  idPrefix?: string;
}

const OTP_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  idPrefix = 'otp',
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

  const focusInput = useCallback((index: number) => {
    const input = inputRefs.current[index];
    input?.focus();
    input?.select();
  }, []);

  const updateValue = useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join('').slice(0, OTP_LENGTH));
    },
    [onChange],
  );

  function handleChange(index: number, nextChar: string) {
    const sanitized = nextChar.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    updateValue(nextDigits);

    if (sanitized && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    onChange(pasted);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <Box className="signup-otp-input" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <Box
          key={index}
          component="input"
          ref={(element: HTMLInputElement | null) => {
            inputRefs.current[index] = element;
          }}
          id={`${idPrefix}-${index}`}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          className="signup-otp-digit"
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
        />
      ))}
      <Typography variant="caption" className="sr-only">
        Enter the 6-digit verification code
      </Typography>
    </Box>
  );
}
