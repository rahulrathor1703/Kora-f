import { DateTime } from 'luxon';

const DEFAULT_DURATION_MINUTES = 30;

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function buildDefaultMeetingWindow(
  reference = DateTime.now(),
): { startAt: DateTime; endAt: DateTime } {
  const roundedStart = roundUpToNextHalfHour(reference);
  return {
    startAt: roundedStart,
    endAt: roundedStart.plus({ minutes: DEFAULT_DURATION_MINUTES }),
  };
}

export function roundUpToNextHalfHour(value: DateTime): DateTime {
  const minute = value.minute;
  const remainder = minute % 30;

  if (remainder === 0 && value.second === 0 && value.millisecond === 0) {
    return value.startOf('minute');
  }

  const minutesToAdd = remainder === 0 ? 30 : 30 - remainder;
  return value.plus({ minutes: minutesToAdd }).startOf('minute');
}

export function toIsoDateTime(value: DateTime): string {
  const iso = value.toUTC().toISO();
  if (!iso) {
    throw new Error('Invalid date/time value');
  }

  return iso;
}

export function formatCalendarDayLabel(value: DateTime): string {
  return value.toFormat('ccc, d LLL yyyy');
}

export function formatCalendarTime(value: DateTime): string {
  return value.toFormat('h:mm a');
}

export function formatCalendarRange(startAt: string, endAt: string): string {
  const start = DateTime.fromISO(startAt);
  const end = DateTime.fromISO(endAt);

  if (!start.isValid || !end.isValid) {
    return 'Not scheduled';
  }

  return `${start.toFormat('ccc dd/LL/yy h:mm a')} - ${end.toFormat('h:mm a')}`;
}

export function startOfDayIso(value: DateTime): string {
  const iso = value.startOf('day').toUTC().toISO();
  if (!iso) {
    throw new Error('Invalid date value');
  }

  return iso;
}

export function endOfDayIso(value: DateTime): string {
  const iso = value.endOf('day').toUTC().toISO();
  if (!iso) {
    throw new Error('Invalid date value');
  }

  return iso;
}

export function startOfWeek(value: DateTime): DateTime {
  return value.startOf('week');
}

export function endOfWeek(value: DateTime): DateTime {
  return value.endOf('week');
}

export const CALENDAR_DAY_START_HOUR = 8;
export const CALENDAR_DAY_END_HOUR = 20;
export const CALENDAR_HOUR_HEIGHT_PX = 48;

export function buildHourLabels(): number[] {
  const hours: number[] = [];
  for (
    let hour = CALENDAR_DAY_START_HOUR;
    hour <= CALENDAR_DAY_END_HOUR;
    hour += 1
  ) {
    hours.push(hour);
  }
  return hours;
}

export function getEventBlockStyle(
  startAt: string,
  endAt: string,
  day: DateTime,
): { top: number; height: number } | null {
  const start = DateTime.fromISO(startAt).setZone(day.zone);
  const end = DateTime.fromISO(endAt).setZone(day.zone);
  const dayStart = day.startOf('day').set({
    hour: CALENDAR_DAY_START_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const dayEnd = day.startOf('day').set({
    hour: CALENDAR_DAY_END_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  if (end <= dayStart || start >= dayEnd) {
    return null;
  }

  const visibleStart = start < dayStart ? dayStart : start;
  const visibleEnd = end > dayEnd ? dayEnd : end;
  const minutesFromStart = visibleStart.diff(dayStart, 'minutes').minutes;
  const durationMinutes = Math.max(
    15,
    visibleEnd.diff(visibleStart, 'minutes').minutes,
  );

  return {
    top: (minutesFromStart / 60) * CALENDAR_HOUR_HEIGHT_PX,
    height: Math.max(24, (durationMinutes / 60) * CALENDAR_HOUR_HEIGHT_PX),
  };
}
