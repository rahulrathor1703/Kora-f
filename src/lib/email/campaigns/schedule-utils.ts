export const DEFAULT_DAILY_BATCH_SIZE = 50;
export const DEFAULT_SENDING_WINDOW_START_MINUTES = 9 * 60;
export const DEFAULT_SENDING_WINDOW_END_MINUTES = 17 * 60;
export const DEFAULT_ACTIVE_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
] as const;

const WEEKDAY_SHORT_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABEL_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface TimezoneOption {
  value: string;
  label: string;
  offsetLabel: string;
}

interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function getZonedDateParts(date: Date, timezone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour === '24' ? '0' : lookup.hour),
    minute: Number(lookup.minute),
  };
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function createDateInTimezone(
  dateKey: string,
  minutesFromMidnight: number,
  timezone: string,
): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;

  let candidate = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const parts = getZonedDateParts(new Date(candidate), timezone);
    const desiredTotalMinutes = hour * 60 + minute;
    const actualTotalMinutes = parts.hour * 60 + parts.minute;
    const dayOffset =
      parts.year * 372 +
      parts.month * 31 +
      parts.day -
      (year * 372 + month * 31 + day);
    const diffMinutes =
      dayOffset * 24 * 60 + (actualTotalMinutes - desiredTotalMinutes);

    if (diffMinutes === 0) {
      return new Date(candidate);
    }

    candidate -= diffMinutes * 60 * 1000;
  }

  return new Date(candidate);
}

export function resolveActiveWeekdays(
  activeWeekdays: number[] | null | undefined,
): number[] {
  if (!activeWeekdays || activeWeekdays.length === 0) {
    return [...DEFAULT_ACTIVE_WEEKDAYS];
  }

  return [...new Set(activeWeekdays)].sort((left, right) => left - right);
}

function getWeekdayInTimezone(date: Date, timezone: string): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date);

  return WEEKDAY_LABEL_TO_INDEX[weekday] ?? 0;
}

function isActiveWeekday(
  date: Date,
  activeWeekdays: number[],
  timezone: string,
): boolean {
  return activeWeekdays.includes(getWeekdayInTimezone(date, timezone));
}

function addActiveDays(
  startDateKey: string,
  activeDaysToAdd: number,
  activeWeekdays: number[],
  timezone: string,
): string {
  let currentKey = startDateKey;
  let found = 0;

  while (found < activeDaysToAdd) {
    const candidate = createDateInTimezone(currentKey, 0, timezone);
    if (isActiveWeekday(candidate, activeWeekdays, timezone)) {
      found += 1;
      if (found >= activeDaysToAdd) {
        return currentKey;
      }
    }

    currentKey = addDaysToDateKey(currentKey, 1);
  }

  return currentKey;
}

function getTimezoneOffsetMinutes(timezone: string, date = new Date()): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const offsetLabel =
    formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')
      ?.value ?? 'GMT';

  const match = offsetLabel.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) {
    return 0;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');
  return sign * (hours * 60 + minutes);
}

function getTimezoneOffsetLabel(timezone: string, date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });

  return (
    formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')
      ?.value ?? 'GMT'
  );
}

export function buildTimezoneOptions(
  preferredTimezone = getDefaultTimezone(),
): TimezoneOption[] {
  const now = new Date();
  const timezones = Intl.supportedValuesOf('timeZone');

  const options = timezones.map((timezone) => ({
    value: timezone,
    label: timezone.replace(/_/g, ' '),
    offsetLabel: getTimezoneOffsetLabel(timezone, now),
    offsetMinutes: getTimezoneOffsetMinutes(timezone, now),
  }));

  options.sort((left, right) => {
    if (left.offsetMinutes !== right.offsetMinutes) {
      return left.offsetMinutes - right.offsetMinutes;
    }

    return left.label.localeCompare(right.label);
  });

  const preferred = options.find((option) => option.value === preferredTimezone);
  const remaining = options.filter(
    (option) => option.value !== preferredTimezone,
  );

  return preferred ? [preferred, ...remaining] : options;
}

export function formatTimezoneLabel(
  timezone: string,
  options = buildTimezoneOptions(),
): string {
  const match = options.find((option) => option.value === timezone);
  if (!match) {
    return timezone.replace(/_/g, ' ');
  }

  return `${match.label} (${match.offsetLabel})`;
}

export function formatActiveWeekdays(activeWeekdays: number[]): string {
  const resolved = resolveActiveWeekdays(activeWeekdays);

  if (resolved.length === 7) {
    return 'Every day';
  }

  if (
    resolved.length === 5 &&
    resolved.every((day) => day >= 1 && day <= 5)
  ) {
    return 'Mon–Fri';
  }

  return resolved.map((day) => WEEKDAY_SHORT_LABELS[day]).join(', ');
}

export function computeEstimatedEndDateLabel(
  launchDate: string | undefined,
  audienceCount: number,
  dailyBatchSize: number,
  windowEndMinutes: number,
  timezone: string,
  activeWeekdays: number[] = [...DEFAULT_ACTIVE_WEEKDAYS],
): string {
  if (!launchDate || audienceCount <= 0 || dailyBatchSize <= 0) {
    return 'Set launch date, select a list, and set daily batch size to auto-calculate.';
  }

  const daysNeeded = Math.max(1, Math.ceil(audienceCount / dailyBatchSize));
  const endDateKey = addActiveDays(
    launchDate,
    daysNeeded,
    resolveActiveWeekdays(activeWeekdays),
    timezone,
  );
  const endDate = createDateInTimezone(endDateKey, windowEndMinutes, timezone);

  return endDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMinutesAsTime(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function formatSendingWindowDuration(
  startMinutes: number,
  endMinutes: number,
): string {
  const hours = Math.max(0, Math.round((endMinutes - startMinutes) / 60));
  return `${formatMinutesAsTime(startMinutes)} – ${formatMinutesAsTime(endMinutes)} · ${hours}h window`;
}

export function buildSendingWindowOptions(): Array<{
  value: number;
  label: string;
}> {
  const options: Array<{ value: number; label: string }> = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    options.push({
      value: minutes,
      label: formatMinutesAsTime(minutes),
    });
  }

  return options;
}

export function getDefaultTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getTodayDateInputValue(timezone = getDefaultTimezone()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}
