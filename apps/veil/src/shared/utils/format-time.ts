export const formatTimeRemaining = (seconds: number): string => {
  // Convert to switch state to include hour and day states
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  } else {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
};
