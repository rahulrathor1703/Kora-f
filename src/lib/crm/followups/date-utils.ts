function parseFollowUpDate(iso: string): Date | null {
  const dateValue = new Date(iso);
  if (Number.isNaN(dateValue.getTime())) {
    return null;
  }

  return dateValue;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatFollowUpDate(iso: string): string {
  const dateValue = parseFollowUpDate(iso);
  if (!dateValue) {
    return '—';
  }

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDateInputValue(iso: string): string {
  return formatFollowUpDate(iso);
}

export function getFollowUpRelativeLabel(iso: string): string {
  const dateValue = parseFollowUpDate(iso);
  if (!dateValue) {
    return '';
  }

  const today = startOfLocalDay(new Date());
  const due = startOfLocalDay(dateValue);
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`;
  }

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  if (diffDays <= 7) {
    return `In ${diffDays} days`;
  }

  return '';
}

export function getFollowUpUrgencyColor(iso: string): string | null {
  const dateValue = parseFollowUpDate(iso);
  if (!dateValue) {
    return null;
  }

  const today = startOfLocalDay(new Date());
  const due = startOfLocalDay(dateValue);
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return '#ef4444';
  }

  if (diffDays === 0) {
    return '#f59e0b';
  }

  return null;
}

export function formatFollowUpCount(total: number): string {
  const label = total === 1 ? 'follow-up' : 'follow-ups';
  return `${total} ${label}`;
}
