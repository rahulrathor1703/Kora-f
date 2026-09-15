'use client';

import Box from '@mui/material/Box';
import { getSpamScoreTone } from '@/lib/email/mailbox-deliverability';

function formatSpamScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function getSpamRiskLabel(score: number): string {
  const tone = getSpamScoreTone(score);

  if (tone === 'good') {
    return 'Low risk';
  }

  if (tone === 'moderate') {
    return 'Moderate';
  }

  return 'High risk';
}

interface MailboxSpamRateDisplayProps {
  score: number;
  variant?: 'gauge' | 'compact' | 'stat';
}

export default function MailboxSpamRateDisplay({
  score,
  variant = 'gauge',
}: MailboxSpamRateDisplayProps) {
  const tone = getSpamScoreTone(score);
  const formattedScore = formatSpamScore(score);
  const riskLabel = getSpamRiskLabel(score);

  if (variant === 'compact') {
    return (
      <span
        className={`mailbox-table-spam-score mailbox-table-spam-score-${tone}`}
        aria-label={`Spam score ${formattedScore} out of 10, ${riskLabel}`}
      >
        {formattedScore}
      </span>
    );
  }

  if (variant === 'stat') {
    return (
      <span
        className={`mailbox-stat-spam-score mailbox-table-spam-score-${tone}`}
        aria-label={`Spam score ${formattedScore} out of 10, ${riskLabel}`}
      >
        {formattedScore}
      </span>
    );
  }

  const normalized = Math.min(Math.max(score / 10, 0), 1);
  const radius = 13;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized);
  const center = 18;

  return (
    <Box
      className={`mailbox-spam-panel mailbox-spam-gauge-${tone}`}
      aria-label={`Spam score ${formattedScore} out of 10, ${riskLabel}`}
    >
      <Box className="mailbox-spam-gauge-ring" aria-hidden="true">
        <svg
          viewBox="0 0 36 36"
          width="36"
          height="36"
          className="mailbox-spam-gauge-svg"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="mailbox-spam-gauge-track"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
            className="mailbox-spam-gauge-fill"
          />
        </svg>
        <span className="mailbox-spam-gauge-value">{formattedScore}</span>
      </Box>
      <Box className="mailbox-spam-gauge-copy">
        <p className="mailbox-spam-gauge-title">Spam rate</p>
        <p className="mailbox-spam-gauge-meta">
          {riskLabel}
        </p>
      </Box>
    </Box>
  );
}
