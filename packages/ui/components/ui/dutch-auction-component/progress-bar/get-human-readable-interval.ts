const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;

export const getHumanReadableInterval = (seconds: number): string => {
  const parts: string[] = [];
  const days = seconds / DAY_IN_SECONDS;
  const daysRounded = Math.floor(days);
  if (days >= 1) parts.push(`${daysRounded}d`);
  if (days === daysRounded) return parts.join(' ');

  let remainder = seconds % DAY_IN_SECONDS;

  const hours = remainder / HOUR_IN_SECONDS;
  const hoursRounded = Math.floor(hours);
  if (hours >= 1) parts.push(`${hoursRounded}h`);
  if (hours === hoursRounded) return parts.join(' ');
  remainder = remainder % HOUR_IN_SECONDS;

  const minutes = remainder / MINUTE_IN_SECONDS;
  const minutesRounded = Math.floor(minutes);
  if (minutes >= 1) parts.push(`${minutesRounded}m`);
  if (minutes === minutesRounded) return parts.join(' ');
  remainder = remainder % MINUTE_IN_SECONDS;

  if (remainder >= 1) parts.push(`${remainder}s`);
  return parts.join(' ');
};
