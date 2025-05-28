import { pluralize } from '@/shared/utils/pluralize';

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) {
    return pluralize(seconds, 'second', 'seconds');
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return pluralize(minutes, 'minute', 'minutes');
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return pluralize(hours, 'hour', 'hours');
  } else {
    const days = Math.floor(seconds / 86400);
    return pluralize(days, 'day', 'days');
  }
};
