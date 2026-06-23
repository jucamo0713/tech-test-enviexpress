import { Timezone } from '@shared/domain/models/value-objects/string/timezone';

export const formatScheduledAt = (
  scheduledAt: Date,
  timezone?: Timezone,
): { date: string; hour: string } => {
  const timeZone = timezone?.toString() ?? Timezone.UTC.toString();
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(scheduledAt);
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(scheduledAt);

  return { date, hour };
};
